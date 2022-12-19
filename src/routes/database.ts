import express from 'express'
import { syncDatabaseHandler } from '../controllers/database'

const router = express.Router()

router.route('/sync').post(syncDatabaseHandler)

export { router as databaseRouter }
