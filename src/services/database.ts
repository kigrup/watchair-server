import { sequelize } from '../types'
import { logger } from '../utils/logger'

export const syncDatabase = async (force: boolean): Promise<boolean> => {
  try {
    await sequelize.sync({ force: force })
    logger.log('info', 'Sequelize db synced')
    return true
  } catch (error) {
    logger.log('info', 'Sequelize db failed to sync:')
    logger.log('info', error)
    return false
  }
}
