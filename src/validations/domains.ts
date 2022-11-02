import { Request } from 'express'
import { BadRequestError } from '../errors/bad-request'

export const validateNewDomain = (req: Request): void => {
  if (req.body === undefined) {
    throw new BadRequestError('Request body is missing')
  }
  if (req.body.name === undefined) {
    throw new BadRequestError('Domain name is missing')
  }
}
