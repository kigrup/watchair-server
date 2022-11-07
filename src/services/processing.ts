import { FileProcessingJob, JobStatus } from '../types'
import { endFileProcessingJob } from './jobs'

export const processJob = async (job: FileProcessingJob): Promise<void> => {
  console.log(`services::processing::processJob: Started processing job ${job.id}`)
  try {
    void endFileProcessingJob(job, JobStatus.COMPLETED)
  } catch (error) {
    void endFileProcessingJob(job, JobStatus.FAILED)
  }
}
