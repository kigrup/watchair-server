import path from 'path'
import { FileProcessingJob, JobStatus } from '../types'
import { endFileProcessingJob } from './jobs'
import { readFileSync } from 'fs'
import { read, utils, WorkBook, WorkSheet } from 'xlsx'

export const processJob = async (job: FileProcessingJob): Promise<void> => {
  console.log(`services::processing::processJob: Started processing job ${job.id}`)

  const COMMITTEE_WORKSHEET_NAME = 'Program committee'
  /* const SUBMISSIONS_WORKSHEET_NAME = 'Submissions'
  const AUTHORS_WORKSHEET_NAME = 'Authors'
  const WATCHLIST_WORKSHEET_NAME = 'Watchlist'
  const SUBMISSION_ASSIGNMENT_WORKSHEET_NAME = 'Submission assignment'
  const REVIEWS_WORKSHEET_NAME = 'Reviews' */

  try {
    const filePath = path.join(__dirname, '..', '..', 'data', 'uploads', job.fileName)
    console.log(`services::processing::processJob: Using filePath= ${filePath}`)

    const workbookBuffer: Buffer = readFileSync(filePath)
    const workbook: WorkBook = read(workbookBuffer)

    if (workbook.SheetNames.includes(COMMITTEE_WORKSHEET_NAME)) {
      console.log(`services::processing::processJob: Processing worksheet '${COMMITTEE_WORKSHEET_NAME}'`)
      const committeeWorkSheet: WorkSheet = workbook.Sheets[COMMITTEE_WORKSHEET_NAME]
      const committeeDataObject = utils.sheet_to_json(committeeWorkSheet)
      void committeeDataObject
    }

    void endFileProcessingJob(job, JobStatus.COMPLETED, 'Job has been completed with no errors')
  } catch (error) {
    if (error instanceof Error) {
      void endFileProcessingJob(job, JobStatus.FAILED, error.message)
    } else {
      void endFileProcessingJob(job, JobStatus.FAILED, 'Unknown error')
    }
  }
}
