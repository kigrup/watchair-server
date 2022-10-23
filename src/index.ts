import express from 'express'
/* import fs from 'fs' */

import { fileRouter } from './routes/files'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api/v1/files', fileRouter)

const PORT = 42525

app.get('/ping', (_req, res) => {
  console.log('Incoming connection...')
  console.log(__dirname)
  res.send(`Pong @ ${new Date().toISOString()}`)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
