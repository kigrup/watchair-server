import { ErrorRequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { logger } from '../utils/logger'

interface CustomError {
  statusCode: StatusCodes
  message: string
}

export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  // TODO: add internal server error when no error is specified
  const customError: CustomError = {
    statusCode: err.statusCode,
    message: err.message
  }

  logger.log('info', `middlewares::error-handler::errorHandlerMiddleware: Error thrown, statusCode:${customError.statusCode} with message '${customError.message}'`)

  return res.status(customError.statusCode).json({
    error: customError.message
  })
}
