import { logger } from '../utils/logger'
import { Assignment, PCMember, Person, Submission, SubmissionAutorship } from '../types'

export const getSubmissions = async (domainId: string): Promise<Submission[]> => {
  logger.log('info', 'services::submissions::getSubmissions: Retrieving submissions...')

  // TODO return only from domain id
  const submission = await Submission.findAll()

  logger.log('info', `services::submissions::getSubmissions: Done retrieving ${submission.length} submissions for domain ${domainId}`)

  return submission
}

export const createSubmissions = async (submissions: any): Promise<Submission[]> => {
  logger.log('info', 'services::submissions::createSubmissions: Bulk creating submissions...')

  const createdSubmissions = await Submission.bulkCreate(submissions)

  logger.log('info', 'services::submissions::createSubmissions: Done bulk creating submissions')

  return createdSubmissions
}

export const createSubmissionAuthorships = async (authorships: any): Promise<SubmissionAutorship[]> => {
  logger.log('info', 'services::submissions::createSubmissionAuthorships: Bulk creating authorships...')

  const createdSubmissions = await SubmissionAutorship.bulkCreate(authorships)

  logger.log('info', 'services::submissions::createSubmissionAuthorships: Done bulk creating authorships')

  return createdSubmissions
}

export const getDomainAssignments = async (domainId: string): Promise<Assignment[]> => {
  logger.log('info', `services::submissions::getDomainAssignments: Retrieving domain ${domainId} assignments...`)

  const assignments = await Assignment.findAll({
    include: [{
      model: PCMember,
      as: 'pcmember',
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

  logger.log('info', 'services::submissions::getDomainAssignments: Done retrieving assignments')

  return assignments
}

export const createAssignments = async (assignments: any): Promise<Assignment[]> => {
  logger.log('info', 'services::submissions::createAssignments: Bulk creating assignments...')

  const createdAssignments = await Assignment.bulkCreate(assignments)

  logger.log('info', 'services::submissions::createAssignments: Done bulk creating assignments')

  return createdAssignments
}
