import path from 'path'
import { logger } from '../utils/logger'
import { ProcessingJob, JobStatus, PCMemberAttributes, PersonAttributes, SeniorPCMemberAttributes, ChairAttributes, AuthorAttributes, ReviewAttributes } from '../types'
import { endProcessingJob } from './jobs'
import { readFileSync } from 'fs'
import { read, utils, WorkBook, WorkSheet } from 'xlsx'
import { createAuthors, createChairs, createPCMembers, createPersons, createSeniorPCMembers } from './persons'
import { createAssignments, createSubmissionAuthorships, createSubmissions } from './submissions'
import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { createReviews } from './reviews'
import { createConfidenceScores, createReviewScores } from './scores'
import { processAllMetrics } from './metric-processing'

const COMMITTEE_WORKSHEET_NAME = 'Program committee'
const AUTHORS_WORKSHEET_NAME = 'Authors'
const SUBMISSIONS_WORKSHEET_NAME = 'Submissions'
const SUBMISSION_ASSIGNMENT_WORKSHEET_NAME = 'Submission assignment'
const SCORES_WORKSHEET_NAME = 'Review field scores'
const REVIEWS_WORKSHEET_NAME = 'Reviews'

const PC_MEMBER_ROLE_LABEL = 'PC member'
const SENIOR_PC_MEMBER_ROLE_LABEL = 'senior PC member'
const CHAIR_ROLE_LABEL = 'chair'

export const processFileJob = async (job: ProcessingJob): Promise<void> => {
  logger.log('info', `services::file-processing::processJob: Started processing job ${job.id} for domain ${job.domainId}`)

  try {
    const filePath = path.join(__dirname, '..', '..', 'data', 'uploads', job.subject)
    logger.log('info', `services::file-processing::processJob: Using filePath= ${filePath}`)

    const workbookBuffer: Buffer = readFileSync(filePath)
    const workbook: WorkBook = read(workbookBuffer)

    if (workbook.SheetNames.includes(COMMITTEE_WORKSHEET_NAME) && workbook.SheetNames.includes(AUTHORS_WORKSHEET_NAME)) {
      await processPersons(job, workbook.Sheets[COMMITTEE_WORKSHEET_NAME], workbook.Sheets[AUTHORS_WORKSHEET_NAME])
    }

    if (workbook.SheetNames.includes(SUBMISSIONS_WORKSHEET_NAME) && workbook.SheetNames.includes(AUTHORS_WORKSHEET_NAME)) {
      await processSubmissions(job, workbook.Sheets[SUBMISSIONS_WORKSHEET_NAME], workbook.Sheets[AUTHORS_WORKSHEET_NAME])
    }

    if (workbook.SheetNames.includes(SUBMISSION_ASSIGNMENT_WORKSHEET_NAME)) {
      await processAssignments(job, workbook.Sheets[SUBMISSION_ASSIGNMENT_WORKSHEET_NAME])
    }

    if (workbook.SheetNames.includes(SCORES_WORKSHEET_NAME)) {
      await processScores(job, workbook.Sheets[SCORES_WORKSHEET_NAME])
    }

    if (workbook.SheetNames.includes(REVIEWS_WORKSHEET_NAME)) {
      await processReviews(job, workbook.Sheets[REVIEWS_WORKSHEET_NAME])
    }

    await endProcessingJob(job, JobStatus.COMPLETED, 'Job ended successfully.')

    await processAllMetrics(job.domainId)
  } catch (error) {
    logger.log('info', `services::file-processing::processJob: Raised exception: ${inspect(error, { depth: 4 })}`)
    if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
      await endProcessingJob(job, JobStatus.FAILED, error.original.message)
    } else if (error instanceof Error) {
      await endProcessingJob(job, JobStatus.FAILED, error.message)
    } else {
      await endProcessingJob(job, JobStatus.FAILED, 'Unknown error')
    }
  }
}

const processPersons = async (job: ProcessingJob, committeeWorksheet: WorkSheet, authorsWorksheet: WorkSheet): Promise<void> => {
  logger.log('info', 'services::file-processing::processPersons: Processing committee members and authors worksheets')
  const committeeData = utils.sheet_to_json(committeeWorksheet)
  const authorsData = utils.sheet_to_json(authorsWorksheet)

  const persons: PersonAttributes[] = committeeData.map((obj: any): PersonAttributes => {
    return {
      id: obj['person #'].toString(),
      firstName: obj['first name'].toString(),
      lastName: obj['last name'].toString(),
      domainId: job.domainId
    }
  })

  authorsData.map((obj: any): PersonAttributes => {
    const authorPerson: PersonAttributes = {
      id: obj['person #'].toString(),
      firstName: obj['first name'].toString(),
      lastName: obj['last name'].toString(),
      domainId: job.domainId
    }
    if (persons.findIndex((person: PersonAttributes): boolean => {
      return person.id === authorPerson.id
    }) === -1) {
      persons.push(authorPerson)
    }
    return authorPerson
  })
  await createPersons(persons)

  const pcMembers: PCMemberAttributes[] = committeeData.filter((obj: any): boolean => {
    return [PC_MEMBER_ROLE_LABEL, SENIOR_PC_MEMBER_ROLE_LABEL, CHAIR_ROLE_LABEL].includes(obj.role)
  }).map((obj: any): PCMemberAttributes => {
    return {
      id: obj['#'].toString(),
      personId: obj['person #'].toString()
    }
  })
  await createPCMembers(pcMembers)

  const seniorPcMembers: SeniorPCMemberAttributes[] = committeeData.filter((obj: any): boolean => {
    return [SENIOR_PC_MEMBER_ROLE_LABEL, CHAIR_ROLE_LABEL].includes(obj.role)
  }).map((obj: any): SeniorPCMemberAttributes => {
    return {
      id: obj['#'].toString(),
      pcMemberId: obj['#'].toString()
    }
  })
  await createSeniorPCMembers(seniorPcMembers)

  const chair: ChairAttributes[] = committeeData.filter((obj: any): boolean => {
    return [CHAIR_ROLE_LABEL].includes(obj.role)
  }).map((obj: any): ChairAttributes => {
    return {
      id: obj['#'].toString(),
      seniorPcMemberId: obj['#'].toString()
    }
  })
  await createChairs(chair)

  const authors: AuthorAttributes[] = []
  authorsData.map((obj: any): AuthorAttributes => {
    const readAuthor: AuthorAttributes = {
      id: obj['person #'].toString(),
      personId: obj['person #'].toString()
    }

    if (authors.findIndex((author: AuthorAttributes): boolean => {
      return author.id === readAuthor.id
    }) === -1) {
      authors.push(readAuthor)
    }

    return readAuthor
  })
  await createAuthors(authors)
}

const processSubmissions = async (_job: ProcessingJob, submissionsWorksheet: WorkSheet, authorsWorksheet: WorkSheet): Promise<void> => {
  logger.log('info', 'services::file-processing::processSubmissions: Processing submissions worksheets')
  const submissionsData = utils.sheet_to_json(submissionsWorksheet)
  const submissionsModelObjects = submissionsData.map((obj: any) => {
    const modelObject = {
      id: obj['#'].toString(),
      title: obj.title,
      submitted: new Date(obj.submitted),
      lastUpdated: new Date(obj['last updated'])
    }

    return modelObject
  })
  await createSubmissions(submissionsModelObjects)

  const authorsData = utils.sheet_to_json(authorsWorksheet)
  const modelObjects = authorsData.map((obj: any) => {
    return {
      id: nanoid(),
      authorId: obj['person #'].toString(),
      submissionId: obj['submission #'].toString()
    }
  })
  await createSubmissionAuthorships(modelObjects)
}

const processAssignments = async (_job: ProcessingJob, assignmentsWorksheet: WorkSheet): Promise<void> => {
  logger.log('info', 'services::file-processing::processAssignments: Processing assignment worksheets')
  const assignmentsData = utils.sheet_to_json(assignmentsWorksheet)
  const assignmentsModelObjects = assignmentsData.map((obj: any) => {
    const modelObject = {
      id: nanoid(),
      pcMemberId: obj['member #'].toString(),
      submissionId: obj['submission #'].toString()
    }

    return modelObject
  })
  await createAssignments(assignmentsModelObjects)
}

const processScores = async (_job: ProcessingJob, scoresWorksheet: WorkSheet): Promise<void> => {
  logger.log('info', 'services::file-processing::processScores: Processing scores worksheet')
  const reviewScoresData = utils.sheet_to_json(scoresWorksheet)
  let reviewScoresModelObjects = reviewScoresData.filter((obj: any) => {
    return obj['field title'] === 'Overall evaluation'
  })
  reviewScoresModelObjects = reviewScoresModelObjects.map((obj: any) => {
    const modelObject = {
      value: Number(obj.value),
      explanation: obj.explanation
    }

    return modelObject
  })

  const confidenceScoresData = utils.sheet_to_json(scoresWorksheet)
  let confidenceScoresModelObjects = confidenceScoresData.filter((obj: any) => {
    return obj['field title'] === "Reviewer's confidence"
  })
  confidenceScoresModelObjects = confidenceScoresModelObjects.map((obj: any) => {
    const modelObject = {
      value: Number(obj.value),
      explanation: obj.explanation
    }

    return modelObject
  })

  logger.log('info', 'creating scores:')
  logger.log('info', reviewScoresModelObjects)
  logger.log('info', confidenceScoresModelObjects)
  await Promise.all([
    createReviewScores(reviewScoresModelObjects),
    createConfidenceScores(confidenceScoresModelObjects)
  ])
}

const processReviews = async (_job: ProcessingJob, reviewsWorksheet: WorkSheet): Promise<void> => {
  logger.log('info', 'services::file-processing::processReviews: Processing reviews worksheet')
  const reviewsData = utils.sheet_to_json(reviewsWorksheet)

  const reviews: ReviewAttributes[] = reviewsData.map((obj: any): ReviewAttributes => {
    const submittedDate: string = obj.date
    const submittedTime: string = obj.time

    const reviewConfidenceValue: string[] | null = obj.scores.match(/(?<=Reviewer's confidence: )(.*)(?=)/)
    const modelObject: ReviewAttributes = {
      id: obj['#'].toString(),
      submitted: new Date(`${submittedDate}T${submittedTime}`),

      pcMemberId: obj['member #'].toString(),
      submissionId: obj['submission #'].toString(),

      content: obj.text,

      reviewScoreValue: Number(obj['total score']),
      confidence: (reviewConfidenceValue !== null ? Number(reviewConfidenceValue[0]) : 3)
    }
    return modelObject
  })
  logger.log('info', 'reviews')
  await createReviews(reviews)
}
