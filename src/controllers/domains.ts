import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { Domain, JobSubtype, JobType, ProcessingJob, Review, UnitMetric } from '../types'
import { validateNewDomain } from '../validations/domains'
import { inspect } from 'util'
import { BadRequestError } from '../errors/bad-request'
import { createDomain, deleteDomain, getDomain, getDomains } from '../services/domains'
import { createProcessingJob } from '../services/jobs'
import { NotFoundError } from '../errors/not-found'
import { getPersons, Persons } from '../services/persons'
import { getDomainReviews } from '../services/reviews'
import { getDomainUnitMetrics } from '../services/metrics'

export const getDomainHandler: RequestHandler = async (req, res, next) => {
  console.log('controllers::domains::getDomainHandler: Received domains GET request')
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
  console.log('controllers::domains::getDomainsHandler: Received domains GET request')
  try {
    const domains: Domain[] = await getDomains()
    res.status(StatusCodes.OK).json(domains)
  } catch (error) {
    next(error)
  }
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

export const deleteDomainHandler: RequestHandler = async (req, res, next) => {
  console.log('controllers::domains::deleteDomainHandler: Received domains DELETE request')
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
  console.log(`controllers::domains:createFileHandler: Received createFile request with file: ${(req.file != null) ? inspect(req.file, { depth: 1 }) : 'none'}`)
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
  console.log('controllers::domains::getPersonsHandler: Received persons GET request')
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

export const getReviewsHandler: RequestHandler = async (req, res, next) => {
  console.log('controllers::domains::getReviewsHandler: Received reviews GET request')
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

export const getUnitMetricsHandler: RequestHandler = async (req, res, next) => {
  console.log('controllers::domains::getUnitMetricsHandler: Received unit metrics GET request')
  try {
    const domainId = req.params.domainId
    if (await getDomain(domainId) === null) {
      throw new NotFoundError('Invalid Domain Id.')
    }
    const unitMetrics: UnitMetric[] = await getDomainUnitMetrics(domainId)
    res.status(StatusCodes.OK).json(unitMetrics)
  } catch (error) {
    next(error)
  }
}
