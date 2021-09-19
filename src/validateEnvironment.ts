import { chain } from 'lodash'
import { format } from 'util'

const environmentVariables = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
  LOGDNA_APP: process.env.LOGDNA_APP,
  LOGDNA_INGESTION_KEY: process.env.LOGDNA_INGESTION_KEY,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
}

export const validateEnvironment = () => {
  const missingEnvironmentVariables = chain(environmentVariables)
    .pickBy((value?: string) => value == undefined)
    .keys()
    .value()

  if (missingEnvironmentVariables.length > 0) {
    throw new Error(
      format(
        'Missing required environment variables: %s',
        missingEnvironmentVariables.join(', '),
      ),
    )
  }
}
