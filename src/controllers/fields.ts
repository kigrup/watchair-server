import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getReviewScores } from '../services/scores'
import { ReviewScore } from '../types'

export const getReviewScoresFieldHandler: RequestHandler = async (_req, res, next) => {
  console.log('controllers::domains::getReviewsHandler: Received reviews GET request')
  try {
    const reviewScores: ReviewScore[] = await getReviewScores()
    res.status(StatusCodes.OK).json(reviewScores)
  } catch (error) {
    next(error)
  }
}
