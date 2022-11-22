import { Confidence, ReviewScore } from '../types'

export const createReviewScores = async (reviewScores: any): Promise<ReviewScore[]> => {
  console.log('services::scores::createReviewScores: Bulk creating review scores...')

  const createdReviewScores = await ReviewScore.bulkCreate(reviewScores)

  console.log('services::scores::createReviewScores: Done bulk creating review scores')

  return createdReviewScores
}

export const createConfidenceScores = async (confidenceScores: any): Promise<Confidence[]> => {
  console.log('services::scores::createConfidenceScores: Bulk creating confidence scores...')

  const createdConfidenceScores = await Confidence.bulkCreate(confidenceScores)

  console.log('services::scores::createConfidenceScores: Done bulk creating confidence scores')

  return createdConfidenceScores
}
