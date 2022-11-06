import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { Domain } from '../types'
import { validateNewDomain } from '../validations/domains'
import { inspect } from 'util'

export const getDomainsHandler: RequestHandler = async (_req, res, _next) => {
  console.log('Domain Controller: getDomains request')
  res.status(StatusCodes.OK)
}

export const createDomainHandler: RequestHandler = async (req, res, next) => {
  console.log('Domain Controller: createDomain request')
  try {
    const builtDomain: Domain = validateNewDomain(req)
    const newDomain: Domain = await builtDomain.save()

    console.log(`Saved new Domain: ${inspect(newDomain, { depth: 2 })}`)

    res.status(StatusCodes.CREATED).json(newDomain)
  } catch (error) {
    next(error)
  }
  res.status(StatusCodes.CREATED)
}

export const createFileHandler: RequestHandler = async (req, res, _next) => {
  console.log('Domain Controller: createFile request')
  res.status(StatusCodes.CREATED).json({
    id: req.file?.filename
  })
}
