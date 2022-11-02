import { RequestHandler } from 'express-serve-static-core'
import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import { Domain } from '../types'
import { validateNewDomain } from '../validations/domains'

export const getDomains: RequestHandler = async (_req, res, _next) => {
  console.log('Domain Controller: getDomains request')
  res.status(StatusCodes.OK)
}

export const createDomain: RequestHandler = async (req, res, next) => {
  console.log('Domain Controller: createDomain request')
  try {
    validateNewDomain(req)

    const newId: string = nanoid()
    const newName: string = req.body.name
    const newDomain: Domain = await Domain.create({
      id: newId,
      name: newName
    })

    console.log(`Created newDomain with id ${newDomain.id}`)

    res.status(StatusCodes.CREATED).json({
      id: newDomain.id
    })
  } catch (error) {
    next(error)
  }
  res.status(StatusCodes.CREATED)
}

export const createFile: RequestHandler = async (req, res, _next) => {
  console.log('Domain Controller: createFile request')
  res.status(StatusCodes.CREATED).json({
    id: req.file?.filename
  })
}
