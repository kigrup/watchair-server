import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { ProcessingJob, JobStatus, JobType } from '../types'
import { processFileJob } from './file-processing'

export const getProcessingJobs = async (): Promise<ProcessingJob[]> => {
  const jobs: ProcessingJob[] = await ProcessingJob.findAll()

  console.log(`services::domains::getProcessingJob: Retrieved ProcessingJob: ${inspect(jobs, { depth: 1 })}`)

  return jobs
}

export const getProcessingJob = async (jobId: string): Promise<ProcessingJob | null> => {
  const job = await ProcessingJob.findOne({
    where: {
      id: jobId
    }
  })

  console.log(`services::domains::getProcessingJob: Retrieved ProcessingJob: ${inspect(job, { depth: 1 })}`)

  return job
}

export const createProcessingJob = async (type: JobType, subject: string, domainId: string): Promise<ProcessingJob> => {
  const newJob: ProcessingJob = await ProcessingJob.create({
    id: nanoid(),
    domainId: domainId,
    type: type,
    subject: subject,
    status: JobStatus.RUNNING,
    message: ''
  })

  console.log(`services::domains::createProcessingJob: Created new ProcessingJob: ${inspect(newJob, { depth: 1 })}`)

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
  console.log(`services::jobs::endProcessingJob: Job ${job.id} ended with status ${status}`)
}
