import { ErrorRequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

interface CustomError {
  statusCode: StatusCodes
  message: string
}

export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const customError: CustomError = {
    statusCode: err.statusCode,
    message: err.message
  }

  console.log(`middlewares::error-handler::errorHandlerMiddleware: Error thrown, statusCode:${customError.statusCode} with message '${customError.message}'`)

  return res.status(customError.statusCode).json({
    error: customError.message
  })
}
