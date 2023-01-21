import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from '../errors/bad-request'
import { syncDatabase } from '../services/database'
import { logger } from '../utils/logger'

export const syncDatabaseHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::databse::syncDatabase: Received sync POST request')
  try {
    const force: boolean = req.body.force
    if (force === undefined || force === null) {
      throw new BadRequestError('Missing or invalid force sync parameter')
    }
    await syncDatabase(force)
    res.status(StatusCodes.OK).json({ success: true })
  } catch (error) {
    next(error)
  }
}
