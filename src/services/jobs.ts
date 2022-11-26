import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { FileProcessingJob, JobStatus } from '../types'
import { processJob } from './file-processing'

export const getFileProcessingJobs = async (): Promise<FileProcessingJob[]> => {
  const jobs: FileProcessingJob[] = await FileProcessingJob.findAll()

  console.log(`services::domains::getFileProcessingJob: Retrieved FileProcessingJob: ${inspect(jobs, { depth: 1 })}`)

  return jobs
}

export const getFileProcessingJob = async (jobId: string): Promise<FileProcessingJob | null> => {
  const job = await FileProcessingJob.findOne({
    where: {
      id: jobId
    }
  })

  console.log(`services::domains::getFileProcessingJob: Retrieved FileProcessingJob: ${inspect(job, { depth: 1 })}`)

  return job
}

export const createFileProcessingJob = async (fileName: string, domainId: string): Promise<FileProcessingJob> => {
  const newJob: FileProcessingJob = await FileProcessingJob.create({
    id: nanoid(),
    domainId: domainId,
    fileName: fileName,
    status: JobStatus.RUNNING,
    message: ''
  })

  console.log(`services::domains::createFileProcessingJob: Created new FileProcessingJob: ${inspect(newJob, { depth: 1 })}`)

  void processJob(newJob)

  return newJob
}

export const endFileProcessingJob = async (job: FileProcessingJob, status: JobStatus, message: string): Promise<void> => {
  await job.update({
    status: status,
    message: message
  })
  console.log(`services::jobs::endFileProcessingJob: Job ${job.id} ended with status ${status}`)
}
