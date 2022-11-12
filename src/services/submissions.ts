import { Submission } from '../types'

export const createSubmissions = async (submissions: any): Promise<Submission[]> => {
  console.log('services::submissions::createSubmissions: Bulk creating submissions...')

  const createdSubmissions = await Submission.bulkCreate(submissions)

  console.log('services::submissions::createSubmissions: Done bulk creating submissions')

  return createdSubmissions
}
