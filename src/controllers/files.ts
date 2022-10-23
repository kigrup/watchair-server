import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'

const createFile: RequestHandler = async (req, res, _next) => {
  console.log('Created file')
  res.status(StatusCodes.CREATED).json({
    id: req.file?.filename
  })
}

export { createFile }
