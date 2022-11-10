import { Chair, PCMember, SeniorPCMember } from '../types'

export interface Persons {
  pcMembers: PCMember[]
  seniorPCMembers: SeniorPCMember[]
  chairs: Chair[]
}

export const getPersons = async (domainId: string): Promise<Persons> => {
  const results = await Promise.all([
    getPCMembers(domainId),
    getSeniorPCMembers(domainId),
    getChairs(domainId)
  ])
  const persons: Persons = {
    pcMembers: results[0],
    seniorPCMembers: results[1],
    chairs: results[2]
  }
  console.log(`services::persons::getPersons: Retrieved all persons. ${persons.pcMembers.length} PC Members, ${persons.seniorPCMembers.length} Senior PC Members, ${persons.chairs.length} chairs`)

  return persons
}

export const createPersons = async (pcMembersData: any, seniorPCMembersData: any, chairsData: any): Promise<void> => {
  console.log('services::persons::createPersons: Bulk creating persons...')
  await Promise.all([
    PCMember.bulkCreate(pcMembersData),
    SeniorPCMember.bulkCreate(seniorPCMembersData),
    Chair.bulkCreate(chairsData)
  ])
  console.log('services::persons::createPersons: Done bulk creating persons')
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

  console.log(`services::persons::getPCMembers: Retrieved all ${seniorPCMembers.length} PCMembers. `)

  return seniorPCMembers
}

export const getChairs = async (domainId: string): Promise<Chair[]> => {
  const chairs: Chair[] = await Chair.findAll({
    where: {
      domainId: domainId
    }
  })

  console.log(`services::persons::getPCMembers: Retrieved all ${chairs.length} PCMembers. `)

  return chairs
}
