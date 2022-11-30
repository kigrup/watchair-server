import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'watchair-error.log', level: 'error' }),
    new transports.File({ filename: 'watchair-combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  console.log('NODE_ENV Not production, logging to console too...')
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }))
}
