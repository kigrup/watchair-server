import { logger } from '../utils/logger'
import { Author, AuthorAttributes, Chair, ChairAttributes, PCMember, PCMemberAttributes, Person, PersonAttributes, SeniorPCMember, SeniorPCMemberAttributes } from '../types'

export interface Persons {
  authors: Author[]
  pcMembers: PCMember[]
  seniorPCMembers: SeniorPCMember[]
  chairs: Chair[]
}

export const getPersons = async (domainId: string): Promise<Persons> => {
  const results = await Promise.all([
    getAuthors(domainId),
    getPCMembers(domainId),
    getSeniorPCMembers(domainId),
    getChairs(domainId)
  ])
  const persons: Persons = {
    authors: results[0],
    pcMembers: results[1],
    seniorPCMembers: results[2],
    chairs: results[3]
  }
  logger.log('info', `services::persons::getPersons: Retrieved all persons. ${persons.authors.length} authors, ${persons.pcMembers.length} PC Members, ${persons.seniorPCMembers.length} Senior PC Members, ${persons.chairs.length} chairs`)

  return persons
}

export const createPersons = async (persons: PersonAttributes[]): Promise<Person[]> => {
  logger.log('info', 'services::persons::createPersons: Creating persons...')

  const createdPersons: Person[] = []
  for (let i = 0; i < persons.length; i++) {
    logger.log('info', 'services::persons::createPersons: creating person:')
    logger.log('info', persons[i])
    const createdPerson: Person = await Person.create(persons[i])
    createdPersons.push(createdPerson)
  }

  logger.log('info', 'services::persons::createPersons: Done creating reviews')

  return createdPersons
}

export const createAuthors = async (authors: AuthorAttributes[]): Promise<Author[]> => {
  logger.log('info', 'services::persons::createAuthors: Creating authors...')

  const createdAuthors: Author[] = []
  for (let i = 0; i < authors.length; i++) {
    logger.log('info', 'services::persons::createdAuthors: creating author:')
    logger.log('info', authors[i])

    const createdAuthor: Author = await Author.create(authors[i])
    createdAuthors.push(createdAuthor)
  }

  logger.log('info', 'services::persons::createdAuthors: Done creating authors')

  return createdAuthors
}

export const createPCMembers = async (pcMembers: PCMemberAttributes[]): Promise<PCMember[]> => {
  logger.log('info', 'services::persons::createPCMembers: Creating pcMembers...')

  const createdPCMembers: PCMember[] = []
  for (let i = 0; i < pcMembers.length; i++) {
    logger.log('info', 'services::persons::createPCMembers: creating pcMember:')
    logger.log('info', pcMembers[i])

    const createdPCMember: PCMember = await PCMember.create(pcMembers[i])
    createdPCMembers.push(createdPCMember)
  }

  logger.log('info', 'services::persons::createPCMembers: Done creating pcMembers')

  return createdPCMembers
}

export const createSeniorPCMembers = async (seniorPcMembers: SeniorPCMemberAttributes[]): Promise<SeniorPCMember[]> => {
  logger.log('info', 'services::persons::createSeniorPCMembers: Creating seniorPcMembers...')

  const createdSeniorPCMembers: SeniorPCMember[] = []
  for (let i = 0; i < seniorPcMembers.length; i++) {
    logger.log('info', 'services::persons::createSeniorPCMembers: creating seniorPcMembers:')
    logger.log('info', seniorPcMembers[i])

    const createdSeniorPCMember: SeniorPCMember = await SeniorPCMember.create(seniorPcMembers[i])
    createdSeniorPCMembers.push(createdSeniorPCMember)
  }

  logger.log('info', 'services::persons::createSeniorPCMembers: Done creating seniorPcMembers')

  return createdSeniorPCMembers
}

export const createChairs = async (chairs: ChairAttributes[]): Promise<Chair[]> => {
  logger.log('info', 'services::persons::createChairs: Creating chairs...')

  const createdChairs: Chair[] = []
  for (let i = 0; i < chairs.length; i++) {
    logger.log('info', 'services::persons::createChairs: creating chairs:')
    logger.log('info', chairs[i])

    const createdChair: Chair = await Chair.create(chairs[i])
    createdChairs.push(createdChair)
  }

  logger.log('info', 'services::persons::createChairs: Done creating chairs')

  return createdChairs
}

export const getAuthors = async (domainId: string): Promise<Author[]> => {
  const authors: Author[] = await Author.findAll({
    include: [{
      model: Person,
      as: 'person',
      required: true,
      where: {
        domainId: domainId
      }
    }]
  })

  logger.log('info', `services::persons::getAuthors: Retrieved all ${authors.length} Authors. `)

  return authors
}

export const getPCMembers = async (domainId: string): Promise<PCMember[]> => {
  const pcMembers: PCMember[] = await PCMember.findAll({
    include: [{
      model: Person,
      as: 'person',
      required: true,
      where: {
        domainId: domainId
      }
    }]
  })

  logger.log('info', `services::persons::getPCMembers: Retrieved all ${pcMembers.length} PCMembers. `)

  return pcMembers
}

export const getSeniorPCMembers = async (domainId: string): Promise<SeniorPCMember[]> => {
  const seniorPCMembers: SeniorPCMember[] = await SeniorPCMember.findAll({
    include: [{
      model: PCMember,
      as: 'pcMember',
      required: true,
      include: [{
        model: Person,
        as: 'person',
        required: true,
        where: {
          domainId: domainId
        }
      }]
    }]
  })

  logger.log('info', `services::persons::getSeniorPCMembers: Retrieved all ${seniorPCMembers.length} SeniorPCMembers. `)

  return seniorPCMembers
}

export const getChairs = async (domainId: string): Promise<Chair[]> => {
  const chairs: Chair[] = await Chair.findAll({
    include: [{
      model: SeniorPCMember,
      as: 'seniorPcMember',
      required: true,
      include: [{
        model: PCMember,
        as: 'pcMember',
        required: true,
        include: [{
          model: Person,
          as: 'person',
          required: true,
          where: {
            domainId: domainId
          }
        }]
      }]
    }]
  })

  logger.log('info', `services::persons::getChairs: Retrieved all ${chairs.length} Chairs. `)

  return chairs
}
