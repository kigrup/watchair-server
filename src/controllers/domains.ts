import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'

export const getDomains: RequestHandler = async (req, res, _next) => {
  console.log('Domain Controller: getDomains request')
}

export const createDomain: RequestHandler = async (req, res, _next) => {
  console.log('Domain Controller: createDomain request')
}

export const createFile: RequestHandler = async (req, res, _next) => {
  console.log('Domain Controller: createFile request')
  res.status(StatusCodes.CREATED).json({
    id: req.file?.filename
  })
}
