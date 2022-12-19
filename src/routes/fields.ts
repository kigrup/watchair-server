import express from 'express'
import { getReviewScoresFieldHandler } from '../controllers/fields'

const router = express.Router()

router.route('/review-score').get(getReviewScoresFieldHandler)

export { router as fieldsRouter }
