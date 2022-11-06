import { Request } from 'express'
import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { BadRequestError } from '../errors/bad-request'
import { Domain } from '../types'

export const validateNewDomain = (req: Request): Domain => {
  if (req.body === undefined) {
    throw new BadRequestError('Request body is missing')
  }
  console.log(`validations::domains::validateNewDomain: Request body = ${inspect(req.body, { showHidden: false, depth: 2 })}`)

  if (req.body.name === undefined) {
    throw new BadRequestError('Domain name is missing')
  }
  const id: string = nanoid()
  const name: string = req.body.name

  const newDomain: Domain = Domain.build({
    id: id,
    name: name
  })

  console.log(`validations::domains::validateNewDomain: newDomain: ${inspect(newDomain, { depth: 1 })}`)

  return newDomain
}
