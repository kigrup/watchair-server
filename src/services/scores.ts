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
  const createdReviewScores = []

  for (const reviewScore of reviewScores) {
    const existingReviewScore = await ReviewScore.findOne({
      where: {
        value: reviewScore.value
      }
    })
    if (existingReviewScore === undefined) {
      const createdReviewScore = await ReviewScore.create(reviewScore)
      createdReviewScores.push(createdReviewScore)
    }
  }

  logger.log('info', 'services::scores::createReviewScores: Done creating review scores')

  return createdReviewScores
}

export const createConfidenceScores = async (confidenceScores: any): Promise<Confidence[]> => {
  logger.log('info', 'services::scores::createConfidenceScores: Bulk creating confidence scores...')
  const createdConfidenceScores = []

  for (const confidenceScore of confidenceScores) {
    const existingConfidenceScore = await Confidence.findOne({
      where: {
        value: confidenceScore.value
      }
    })
    if (existingConfidenceScore === undefined) {
      const createdConfidenceScore = await Confidence.create(confidenceScore)
      createdConfidenceScores.push(createdConfidenceScore)
    }
  }

  logger.log('info', 'services::scores::createConfidenceScores: Done bulk creating confidence scores')

  return createdConfidenceScores
}
