import path from 'node:path'

import dotenv from 'dotenv'
import fastifyPlugin from 'fastify-plugin'

const baseDir = path.resolve(import.meta.dirname, '..', '..', '..', '..')

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

function getConfig(isDebug: boolean): Config {
  dotenv.config({
    debug: isDebug,
    path: [path.join(baseDir, '.env.local'), path.join(baseDir, '.env')],
  })

  const baseUrl = getEnvString('VITE_BASE_URL')
  const icecastUrl = getEnvString('ICECAST_URL')
  const redisUrl = getEnvString('REDIS_URL')
  const redisKeyPrefix = getEnvString('REDIS_KEY_PREFIX')
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
    isDebug,
    baseUrl,
    icecastUrl,
    redisUrl,
    redisKeyPrefix,
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
  isDebug: boolean
  baseUrl: string
  icecastUrl: string
  redisUrl: string
  redisKeyPrefix: string
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

const configPlugin = fastifyPlugin<{ isDebug: boolean }>((fastify, { isDebug }) => {
  fastify.decorate('config', getConfig(isDebug))
})

export type { Config }
export default configPlugin
