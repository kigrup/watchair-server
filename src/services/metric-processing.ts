import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { inspect } from 'util'
import { Assignment, JobStatus, JobSubtype, JobType, ProcessingJob, Review, MetricHeader, MetricHeaderAttributes, MetricValueAttributes } from '../types'
import { createProcessingJob, endProcessingJob } from './jobs'
import { createMetricHeader, createMetricValue } from './metrics'
import { getDomainReviews } from './reviews'
import { getDomainAssignments } from './submissions'

export const processAllMetrics = async (domainId: string): Promise<void> => {
  console.log(`services::metric-processing::processAllMetrics: Queuing all metrics for processing for domain ${domainId}`)

  const reviewsDoneJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.REVIEWS_DONE, 'Review assignments finished', domainId)
  await processReviewsDoneJob(reviewsDoneJob)

  /* const submissionAcceptanceJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.SUBMISSION_ACCEPTANCE, 'Submissions evaluation scores', domainId)
  await processSubmissionAcceptanceJob(submissionAcceptanceJob) */
}

const processReviewsDoneJob = async (job: ProcessingJob): Promise<void> => {
  console.log(`services::metric-processing::processReviewsDoneJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)

    const metricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: job.subject,
      description: 'How many submission review assignments have been completed so far',
      valueMin: 0,
      valueMax: assignments.length,
      valueStep: 1,
      valueUnit: 'review/reviews',
      domainId: job.domainId
    }
    const metricHeader: MetricHeader = await createMetricHeader(metricHeaderAttributes)

    const metricValueAttributes: MetricValueAttributes = {
      id: '',
      headerId: metricHeader.id,
      value: reviews.length,
      label: 'Reviews done',
      color: '#'
    }
    await createMetricValue(metricValueAttributes)

    console.log(`services::metric-processing::processReviewsDoneJob: Created metric ${metricHeader.id}`)

    console.log(`services::metric-processing::processReviewsDoneJob: Finished processing metric job with id ${job.id} successfully`)
    await endProcessingJob(job, JobStatus.COMPLETED, 'Job ended successfully.')
  } catch (error) {
    await handleJobError(error, job)
  }
}

/* const processSubmissionAcceptanceJob = async (job: ProcessingJob): Promise<void> => {
  console.log(`services::metric-processing::processSubmissionAcceptanceJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)

    const newTwoDimensionalMetric: any = {
      title: job.subject,
      description: 'How many submission review assignments have been completed so far',
      value: reviews.length,
      minValue: 0,
      maxValue: assignments.length,
      step: 1,
      domainId: job.domainId
    }
    const twoDimensionalMetric = await createTwoDimensionalMetric
  } catch (error) {
    await handleJobError(error, job)
  }
} */

const handleJobError = async (error: unknown, job: ProcessingJob): Promise<void> => {
  console.log(`services::metric-processing::handleJobError: Raised exception: ${inspect(error, { depth: 4 })}`)
  if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
    await endProcessingJob(job, JobStatus.FAILED, error.original.message)
  } else if (error instanceof Error) {
    await endProcessingJob(job, JobStatus.FAILED, error.message)
  } else {
    await endProcessingJob(job, JobStatus.FAILED, 'Unknown error')
  }
}
