import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { Domain } from '../types'

export const getDomain = async (domainId: string): Promise<Domain | null> => {
  const domain = await Domain.findOne({
    where: {
      id: domainId
    }
  })

  console.log(`services::domains::getDomain: Retrieved Domain: ${inspect(domain, { depth: 1 })}`)

  return domain
}

export const getDomains = async (): Promise<Domain[]> => {
  const domains = await Domain.findAll({
    order: [
      ['name', 'ASC'],
      ['id', 'ASC']
    ]
  })

  console.log(`services::domains::getDomains: Retrieved all ${domains.length} domains`)

  return domains
}

export const createDomain = async (name: string): Promise<Domain> => {
  const newDomain: Domain = await Domain.create({
    id: nanoid(),
    name: name
  })

  console.log(`services::domains::createDomain: Created new Domain: ${inspect(newDomain, { depth: 1 })}`)

  return newDomain
}
