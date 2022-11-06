import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { Domain } from '../types'
import { validateNewDomain } from '../validations/domains'
import { inspect } from 'util'
import { BadRequestError } from '../errors/bad-request'
import { createDomain } from '../services/domains'

export const getDomainsHandler: RequestHandler = async (_req, res, _next) => {
  console.log('controllers::domains::getDomainsHandler: Received domains GET request')
  res.status(StatusCodes.OK)
}

export const createDomainHandler: RequestHandler = async (req, res, next) => {
  console.log('controllers::domains::getDomainsHandler: Received domains POST request')
  try {
    validateNewDomain(req)
    const name: string = req.body.name
    const newDomain: Domain = await createDomain(name)

    res.status(StatusCodes.CREATED).json(newDomain)
  } catch (error) {
    next(error)
  }
}

export const createFileHandler: RequestHandler = async (req, res, next) => {
  console.log(`controllers::domains:createFileHandler: Received createFile request with file: ${(req.file != null) ? inspect(req.file, { depth: 1 }) : 'none'}`)
  try {
    if (req.file === undefined) {
      throw new BadRequestError('Request contains no file or it got filtered. Does the file have an allowed extension? ie. .XLSX')
    }
    res.status(StatusCodes.CREATED).json({
      id: req.file?.filename
    })
  } catch (error) {
    next(error)
  }
}
