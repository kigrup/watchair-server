import { Author, Chair, PCMember, SeniorPCMember } from '../types'

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
  console.log(`services::persons::getPersons: Retrieved all persons. ${persons.authors.length} authors, ${persons.pcMembers.length} PC Members, ${persons.seniorPCMembers.length} Senior PC Members, ${persons.chairs.length} chairs`)

  return persons
}

export const createPersons = async (authorsData: any, pcMembersData: any, seniorPCMembersData: any, chairsData: any): Promise<void> => {
  console.log('services::persons::createPersons: Bulk creating persons...')
  await Promise.all([
    Author.bulkCreate(authorsData),
    PCMember.bulkCreate(pcMembersData),
    SeniorPCMember.bulkCreate(seniorPCMembersData),
    Chair.bulkCreate(chairsData)
  ])
  console.log('services::persons::createPersons: Done bulk creating persons')
}

export const getAuthors = async (domainId: string): Promise<Author[]> => {
  const authors: Author[] = await Author.findAll({
    where: {
      domainId: domainId
    }
  })

  console.log(`services::persons::getAuthors: Retrieved all ${authors.length} Authors. `)

  return authors
}

export const getPCMembers = async (domainId: string): Promise<PCMember[]> => {
  const pcMembers: PCMember[] = await PCMember.findAll({
    where: {
      domainId: domainId
    }
  })

  console.log(`services::persons::getPCMembers: Retrieved all ${pcMembers.length} PCMembers. `)

  return pcMembers
}

export const getSeniorPCMembers = async (domainId: string): Promise<SeniorPCMember[]> => {
  const seniorPCMembers: SeniorPCMember[] = await SeniorPCMember.findAll({
    where: {
      domainId: domainId
    }
  })

  console.log(`services::persons::getSeniorPCMembers: Retrieved all ${seniorPCMembers.length} SeniorPCMembers. `)

  return seniorPCMembers
}

export const getChairs = async (domainId: string): Promise<Chair[]> => {
  const chairs: Chair[] = await Chair.findAll({
    where: {
      domainId: domainId
    }
  })

  console.log(`services::persons::getChairs: Retrieved all ${chairs.length} Chairs. `)

  return chairs
}
