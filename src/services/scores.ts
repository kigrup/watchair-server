import { inspect } from 'util'
import { logger } from '../utils/logger'
import { Confidence, ReviewScore } from '../types'

export const getReviewScores = async (): Promise<ReviewScore[]> => {
  const reviewScores = await ReviewScore.findAll()

  logger.log('info', `services::scores::getReviewScores: Retrieved review scores: ${inspect(reviewScores, { depth: 1 })}`)

  return reviewScores
}

export const createReviewScores = async (reviewScores: any): Promise<ReviewScore[]> => {
  logger.log('info', 'services::scores::createReviewScores: Bulk creating review scores...')

  const createdReviewScores = await ReviewScore.bulkCreate(reviewScores)

  logger.log('info', 'services::scores::createReviewScores: Done bulk creating review scores')

  return createdReviewScores
}

export const createConfidenceScores = async (confidenceScores: any): Promise<Confidence[]> => {
  logger.log('info', 'services::scores::createConfidenceScores: Bulk creating confidence scores...')

  const createdConfidenceScores = await Confidence.bulkCreate(confidenceScores)

  logger.log('info', 'services::scores::createConfidenceScores: Done bulk creating confidence scores')

  return createdConfidenceScores
}
