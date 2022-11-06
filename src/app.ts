import express from 'express'
import { errorHandlerMiddleware } from './middlewares/error-handler'

import { domainRouter } from './routes/domains'

const app: express.Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1/domains', domainRouter)
app.use(errorHandlerMiddleware)

app.get('/ping', (_req, res) => {
  console.log('Incoming connection...')
  console.log(__dirname)
  res.send(`Pong @ ${new Date().toISOString()}`)
})

export { app }
