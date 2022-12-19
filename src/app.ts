import express from 'express'
import { logger } from './utils/logger'
import { StatusCodes } from 'http-status-codes'
import { corsAllow } from './middlewares/access-control'
import { errorHandlerMiddleware } from './middlewares/error-handler'

import { databaseRouter } from './routes/database'
import { domainsRouter } from './routes/domains'
import { fieldsRouter } from './routes/fields'

const app: express.Application = express()

app.use(corsAllow)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1/database', databaseRouter)
app.use('/api/v1/domains', domainsRouter)
app.use('/api/v1/fields', fieldsRouter)
app.use(errorHandlerMiddleware)

app.get('/api/ping', (_req, res) => {
  logger.log('info', 'Incoming connection...')
  logger.log('info', __dirname)
  res.status(StatusCodes.OK).json({ pong: new Date().toISOString() })
})

export { app }
