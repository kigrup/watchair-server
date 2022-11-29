import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { inspect } from 'util'
import { Assignment, JobStatus, JobSubtype, JobType, ProcessingJob, Review, MetricHeader, MetricHeaderAttributes, MetricValueAttributes, ReviewScore } from '../types'
import { createProcessingJob, endProcessingJob } from './jobs'
import { createMetricHeader, createMetricValue, createMetricValues } from './metrics'
import { getDomainReviews } from './reviews'
import { getReviewScores } from './scores'
import { getDomainAssignments } from './submissions'

export const processAllMetrics = async (domainId: string): Promise<void> => {
  console.log(`services::metric-processing::processAllMetrics: Queuing all metrics for processing for domain ${domainId}`)

  const reviewsDoneJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.REVIEWS_DONE, 'Review assignments finished', domainId)
  await processReviewsDoneJob(reviewsDoneJob)

  const submissionAcceptanceJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.SUBMISSION_ACCEPTANCE, 'Submissions evaluation scores', domainId)
  await processSubmissionAcceptanceJob(submissionAcceptanceJob)
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

const processSubmissionAcceptanceJob = async (job: ProcessingJob): Promise<void> => {
  console.log(`services::metric-processing::processSubmissionAcceptanceJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const metricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: job.subject,
      description: 'Which scores have the reviewed submissions received so far',
      valueMin: -3,
      valueMax: 3,
      valueStep: 1,
      valueUnit: 'review/reviews',
      domainId: job.domainId
    }
    const metricHeader: MetricHeader = await createMetricHeader(metricHeaderAttributes)

    const reviewScores: ReviewScore[] = await getReviewScores()
    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)

    const labelsColors: any = {
      '-3': '#960000',
      '-2': '#ff4d4d',
      '-1': '#ffb0b0',
      'not reviewed yet': '##969696',
      1: '#f9ffa6',
      2: '#b5ff8a',
      3: '#83ff3b'
    }

    const metricValues = reviewScores.map((reviewScore: ReviewScore): MetricValueAttributes => {
      return {
        id: '',
        headerId: metricHeader.id,
        value: reviews.filter((review: Review): boolean => {
          return review.reviewScoreValue === reviewScore.value
        }).length,
        label: `${reviewScore.value}: ${reviewScore.explanation}`,
        color: labelsColors[reviewScore.value]
      }
    })
    metricValues.push({
      id: '',
      headerId: metricHeader.id,
      value: assignments.length - reviews.length,
      label: 'not reviewed yet',
      color: labelsColors['not reviewed yet']
    })
    await createMetricValues(metricValues)

    console.log(`services::metric-processing::processSubmissionAcceptanceJob: Created metric ${metricHeader.id}`)

    console.log(`services::metric-processing::processSubmissionAcceptanceJob: Finished processing metric job with id ${job.id} successfully`)
    await endProcessingJob(job, JobStatus.COMPLETED, 'Job ended successfully.')
  } catch (error) {
    await handleJobError(error, job)
  }
}

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
