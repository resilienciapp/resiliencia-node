declare namespace NodeJS {
  type EnvVar =
    | 'APP_VERSION_ANDROID'
    | 'APP_VERSION_IOS'
    | 'DATABASE_URL'
    | 'FIREBASE_AUTH_KEY'
    | 'FIREBASE_DATABASE_URL'
    | 'FIREBASE_PROJECT_ID'
    | 'FIREBASE_SERVICE_ACCOUNT'
    | 'JWT_PRIVATE_KEY'
    | 'JWT_PUBLIC_KEY'
    | 'LOGDNA_APP'
    | 'LOGDNA_INGESTION_KEY'
    | 'NODE_ENV'
    | 'PORT'
    | 'REDIS_URL'

  export interface ProcessEnv extends Record<EnvVar, string> {
    TZ: 'UTC'
  }
}
