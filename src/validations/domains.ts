import { Request } from 'express'
import { inspect } from 'util'
import { logger } from '../utils/logger'
import { BadRequestError } from '../errors/bad-request'

export const validateNewDomain = (req: Request): boolean => {
  if (req.body === undefined) {
    throw new BadRequestError('Request body is missing')
  }
  logger.log('info', `validations::domains::validateNewDomain: Request body = ${inspect(req.body, { showHidden: false, depth: 2 })}`)

  if (req.body.name === undefined) {
    throw new BadRequestError('Domain name is missing')
  }

  logger.log('info', 'validations::domains::validateNewDomain: Request is valid for new domain creation')

  return true
}
