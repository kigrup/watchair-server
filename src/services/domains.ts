import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { NotFoundError } from '../errors/not-found'
import { Domain } from '../types'

export const getDomain = async (domainId: string): Promise<Domain> => {
  const domain = await Domain.findOne({
    where: {
      id: domainId
    }
  })

  if (domain === null) {
    throw new NotFoundError('Invalid Domain Id.')
  }

  return domain
}

export const createDomain = async (name: string): Promise<Domain> => {
  const newDomain: Domain = await Domain.create({
    id: nanoid(),
    name: name
  })

  console.log(`services::domains::createDomain: Created new Domain: ${inspect(newDomain, { depth: 1 })}`)

  return newDomain
}
