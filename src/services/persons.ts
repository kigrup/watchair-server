import { nanoid } from 'nanoid'
import { Author, Chair, PCMember, Person, SeniorPCMember } from '../types'

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

const createPersons = async (persons: any): Promise<Person[]> => {
  console.log('services::persons::createPersons: Creating persons...')

  const createdPersons: Person[] = []
  for (let i = 0; i < persons.length; i++) {
    const person: any = {
      id: persons[i].id,
      firstName: persons[i].firstName,
      lastName: persons[i].lastName,
      domainId: persons[i].domainId
    }
    console.log('services::persons::createPersons: creating person:')
    console.log(person)
    const createdPerson: Person = await Person.create(person)
    createdPersons.push(createdPerson)
  }

  console.log('services::persons::createPersons: Done creating reviews')

  return createdPersons
}

export const createAuthors = async (authors: any): Promise<Author[]> => {
  console.log('services::persons::createAuthors: Creating authors...')

  const createdAuthors: Author[] = []
  for (let i = 0; i < authors.length; i++) {
    const author = authors[i]
    console.log('services::persons::createdAuthors: creating author:')
    console.log(author)

    const createdPerson: Person[] = await createPersons([author])
    if (createdPerson.length > 0) {
      const authorId = (author.authorId === undefined) ? nanoid() : author.authorId
      const newAuthor: any = {
        id: authorId,
        personId: createdPerson[0].id
      }
      const createdAuthor: Author = await Author.create(newAuthor)
      createdAuthors.push(createdAuthor)
    }
  }

  console.log('services::persons::createdAuthors: Done creating authors')

  return createdAuthors
}

export const createPCMembers = async (pcMembers: any): Promise<PCMember[]> => {
  console.log('services::persons::createPCMembers: Creating pcMembers...')

  const createdPCMembers: PCMember[] = []
  for (let i = 0; i < pcMembers.length; i++) {
    const pcMember = pcMembers[i]
    console.log('services::persons::createPCMembers: creating pcMember:')
    console.log(pcMember)

    const createdPerson: Person[] = await createPersons([pcMember])
    if (createdPerson.length > 0) {
      const pcMemberId = (pcMember.pcMemberId === undefined) ? nanoid() : pcMember.pcMemberId
      const newPCMember: any = {
        id: pcMemberId,
        personId: createdPerson[0].id
      }
      const createdPCMember: PCMember = await PCMember.create(newPCMember)
      createdPCMembers.push(createdPCMember)
    }
  }

  console.log('services::persons::createPCMembers: Done creating pcMembers')

  return createdPCMembers
}

export const createSeniorPCMembers = async (seniorPcMembers: any): Promise<SeniorPCMember[]> => {
  console.log('services::persons::createSeniorPCMembers: Creating seniorPcMembers...')

  const createdSeniorPCMembers: SeniorPCMember[] = []
  for (let i = 0; i < seniorPcMembers.length; i++) {
    const seniorPcMember = seniorPcMembers[i]
    console.log('services::persons::createSeniorPCMembers: creating seniorPcMembers:')
    console.log(seniorPcMember)

    const createdPCMember: PCMember[] = await createPCMembers([seniorPcMember])
    if (createdPCMember.length > 0) {
      const seniorPcMemberId = (seniorPcMember.seniorPcMemberId === undefined) ? nanoid() : seniorPcMember.seniorPcMemberId
      const newSeniorPCMember: any = {
        id: seniorPcMemberId,
        pcMemberId: createdPCMember[0].id
      }
      const createdSeniorPCMember: SeniorPCMember = await SeniorPCMember.create(newSeniorPCMember)
      createdSeniorPCMembers.push(createdSeniorPCMember)
    }
  }

  console.log('services::persons::createSeniorPCMembers: Done creating seniorPcMembers')

  return createdSeniorPCMembers
}

export const createChairs = async (chairs: any): Promise<Chair[]> => {
  console.log('services::persons::createChairs: Creating chairs...')

  const createdChairs: Chair[] = []
  for (let i = 0; i < chairs.length; i++) {
    const chair = chairs[i]
    console.log('services::persons::createChairs: creating chairs:')
    console.log(chair)

    const createdSeniorPCMember: SeniorPCMember[] = await createSeniorPCMembers([chair])
    if (createdSeniorPCMember.length > 0) {
      const chairId = (chair.chairId === undefined) ? nanoid() : chair.chairId
      const newChair: any = {
        id: chairId,
        seniorPcMemberId: createdSeniorPCMember[0].id
      }
      const createdChair: Chair = await Chair.create(newChair)
      createdChairs.push(createdChair)
    }
  }

  console.log('services::persons::createChairs: Done creating chairs')

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

  console.log(`services::persons::getAuthors: Retrieved all ${authors.length} Authors. `)

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

  console.log(`services::persons::getPCMembers: Retrieved all ${pcMembers.length} PCMembers. `)

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

  console.log(`services::persons::getSeniorPCMembers: Retrieved all ${seniorPCMembers.length} SeniorPCMembers. `)

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

  console.log(`services::persons::getChairs: Retrieved all ${chairs.length} Chairs. `)

  return chairs
}
