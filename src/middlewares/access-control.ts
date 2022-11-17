import { RequestHandler } from 'express'

export const corsAllow: RequestHandler = (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') // TODO: update to match the domain you will make the requests from
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST')
  next()
}
