import { Redis } from 'ioredis'
import jwt from 'jsonwebtoken'

import RedisConnection from '#plugins/redis/RedisConnection.js'
import type { Config } from '#plugins/config.js'

function makeRedisConnection(config: Config) {
  const url = process.env.TEST_REDIS_URL
  if (!url) {
    throw new Error('TEST_REDIS_URL not set')
  }
  const redis = new Redis(url)
  const connection = new RedisConnection({ ...config, redisUrl: url }, redis)
  return { connection, redis }
}

function createTestToken(nickname: string, email: string, secret: string) {
  return jwt.sign({ user: { _id: email, nickname } }, secret)
}

export { createTestToken, makeRedisConnection }
