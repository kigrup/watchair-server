import path from 'path'
import { ProcessingJob, JobStatus } from '../types'
import { endProcessingJob } from './jobs'
import { readFileSync } from 'fs'
import { read, utils, WorkBook, WorkSheet } from 'xlsx'
import { createAuthors, createChairs, createPCMembers, createSeniorPCMembers } from './persons'
import { createAssignments, createSubmissionAuthorships, createSubmissions } from './submissions'
import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { createReviews } from './reviews'
import { createConfidenceScores, createReviewScores } from './scores'

const COMMITTEE_WORKSHEET_NAME = 'Program committee'
const AUTHORS_WORKSHEET_NAME = 'Authors'
const SUBMISSIONS_WORKSHEET_NAME = 'Submissions'
const SUBMISSION_ASSIGNMENT_WORKSHEET_NAME = 'Submission assignment'
const SCORES_WORKSHEET_NAME = 'Review field scores'
const REVIEWS_WORKSHEET_NAME = 'Reviews'

export const processJob = async (job: ProcessingJob): Promise<void> => {
  console.log(`services::processing::processJob: Started processing job ${job.id} for domain ${job.domainId}`)

  try {
    const filePath = path.join(__dirname, '..', '..', 'data', 'uploads', job.subject)
    console.log(`services::processing::processJob: Using filePath= ${filePath}`)

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

    await endProcessingJob(job, JobStatus.COMPLETED, 'Job has been completed with no errors')
  } catch (error) {
    console.log(`services::processing::processJob: Raised exception: ${inspect(error, { depth: 4 })}`)
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
  console.log('services::processing::processPersons: Processing committee members and authors worksheets')
  const committeeData = utils.sheet_to_json(committeeWorksheet)
  const modelObjects: any = {
    authors: [],
    'PC member': [],
    'senior PC member': [],
    chair: []
  }
  committeeData.map((obj: any) => {
    const role: string = obj.role
    const modelObject = {
      id: obj['person #'],
      pcMemberId: obj['#'],
      firstName: obj['first name'],
      lastName: obj['last name'],
      domainId: job.domainId
    }
    if (Object.keys(modelObjects).includes(role)) {
      modelObjects[role].push(modelObject)
    }
    return modelObject
  })

  const authorsData = utils.sheet_to_json(authorsWorksheet)
  authorsData.map((obj: any) => {
    const modelObject = {
      id: obj['person #'],
      firstName: obj['first name'],
      lastName: obj['last name'],
      domainId: job.domainId
    }
    const duplicateEntry: any = modelObjects.authors.find((e: any) => {
      return (e.id === modelObject.id)
    })
    if (duplicateEntry === undefined) {
      modelObjects.authors.push(modelObject)
    }
    return modelObject
  })

  await Promise.all([
    createChairs(modelObjects.chair),
    createSeniorPCMembers(modelObjects['senior PC member']),
    createPCMembers(modelObjects['PC member']),
    createAuthors(modelObjects.authors)
  ])
}

const processSubmissions = async (_job: ProcessingJob, submissionsWorksheet: WorkSheet, authorsWorksheet: WorkSheet): Promise<void> => {
  console.log('services::processing::processSubmissions: Processing submissions worksheets')
  const submissionsData = utils.sheet_to_json(submissionsWorksheet)
  const submissionsModelObjects = submissionsData.map((obj: any) => {
    const modelObject = {
      id: obj['#'],
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
      authorId: obj['person #'],
      submissionId: obj['submission #']
    }
  })
  await createSubmissionAuthorships(modelObjects)
}

const processAssignments = async (_job: ProcessingJob, assignmentsWorksheet: WorkSheet): Promise<void> => {
  console.log('services::processing::processAssignments: Processing assignment worksheets')
  const assignmentsData = utils.sheet_to_json(assignmentsWorksheet)
  const assignmentsModelObjects = assignmentsData.map((obj: any) => {
    const modelObject = {
      id: nanoid(),
      pcMemberId: obj['member #'],
      submissionId: obj['submission #']
    }

    return modelObject
  })
  await createAssignments(assignmentsModelObjects)
}

const processScores = async (_job: ProcessingJob, scoresWorksheet: WorkSheet): Promise<void> => {
  console.log('services::processing::processScores: Processing scores worksheet')
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

  console.log('creating scores:')
  console.log(reviewScoresModelObjects)
  console.log(confidenceScoresModelObjects)
  await Promise.all([
    createReviewScores(reviewScoresModelObjects),
    createConfidenceScores(confidenceScoresModelObjects)
  ])
}

const processReviews = async (_job: ProcessingJob, reviewsWorksheet: WorkSheet): Promise<void> => {
  console.log('services::processing::processReviews: Processing reviews worksheet')
  const reviewsData = utils.sheet_to_json(reviewsWorksheet)
  const reviewsModelObjects = reviewsData.map((obj: any) => {
    const submittedDate: string = obj.date
    const submittedTime: string = obj.time

    const reviewScoreValue: string[] | null = obj.scores.match(/(?<=Overall evaluation: )(.*)(?=\r\n)/)
    const reviewConfidenceValue: string[] | null = obj.scores.match(/(?<=Reviewer's confidence: )(.*)(?=)/)
    const modelObject = {
      id: obj['#'],
      submitted: new Date(`${submittedDate}T${submittedTime}`),

      pcMemberId: obj['member #'],
      submissionId: obj['submission #'],

      content: obj.text,

      reviewScore: (reviewScoreValue !== null ? Number(reviewScoreValue[0]) : undefined),
      confidence: (reviewConfidenceValue !== null ? Number(reviewConfidenceValue[0]) : undefined)
    }
    return modelObject
  })
  console.log('reviews')
  console.log(reviewsModelObjects)
  await createReviews(reviewsModelObjects)
}
