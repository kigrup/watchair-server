import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { Domain, JobSubtype, JobType, Metric, ProcessingJob, Review, Submission } from '../types'
import { validateNewDomain } from '../validations/domains'
import { inspect } from 'util'
import { BadRequestError } from '../errors/bad-request'
import { createDomain, deleteDomain, getDomain, getDomains } from '../services/domains'
import { createProcessingJob } from '../services/jobs'
import { NotFoundError } from '../errors/not-found'
import { getPersons, Persons } from '../services/persons'
import { getDomainReviews } from '../services/reviews'
import { getDomainMetrics } from '../services/metrics'
import { logger } from '../utils/logger'
import { getSubmissions } from '../services/submissions'
import { getDomainComments } from '../services/comments'

export const getDomainHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getDomainHandler: Received domains GET request')
  try {
    const domainId = req.params.domainId
    const domain: Domain | null = await getDomain(domainId)
    if (domain === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    res.status(StatusCodes.OK).json(domain)
  } catch (error) {
    next(error)
  }
}

export const getDomainsHandler: RequestHandler = async (_req, res, next) => {
  logger.log('info', 'controllers::domains::getDomainsHandler: Received domains GET request')
  try {
    const domains: Domain[] = await getDomains()
    res.status(StatusCodes.OK).json(domains)
  } catch (error) {
    next(error)
  }
}

export const createDomainHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getDomainsHandler: Received domains POST request')
  try {
    validateNewDomain(req)
    const name: string = req.body.name
    const startDate: Date | undefined = req.body.startDate !== undefined ? new Date(req.body.startDate) : undefined
    const endDate: Date | undefined = req.body.endDate !== undefined ? new Date(req.body.endDate) : undefined

    const newDomain: Domain = await createDomain(name, startDate, endDate)

    res.status(StatusCodes.CREATED).json(newDomain)
  } catch (error) {
    next(error)
  }
}

export const deleteDomainHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::deleteDomainHandler: Received domains DELETE request')
  try {
    const domainId = req.params.domainId
    const domainDeleted: boolean = await deleteDomain(domainId)
    if (!domainDeleted) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    res.status(StatusCodes.NO_CONTENT).send()
  } catch (error) {
    next(error)
  }
}

export const createFileHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', `controllers::domains:createFileHandler: Received createFile request with file: ${(req.file != null) ? inspect(req.file, { depth: 1 }) : 'none'}`)
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }

    if (req.file === undefined) {
      throw new BadRequestError('Request contains no file or it got filtered. Does the file have an allowed extension? ie. .XLSX')
    }

    const fileName: string = req.file.filename
    const job: ProcessingJob = await createProcessingJob(JobType.FILE, JobSubtype.EXCEL, fileName, domainId)

    res.status(StatusCodes.CREATED).json({
      job
    })
  } catch (error) {
    next(error)
  }
}

export const getPersonsHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getPersonsHandler: Received persons GET request')
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    const persons: Persons = await getPersons(domainId)
    res.status(StatusCodes.OK).json(persons)
  } catch (error) {
    next(error)
  }
}

export const getSubmissionsHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getSubmissions: Received submissions GET request')
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    const submissions: Submission[] = await getSubmissions(domainId)
    res.status(StatusCodes.OK).json(submissions)
  } catch (error) {
    next(error)
  }
}

export const getReviewsHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getReviewsHandler: Received reviews GET request')
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    const reviews: Review[] = await getDomainReviews(domainId)
    res.status(StatusCodes.OK).json(reviews)
  } catch (error) {
    next(error)
  }
}

export const getCommentsHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getCommentsHandler: Received comments GET request')
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    const comments: Comment[] = await getDomainComments(domainId)
    res.status(StatusCodes.OK).json(comments)
  } catch (error) {
    next(error)
  }
}

export const getMetricsHandler: RequestHandler = async (req, res, next) => {
  logger.log('info', 'controllers::domains::getMetricsHandler: Received metrics GET request')
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    const metrics: Metric[] = await getDomainMetrics(domainId)
    res.status(StatusCodes.OK).json(metrics)
  } catch (error) {
    next(error)
  }
}
