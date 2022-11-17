import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { corsAllow } from './middlewares/access-control'
import { errorHandlerMiddleware } from './middlewares/error-handler'

import { domainsRouter } from './routes/domains'
import { jobsRouter } from './routes/jobs'

const app: express.Application = express()

app.use(corsAllow)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1/domains', domainsRouter)
app.use('/api/v1/jobs', jobsRouter)
app.use(errorHandlerMiddleware)

app.get('/api/ping', (_req, res) => {
  console.log('Incoming connection...')
  console.log(__dirname)
  res.status(StatusCodes.OK).json({ pong: new Date().toISOString() })
})

export { app }
