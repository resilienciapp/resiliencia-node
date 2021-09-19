import Logger from 'logdna'

type Message = string | object

const logger = Logger.createLogger(process.env.LOGDNA_INGESTION_KEY, {
  app: process.env.LOGDNA_APP,
})

export const logInfo =
  process.env.NODE_ENV === 'development'
    ? (info: Message) => console.log(info)
    : (info: Message) => logger.log(info.toString())

export const logError =
  process.env.NODE_ENV === 'development'
    ? (error: Message) => console.error(error)
    : (error: Message) => logger.error(error.toString())
