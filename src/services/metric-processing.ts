import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { inspect } from 'util'
import { Assignment, JobStatus, JobSubtype, JobType, ProcessingJob, Review, UnitMetric } from '../types'
import { createProcessingJob, endProcessingJob } from './jobs'
import { createUnitMetric } from './metrics'
import { getDomainReviews } from './reviews'
import { getDomainAssignments } from './submissions'

export const processAllMetrics = async (domainId: string): Promise<void> => {
  console.log(`services::metric-processing::processAllMetrics: Queuing all metrics for processing for domain ${domainId}`)

  const reviewsDoneJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.REVIEWS_DONE, 'Assigned reviews done', domainId)
  await processReviewsDoneJob(reviewsDoneJob)
}

const processReviewsDoneJob = async (job: ProcessingJob): Promise<void> => {
  console.log(`services::metric-processing::processReviewsDoneJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    console.log(`services::metric-processing::processReviewsDoneJob: Finished processing metric job with id ${job.id} successfully`)

    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)

    const newUnitMetric: any = {
      title: 'Review assignments finished',
      description: 'How many submission review assignments have been completed so far',
      value: reviews.length,
      minValue: 0,
      maxValue: assignments.length,
      step: 1,
      domainId: job.domainId
    }
    const unitMetric: UnitMetric = await createUnitMetric(newUnitMetric)
    console.log(`services::metric-processing::processReviewsDoneJob: Created unit metric ${unitMetric.id}`)
  } catch (error) {
    console.log(`services::metric-processing::processReviewsDoneJob: Raised exception: ${inspect(error, { depth: 4 })}`)
    if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
      await endProcessingJob(job, JobStatus.FAILED, error.original.message)
    } else if (error instanceof Error) {
      await endProcessingJob(job, JobStatus.FAILED, error.message)
    } else {
      await endProcessingJob(job, JobStatus.FAILED, 'Unknown error')
    }
  }
}
