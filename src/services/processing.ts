import path from 'path'
import { FileProcessingJob, JobStatus } from '../types'
import { endFileProcessingJob } from './jobs'
import { readFileSync } from 'fs'
import { read, utils, WorkBook, WorkSheet } from 'xlsx'
import { createPersons } from './persons'
import { createAssignments, createSubmissionAuthorships, createSubmissions } from './submissions'
import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { UniqueConstraintError } from 'sequelize'

const COMMITTEE_WORKSHEET_NAME = 'Program committee'
const AUTHORS_WORKSHEET_NAME = 'Authors'
const SUBMISSIONS_WORKSHEET_NAME = 'Submissions'
const SUBMISSION_ASSIGNMENT_WORKSHEET_NAME = 'Submission assignment'
/*  const WATCHLIST_WORKSHEET_NAME = 'Watchlist'
  const REVIEWS_WORKSHEET_NAME = 'Reviews' */

export const processJob = async (job: FileProcessingJob): Promise<void> => {
  console.log(`services::processing::processJob: Started processing job ${job.id} for domain ${job.domainId}`)

  try {
    const filePath = path.join(__dirname, '..', '..', 'data', 'uploads', job.fileName)
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

    void endFileProcessingJob(job, JobStatus.COMPLETED, 'Job has been completed with no errors')
  } catch (error) {
    console.log(`services::processing::processJob: Raised exception: ${inspect(error, { depth: 4 })}`)
    if (error instanceof UniqueConstraintError) {
      void endFileProcessingJob(job, JobStatus.FAILED, error.original.message)
    } else if (error instanceof Error) {
      void endFileProcessingJob(job, JobStatus.FAILED, error.message)
    } else {
      void endFileProcessingJob(job, JobStatus.FAILED, 'Unknown error')
    }
  }
}

const processPersons = async (job: FileProcessingJob, committeeWorksheet: WorkSheet, authorsWorksheet: WorkSheet): Promise<void> => {
  console.log('services::processing::processPersons: Processing committee members and authors worksheets')
  const committeeData = utils.sheet_to_json(committeeWorksheet)
  const modelObjects: any = {
    authors: [],
    'PC member': [],
    'senior PC member': [],
    chair: []
  }
  committeeData.map((obj: any) => {
    const modelObject = {
      id: obj['person #'],
      firstName: obj['first name'],
      lastName: obj['last name'],
      domainId: job.domainId
    }
    const role: string = obj.role
    modelObjects[role].push(modelObject)
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

  await createPersons(modelObjects.authors, modelObjects['PC member'], modelObjects['senior PC member'], modelObjects.chair)
}

const processSubmissions = async (_job: FileProcessingJob, submissionsWorksheet: WorkSheet, authorsWorksheet: WorkSheet): Promise<void> => {
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

const processAssignments = async (_job: FileProcessingJob, assignmentsWorksheet: WorkSheet): Promise<void> => {
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
