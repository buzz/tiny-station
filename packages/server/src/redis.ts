import bcrypt from 'bcrypt'
import { Redis } from 'ioredis'

import type { ChatMessage } from '@listen-app/common'

const MESSAGES_KEY = 'messages'
const SUBSCRIPTIONS_KEY = 'subs'
const VERIFIED_KEY = 'ver'

const getNicknameKey = (nickname: string) => `nickname:${nickname}`
const getUserKey = (email: string) => `user:${email}`
const getTokenKey = (token: string) => `token:${token}`

class RedisConnection {
  private redis: Redis

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      keyPrefix: 'listen-app:',
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    })
  }

  async quit() {
    return this.redis.quit()
  }

  /* User */

  async nicknameExists(nickname: string) {
    return (await this.redis.exists(getNicknameKey(nickname))) === 1
  }

  async emailExists(email: string) {
    return (await this.redis.exists(getUserKey(email))) === 1
  }

  getEmail(nickname: string) {
    return this.redis.get(getNicknameKey(nickname))
  }

  async findUser(email: string) {
    const user = await this.redis.hgetall(getUserKey(email))

    // hgetall returns `{}` for missing key
    if (Object.keys(user).length === 0) {
      return null
    }

    const ver = await this.isVerified(email)
    const notif = await this.isSubscribed(email)

    return {
      email,
      nickname: user.nickname,
      ver,
      notif,
    }
  }

  async addUser(email: string, nickname: string, password: string, token: string) {
    const userKey = getUserKey(email)
    const tokenKey = getTokenKey(token)
    const hashedPassword = await bcrypt.hash(password, 10)
    const oneHour = 60 * 60

    return this.redis
      .pipeline()
      .hset(userKey, 'nickname', nickname, 'pwd', hashedPassword)
      .expire(userKey, oneHour)
      .set(getNicknameKey(nickname), email, 'EX', oneHour)
      .set(tokenKey, email, 'EX', oneHour)
      .exec()
  }

  async deleteUser(email: string) {
    const userKey = getUserKey(email)
    const nickname = await this.redis.hget(userKey, 'nickname')

    if (!nickname) {
      return
    }

    return this.redis
      .pipeline()
      .del(userKey)
      .del(getNicknameKey(nickname))
      .srem(VERIFIED_KEY, email)
      .exec()
  }

  deleteToken(token: string) {
    return this.redis.del(getTokenKey(token))
  }

  async verifyUser(token: string) {
    try {
      const tokenKey = getTokenKey(token)
      const email = await this.redis.get(tokenKey)

      if (email) {
        const userKey = getUserKey(email)
        const nickname = await this.redis.hget(userKey, 'nickname')

        if (!nickname) {
          return false
        }

        await this.redis
          .pipeline()
          .sadd(VERIFIED_KEY, email)
          .persist(userKey)
          .persist(getNicknameKey(nickname))
          .del(tokenKey)
          .exec()

        return true
      }
    } catch {
      // skip
    }
    return false
  }

  async verifyPassword(email: string, password: string) {
    try {
      const [hash] = await this.redis.hmget(getUserKey(email), 'pwd')

      if (!(await this.isVerified(email))) {
        return false
      }

      if (typeof hash !== 'string') {
        return false
      }

      return await bcrypt.compare(password, hash)
    } catch {
      // Skip
    }
    return false
  }

  async isVerified(email: string) {
    return (await this.redis.sismember(VERIFIED_KEY, email)) === 1
  }

  /* Email notifications */

  subscribe(email: string) {
    return this.redis.sadd(SUBSCRIPTIONS_KEY, email)
  }

  unsubscribe(email: string) {
    return this.redis.srem(SUBSCRIPTIONS_KEY, email)
  }

  async isSubscribed(email: string) {
    return (await this.redis.sismember(SUBSCRIPTIONS_KEY, email)) === 1
  }

  getSubscribedEmails() {
    return this.redis.sinter(SUBSCRIPTIONS_KEY, VERIFIED_KEY)
  }

  /* Chat */

  async getMessages(): Promise<ChatMessage[]> {
    const res = await this.redis.zrangebyscore(MESSAGES_KEY, '-inf', '+inf', 'WITHSCORES')

    const messages = []

    while (res.length > 0) {
      const timestampString = res.pop()
      if (!timestampString) {
        throw new Error('Expected timestamp')
      }
      const jsonData = res.pop()
      if (!jsonData) {
        throw new Error('Expected JSON data')
      }

      const timestamp = Number.parseInt(timestampString, 10)
      const [uuid, senderNickname, message] = JSON.parse(jsonData) as [string, string, string]

      messages.push({ uuid, timestamp, senderNickname, message })
    }

    return messages
  }

  storeMessage({ uuid, timestamp, senderNickname, message }: ChatMessage) {
    return this.redis.zadd(
      MESSAGES_KEY,
      String(timestamp),
      JSON.stringify([uuid, senderNickname, message])
    )
  }
}

export default RedisConnection
