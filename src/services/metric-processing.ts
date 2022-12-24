import { logger } from '../utils/logger'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { inspect } from 'util'
import { Assignment, JobStatus, JobSubtype, JobType, ProcessingJob, Review, MetricHeader, MetricHeaderAttributes, MetricValueAttributes, ReviewScore } from '../types'
import { createProcessingJob, endProcessingJob } from './jobs'
import { createMetricHeader, createMetricValue, createMetricValues } from './metrics'
import { getDomainReviews } from './reviews'
import { getReviewScores } from './scores'
import { getDomainAssignments } from './submissions'

export const processAllMetrics = async (domainId: string): Promise<void> => {
  logger.log('info', `services::metric-processing::processAllMetrics: Queuing all metrics for processing for domain ${domainId}`)

  const reviewsDoneJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.REVIEWS_DONE, 'Review assignments finished', domainId)
  await processReviewsDoneJob(reviewsDoneJob)

  const submissionAcceptanceJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.SUBMISSION_ACCEPTANCE, 'Submissions evaluation scores', domainId)
  await processSubmissionAcceptanceJob(submissionAcceptanceJob)
}

const processReviewsDoneJob = async (job: ProcessingJob): Promise<void> => {
  logger.log('info', `services::metric-processing::processReviewsDoneJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)

    // Create global data metric

    const metricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: `Global: ${job.subject}`,
      description: 'How many submission review assignments have been completed so far',
      domainId: job.domainId
    }
    const metricHeader: MetricHeader = await createMetricHeader(metricHeaderAttributes)

    const metricValueAttributes: MetricValueAttributes = {
      id: '',
      headerId: metricHeader.id,
      value: reviews.length,
      min: 0,
      max: assignments.length,
      step: 1,
      unit: 'review/reviews',
      label: 'Reviews done',
      color: '#'
    }
    await createMetricValue(metricValueAttributes)

    logger.log('info', `services::metric-processing::processReviewsDoneJob: Created metric ${metricHeader.id}`)

    // Create individual data metrics

    const individualMetricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: `Individual: ${job.subject}`,
      description: 'How many submission review assignments have been completed so far by each reviewer',
      domainId: job.domainId
    }
    const individualMetricHeader: MetricHeader = await createMetricHeader(individualMetricHeaderAttributes)

    const reviewsDoneMap: { [key: string]: number } = {}
    reviews.forEach((review: Review): void => {
      const reviewerId: string | undefined = review.pcMemberId
      if (reviewerId !== undefined) {
        if (reviewsDoneMap[reviewerId] === undefined) {
          reviewsDoneMap[reviewerId] = 1
        } else {
          reviewsDoneMap[reviewerId] += 1
        }
      }
    })

    const reviewsAssignedMap: { [key: string]: number } = {}
    assignments.forEach((assignment: Assignment): void => {
      const reviewerId: string | undefined = assignment.pcMemberId
      if (reviewerId !== undefined) {
        if (reviewsAssignedMap[reviewerId] === undefined) {
          reviewsAssignedMap[reviewerId] = 1
        } else {
          reviewsAssignedMap[reviewerId] += 1
        }
      }
    })

    const individualMetricValueAttributes: MetricValueAttributes[] = Object.keys(reviewsDoneMap).map((reviewerId: string): MetricValueAttributes => {
      return {
        id: '',
        headerId: individualMetricHeader.id,
        value: reviewsDoneMap[reviewerId],
        min: 0,
        max: reviewsAssignedMap[reviewerId],
        step: 1,
        unit: 'review/reviews',
        label: reviewerId,
        color: '#'
      }
    })
    await createMetricValues(individualMetricValueAttributes)

    logger.log('info', `services::metric-processing::processReviewsDoneJob: Created metric ${individualMetricHeader.id}`)

    logger.log('info', `services::metric-processing::processReviewsDoneJob: Finished processing metric job with id ${job.id} successfully`)
    await endProcessingJob(job, JobStatus.COMPLETED, 'Job ended successfully.')
  } catch (error) {
    await handleJobError(error, job)
  }
}

const processSubmissionAcceptanceJob = async (job: ProcessingJob): Promise<void> => {
  logger.log('info', `services::metric-processing::processSubmissionAcceptanceJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const reviewScores: ReviewScore[] = await getReviewScores()
    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)

    const labelsColors: any = {
      '-3': '#960000',
      '-2': '#ff4d4d',
      '-1': '#ffb0b0',
      'not reviewed yet': '#c2c2c2',
      1: '#f9ffa6',
      2: '#b5ff8a',
      3: '#83ff3b'
    }

    // Global review scores metric
    const metricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: `Global: ${job.subject}`,
      description: 'How many submissions have received what scores so far',
      domainId: job.domainId
    }

    let scoreSum = 0
    const reviewCount = reviews.length

    const metricHeader: MetricHeader = await createMetricHeader(metricHeaderAttributes)
    const metricValues = reviewScores.map((reviewScore: ReviewScore): MetricValueAttributes => {
      const metricValue = {
        id: '',
        headerId: metricHeader.id,
        value: reviews.filter((review: Review): boolean => {
          return review.reviewScoreValue === reviewScore.value
        }).length,
        min: 0,
        max: -1,
        step: 1,
        unit: 'submissions rated',
        label: `${reviewScore.value}: ${reviewScore.explanation}`,
        color: labelsColors[reviewScore.value]
      }
      scoreSum += metricValue.value * reviewScore.value
      return metricValue
    })
    metricValues.push({
      id: '',
      headerId: metricHeader.id,
      value: assignments.length - reviews.length,
      min: 0,
      max: -1,
      step: 1,
      unit: 'submissions rated',
      label: 'not reviewed yet',
      color: labelsColors['not reviewed yet']
    })
    await createMetricValues(metricValues)

    logger.log('info', `services::metric-processing::processSubmissionAcceptanceJob: Created metric ${metricHeader.id}`)

    // Individual review scores metric
    const individualMetricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: `Individual: ${job.subject}`,
      description: 'How many submissions have received what scores so far by each reviewer',
      domainId: job.domainId
    }

    const individualMetricHeader: MetricHeader = await createMetricHeader(individualMetricHeaderAttributes)
    const scoreAverage = scoreSum / reviewCount
    const scoresByReviewer: { [key: string]: { count: number, scores: number} } = {}
    reviews.forEach((review: Review): void => {
      const reviewerId: string | undefined = review.pcMemberId
      const reviewScore: number | undefined = review.reviewScoreValue
      if (reviewerId !== undefined && reviewScore !== undefined) {
        if (scoresByReviewer[reviewerId] === undefined) {
          scoresByReviewer[reviewerId] = { count: 1, scores: reviewScore }
        } else {
          scoresByReviewer[reviewerId].count += 1
          scoresByReviewer[reviewerId].scores += reviewScore
        }
      }
    })

    const individualMetricValueAttributes: MetricValueAttributes[] = Object.keys(scoresByReviewer).map((reviewerId: string): MetricValueAttributes => {
      const individualAverage = scoresByReviewer[reviewerId].scores / scoresByReviewer[reviewerId].count
      return {
        id: '',
        headerId: individualMetricHeader.id,
        value: individualAverage - scoreAverage,
        min: -3,
        max: 3,
        step: 0,
        unit: 'points',
        label: reviewerId,
        color: '#'
      }
    })
    individualMetricValueAttributes.push({
      id: '',
      headerId: individualMetricHeader.id,
      value: scoreAverage,
      min: -3,
      max: 3,
      step: 0,
      unit: 'points',
      label: 'average',
      color: '#'
    })
    await createMetricValues(individualMetricValueAttributes)

    logger.log('info', `services::metric-processing::processSubmissionAcceptanceJob: Created metric ${individualMetricHeader.id}`)

    logger.log('info', `services::metric-processing::processSubmissionAcceptanceJob: Finished processing metric job with id ${job.id} successfully`)
    await endProcessingJob(job, JobStatus.COMPLETED, 'Job ended successfully.')
  } catch (error) {
    await handleJobError(error, job)
  }
}

const handleJobError = async (error: unknown, job: ProcessingJob): Promise<void> => {
  logger.log('info', `services::metric-processing::handleJobError: Raised exception: ${inspect(error, { depth: 4 })}`)
  if (error instanceof UniqueConstraintError || error instanceof ForeignKeyConstraintError) {
    await endProcessingJob(job, JobStatus.FAILED, error.original.message)
  } else if (error instanceof Error) {
    await endProcessingJob(job, JobStatus.FAILED, error.message)
  } else {
    await endProcessingJob(job, JobStatus.FAILED, 'Unknown error')
  }
}
