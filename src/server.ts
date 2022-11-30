import { sequelize } from './types'
import { logger } from './utils/logger'
import { app } from './app'

const PORT = 42525

app.listen(PORT, () => {
  logger.log('info', `Server running on port ${PORT}`)
  sequelize.sync({ force: true })
    .then(() => {
      logger.log('info', 'Sequelize db synced')
    })
    .catch((error) => {
      logger.log('info', 'Sequelize db failed to sync:')
      logger.log('info', error)
    })
})
