import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { logger } from '../utils/logger'
import { ProcessingJob, JobStatus, JobType, JobSubtype } from '../types'
import { processFileJob } from './file-processing'

export const getDomainProcessingJobs = async (domainId: string): Promise<ProcessingJob[]> => {
  const jobs: ProcessingJob[] = await ProcessingJob.findAll({
    where: {
      domainId: domainId
    }
  })

  logger.log('info', `services::domains::getDomainProcessingJobs: Retrieved domain ${domainId} ProcessingJob: ${inspect(jobs, { depth: 1 })}`)

  return jobs
}

export const getProcessingJob = async (jobId: string): Promise<ProcessingJob | null> => {
  const job = await ProcessingJob.findOne({
    where: {
      id: jobId
    }
  })

  logger.log('info', `services::domains::getProcessingJob: Retrieved ProcessingJob: ${inspect(job, { depth: 1 })}`)

  return job
}

export const createProcessingJob = async (type: JobType, subtype: JobSubtype, subject: string, domainId: string): Promise<ProcessingJob> => {
  const newJob: ProcessingJob = await ProcessingJob.create({
    id: nanoid(),
    domainId: domainId,
    type: type,
    subtype: subtype,
    subject: subject,
    status: JobStatus.RUNNING,
    message: ''
  })

  logger.log('info', `services::domains::createProcessingJob: Created new ProcessingJob: ${inspect(newJob, { depth: 1 })}`)

  if (type === JobType.FILE) {
    void processFileJob(newJob)
  }

  return newJob
}

export const endProcessingJob = async (job: ProcessingJob, status: JobStatus, message: string): Promise<void> => {
  await job.update({
    status: status,
    message: message
  })
  logger.log('info', `services::jobs::endProcessingJob: Job ${job.id} ended with status ${status}`)
}
