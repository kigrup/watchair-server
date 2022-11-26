import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { NotFoundError } from '../errors/not-found'
import { getProcessingJobs, getProcessingJob } from '../services/jobs'
import { ProcessingJob } from '../types'

export const getJobsHandler: RequestHandler = async (_req, res, next) => {
  console.log('controllers::domains::getJobsHandler: Received jobs GET request')
  try {
    const jobs: ProcessingJob[] = await getProcessingJobs()
    res.status(StatusCodes.OK).json(jobs)
  } catch (error) {
    next(error)
  }
}

export const getJobHandler: RequestHandler = async (req, res, next) => {
  console.log('controllers::domains::getJobHandler: Received job GET request')
  try {
    const jobId = req.params.jobId
    const job: ProcessingJob | null = await getProcessingJob(jobId)
    if (job === null) {
      throw new NotFoundError('Invalid Job Id.')
    }
    res.status(StatusCodes.OK).json(job)
  } catch (error) {
    next(error)
  }
}
