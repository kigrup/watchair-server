import { logger } from './utils/logger'
import { app } from './app'
import { syncDatabase } from './services/database'

const PORT = 42525

app.listen(PORT, async () => {
  logger.log('info', `Server running on port ${PORT}`)
  void syncDatabase(false)
})
