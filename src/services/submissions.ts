import { Assignment, Submission, SubmissionAutorship } from '../types'

export const createSubmissions = async (submissions: any): Promise<Submission[]> => {
  console.log('services::submissions::createSubmissions: Bulk creating submissions...')

  const createdSubmissions = await Submission.bulkCreate(submissions)

  console.log('services::submissions::createSubmissions: Done bulk creating submissions')

  return createdSubmissions
}

export const createSubmissionAuthorships = async (authorships: any): Promise<SubmissionAutorship[]> => {
  console.log('services::submissions::createSubmissionAuthorships: Bulk creating authorships...')

  const createdSubmissions = await SubmissionAutorship.bulkCreate(authorships)

  console.log('services::submissions::createSubmissionAuthorships: Done bulk creating authorships')

  return createdSubmissions
}

export const createAssignments = async (assignments: any): Promise<Assignment[]> => {
  console.log('services::submissions::createAssignments: Bulk creating assignments...')

  const createdAssignments = await Assignment.bulkCreate(assignments)

  console.log('services::submissions::createAssignments: Done bulk creating assignments')

  return createdAssignments
}
