import path from 'node:path'

import dotenv from 'dotenv'

const baseDir = path.resolve(import.meta.dirname, '..', '..', '..')

dotenv.config({
  debug: process.env.NODE_ENV !== 'production',
  path: [path.join(baseDir, '.env.local'), path.join(baseDir, '.env')],
})

function getEnvString(envVar: string, defaultValue: null): string | null
function getEnvString(envVar: string, defaultValue?: string): string
function getEnvString(envVar: string, defaultValue?: string | null): string | null {
  const val = process.env[envVar]
  if (!val) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`${envVar} not set`)
  }
  return val
}

function getEnvNumber(envVar: string, defaultValue?: number): number {
  const val = process.env[envVar]
  if (!val) {
    if (defaultValue) {
      return defaultValue
    }
    throw new Error(`${envVar} not set`)
  }
  return Number.parseInt(val, 10)
}

function getEnvBoolean(envVar: string, defaultValue?: boolean): boolean {
  const val = process.env[envVar]
  if (!val) {
    if (defaultValue) {
      return defaultValue
    }
    throw new Error(`${envVar} not set`)
  }
  return ['true', 'yes', '1'].includes(val.toLowerCase())
}

function getConfig(): Config {
  const viteBaseUrl = getEnvString('VITE_BASE_URL')
  const icecastUrl = getEnvString('ICECAST_URL')
  const redisUrl = getEnvString('REDIS_URL')
  const jwtSecret = getEnvString('JWT_SECRET')
  const notifyDelay = getEnvNumber('NOTIFY_DELAY')
  const smtpHost = getEnvString('SMTP_HOST')
  const smtpPort = getEnvNumber('SMTP_PORT', 587)
  const smtpSecure = getEnvBoolean('SMTP_SECURE')
  const smtpUser = getEnvString('SMTP_USER', null)
  const smtpPassword = getEnvString('SMTP_PWD', null)
  const smtpSender = getEnvString('SMTP_SENDER')
  const smtpIgnoreInvalidCert = getEnvBoolean('SMTP_IGNORE_INVALID_CERT', false)

  return {
    viteBaseUrl,
    icecastUrl,
    redisUrl,
    jwtSecret,
    notifyDelay,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPassword,
    smtpSender,
    smtpIgnoreInvalidCert,
  }
}

interface Config {
  viteBaseUrl: string
  icecastUrl: string
  redisUrl: string
  jwtSecret: string
  notifyDelay: number
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string | null
  smtpPassword: string | null
  smtpSender: string
  smtpIgnoreInvalidCert: boolean
}

export type { Config }
export default getConfig
