import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { Domain, FileProcessingJob, JobStatus } from '../types'

export const getDomain = async (domainId: string): Promise<Domain | null> => {
  const domain = await Domain.findOne({
    where: {
      id: domainId
    }
  })

  console.log(`services::domains::getDomain: Retrieved Domain: ${inspect(domain, { depth: 1 })}`)

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

export const createFileProcessingJob = async (fileName: string, domainId: string): Promise<FileProcessingJob> => {
  const newJob: FileProcessingJob = await FileProcessingJob.create({
    id: nanoid(),
    domainId: domainId,
    fileName: fileName,
    status: JobStatus.RUNNING
  })

  console.log(`services::domains::createFileProcessingJob: Created new FileProcessingJob: ${inspect(newJob, { depth: 1 })}`)

  return newJob
}
