import { logger } from '../utils/logger'
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import { inspect } from 'util'
import { Assignment, JobStatus, JobSubtype, JobType, ProcessingJob, Review, MetricHeader, MetricHeaderAttributes, MetricValueAttributes, ReviewScore, Comment, Domain } from '../types'
import { createProcessingJob, endProcessingJob } from './jobs'
import { createMetricHeader, createMetricValue, createMetricValues } from './metrics'
import { getDomainReviews } from './reviews'
import { getReviewScores } from './scores'
import { getDomainAssignments } from './submissions'
import { getDomainComments } from './comments'
import { getDomain } from './domains'

export const processAllMetrics = async (domainId: string): Promise<void> => {
  logger.log('info', `services::metric-processing::processAllMetrics: Queuing all metrics for processing for domain ${domainId}`)

  const reviewsDoneJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.REVIEWS_DONE, 'Review assignments finished', domainId)
  await processReviewsDoneJob(reviewsDoneJob)

  const submissionAcceptanceJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.SUBMISSION_ACCEPTANCE, 'Submissions evaluation scores', domainId)
  await processSubmissionAcceptanceJob(submissionAcceptanceJob)

  const participationJob: ProcessingJob = await createProcessingJob(JobType.METRIC, JobSubtype.PARTICIPATION, 'Participation in the review process', domainId)
  await processParticipationJob(participationJob)
}

const processReviewsDoneJob = async (job: ProcessingJob): Promise<void> => {
  logger.log('info', `services::metric-processing::processReviewsDoneJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const assignments: Assignment[] = await getDomainAssignments(job.domainId)
    const reviews: Review[] = await getDomainReviews(job.domainId)
    const domain: Domain | null = await getDomain(job.domainId)

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

    if (domain?.endDate !== undefined) {
      logger.log('info', 'services::metric-processing::processReviewsDoneJob: Found domain end date, calculating late reviews')
      const individualLateMetricHeaderAttributes: MetricHeaderAttributes = {
        id: '',
        title: `Individual: ${job.subject} (late)`,
        description: 'How many submission review assignments have been completed after the due date by each reviewer',
        domainId: job.domainId
      }
      const individualLateMetricHeader: MetricHeader = await createMetricHeader(individualLateMetricHeaderAttributes)

      const reviewsDoneLateMap: { [key: string]: number } = {}
      reviews.forEach((review: Review): void => {
        const reviewerId: string | undefined = review.pcMemberId
        const reviewDate: Date = new Date(review.submitted)
        if (domain.endDate < reviewDate) {
          if (reviewerId !== undefined) {
            if (reviewsDoneLateMap[reviewerId] === undefined) {
              reviewsDoneLateMap[reviewerId] = 1
            } else {
              reviewsDoneLateMap[reviewerId] += 1
            }
          }
        }
      })

      const individualLateMetricValueAttributes: MetricValueAttributes[] = Object.keys(reviewsDoneLateMap).map((reviewerId: string): MetricValueAttributes => {
        return {
          id: '',
          headerId: individualLateMetricHeader.id,
          value: reviewsDoneLateMap[reviewerId],
          min: 0,
          max: -1,
          step: 1,
          unit: 'review/reviews',
          label: reviewerId,
          color: '#'
        }
      })
      await createMetricValues(individualLateMetricValueAttributes)
      logger.log('info', `services::metric-processing::processReviewsDoneJob: Created metric ${individualLateMetricHeader.id}`)
    }

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
      description: 'What is the deviation from the average review score of each reviewer',
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
        min: -6,
        max: 6,
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

    // Individual local review score factor

    const individualLocalMetricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: `Individual Local: ${job.subject}`,
      description: 'What is the average deviation from the average review score of each paper reviewed by each reviewer',
      domainId: job.domainId
    }

    const individualLocalMetricHeader: MetricHeader = await createMetricHeader(individualLocalMetricHeaderAttributes)
    const scoresBySubmission: { [key: string]: { count: number, scores: number, submissionId: string, average: number | undefined } } = {}
    reviews.forEach((review: Review): void => {
      const submissionId: string | undefined = review.submissionId
      const reviewScore: number | undefined = review.reviewScoreValue
      if (submissionId !== undefined && reviewScore !== undefined) {
        if (scoresBySubmission[submissionId] === undefined) {
          scoresBySubmission[submissionId] = { count: 1, scores: reviewScore, submissionId: submissionId, average: undefined }
        } else {
          scoresBySubmission[submissionId].count += 1
          scoresBySubmission[submissionId].scores += reviewScore
        }
      }
    })
    Object.keys(scoresBySubmission).forEach(submissionId => {
      const submissionAverage = scoresBySubmission[submissionId].scores / scoresBySubmission[submissionId].count
      scoresBySubmission[submissionId].average = submissionAverage
    })

    const reviewersScoreDeviations: { [key: string]: { deviations: number[] } } = {}
    reviews.forEach((review: Review): void => {
      const reviewerId: string | undefined = review.pcMemberId
      const submissionId: string | undefined = review.submissionId
      const reviewScore: number | undefined = review.reviewScoreValue
      const submissionAverage: number | undefined = scoresBySubmission[submissionId].average
      if (reviewerId !== undefined && submissionId !== undefined && reviewScore !== undefined && submissionAverage !== undefined) {
        if (reviewersScoreDeviations[reviewerId] === undefined) {
          reviewersScoreDeviations[reviewerId] = { deviations: [reviewScore - submissionAverage] }
        } else {
          reviewersScoreDeviations[reviewerId].deviations.push(reviewScore - submissionAverage)
        }
      }
    })

    const individualLocalMetricValueAttributes: MetricValueAttributes[] = Object.keys(reviewersScoreDeviations).map((reviewerId: string): MetricValueAttributes => {
      const averageDeviation = reviewersScoreDeviations[reviewerId].deviations.reduce((pv, cv) => { return pv + cv })
      const deviations = reviewersScoreDeviations[reviewerId].deviations.length
      return {
        id: '',
        headerId: individualLocalMetricHeader.id,
        value: averageDeviation / deviations,
        min: -6,
        max: 6,
        step: 0,
        unit: 'points',
        label: reviewerId,
        color: '#'
      }
    })
    await createMetricValues(individualLocalMetricValueAttributes)
    logger.log('info', `services::metric-processing::processSubmissionAcceptanceJob: Created metric ${individualLocalMetricHeader.id}`)

    logger.log('info', `services::metric-processing::processSubmissionAcceptanceJob: Finished processing metric job with id ${job.id} successfully`)
    await endProcessingJob(job, JobStatus.COMPLETED, 'Job ended successfully.')
  } catch (error) {
    await handleJobError(error, job)
  }
}

const processParticipationJob = async (job: ProcessingJob): Promise<void> => {
  logger.log('info', `services::metric-processing::processParticipationJob: Started processing metric job of subtype '${job.subtype}' with id ${job.id} for domain ${job.domainId}`)
  try {
    const reviews: Review[] = await getDomainReviews(job.domainId)
    const comments: Comment[] = await getDomainComments(job.domainId)

    const memberParticipation: { [key: string]: number } = {}

    reviews.forEach((review: Review): void => {
      const reviewerId: string | undefined = review.pcMemberId
      if (reviewerId !== undefined) {
        if (memberParticipation[reviewerId] === undefined) {
          memberParticipation[reviewerId] = 1
        } else {
          memberParticipation[reviewerId] += 1
        }
      }
    })

    comments.forEach((comment: Comment): void => {
      const commenterId: string | undefined = comment.pcMemberId
      if (commenterId !== undefined) {
        if (memberParticipation[commenterId] === undefined) {
          memberParticipation[commenterId] = 1
        } else {
          memberParticipation[commenterId] += 1
        }
      }
    })

    const individualMetricHeaderAttributes: MetricHeaderAttributes = {
      id: '',
      title: `Individual: ${job.subject}`,
      description: 'What is the participation score of each committe member',
      domainId: job.domainId
    }
    const individualMetricHeader: MetricHeader = await createMetricHeader(individualMetricHeaderAttributes)

    const individualMetricValueAttributes: MetricValueAttributes[] = Object.keys(memberParticipation).map((memberId: string): MetricValueAttributes => {
      return {
        id: '',
        headerId: individualMetricHeader.id,
        value: memberParticipation[memberId],
        min: 0,
        max: -1,
        step: 1,
        unit: 'reviews&comments',
        color: '#',
        label: memberId
      }
    })
    await createMetricValues(individualMetricValueAttributes)
    logger.log('info', `services::metric-processing::processParticipationJob: Created metric ${individualMetricHeader.id}`)

    logger.log('info', `services::metric-processing::processParticipationJob: Finished processing metric job with id ${job.id} successfully`)
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
