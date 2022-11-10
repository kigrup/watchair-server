import express from 'express'
import { getJobHandler, getJobsHandler } from '../controllers/jobs'

const router = express.Router()

router.route('/').get(getJobsHandler)

router.route('/:jobId').get(getJobHandler)

export { router as jobsRouter }
