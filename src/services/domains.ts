import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { Domain } from '../types'
import { logger } from '../utils/logger'

export const getDomain = async (domainId: string): Promise<Domain | null> => {
  const domain = await Domain.findOne({
    where: {
      id: domainId
    }
  })

  logger.log('info', `services::domains::getDomain: Retrieved Domain: ${inspect(domain, { depth: 1 })}`)

  return domain
}

export const getDomains = async (): Promise<Domain[]> => {
  const domains = await Domain.findAll({
    order: [
      ['name', 'ASC'],
      ['id', 'ASC']
    ]
  })

  logger.log('info', `services::domains::getDomains: Retrieved all ${domains.length} domains`)

  return domains
}

export const createDomain = async (name: string, startDate: Date | undefined, endDate: Date | undefined): Promise<Domain> => {
  const newDomain: Domain = await Domain.create({
    id: nanoid(),
    name: name,
    startDate: startDate,
    endDate: endDate
  })

  logger.log('info', `services::domains::createDomain: Created new Domain: ${inspect(newDomain, { depth: 1 })}`)

  return newDomain
}

export const deleteDomain = async (id: string): Promise<boolean> => {
  const domain: Domain | null = await getDomain(id)

  if (domain === null) {
    logger.log('info', 'services::domains::createDomain: Tried to delete nonexistent domain')
    return false
  } else {
    await domain.destroy()
    logger.log('info', 'services::domains::createDomain: Deleted domain')
    return true
  }
}
