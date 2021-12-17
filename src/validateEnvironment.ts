import { chain } from 'lodash'
import { format } from 'util'

const environmentVariables = {
  DATABASE_URL: process.env.DATABASE_URL,
  FIREBASE_AUTH_KEY: process.env.FIREBASE_AUTH_KEY,
  FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT,
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
