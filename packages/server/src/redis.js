import bcrypt from 'bcrypt'
import Redis from 'ioredis'

const MESSAGES_KEY = 'messages'
const SUBSCRIPTIONS_KEY = 'subs'
const VERIFIED_KEY = 'ver'
const getNicknameKey = (nickname) => `nickname:${nickname}`
const getUserKey = (email) => `user:${email}`
const getTokenKey = (token) => `token:${token}`

class RedisConnection {
  redis = undefined

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      keyPrefix: 'listen-app:',
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    })
  }

  async quit() {
    return this.redis.quit()
  }

  /* User */

  async nicknameExists(nickname) {
    return (await this.redis.exists(getNicknameKey(nickname))) === 1
  }

  async emailExists(email) {
    return (await this.redis.exists(getUserKey(email))) === 1
  }

  getEmail(nickname) {
    return this.redis.get(getNicknameKey(nickname))
  }

  async findUser(email) {
    const user = await this.redis.hgetall(getUserKey(email))
    const ver = await this.isVerified(email)
    const notif = await this.isSubscribed(email)

    if (user) {
      return {
        email,
        nickname: user.nickname,
        ver,
        notif,
      }
    }
    return null
  }

  async addUser(email, nickname, password, token) {
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

  async deleteUser(email) {
    const userKey = getUserKey(email)
    const nickname = await this.redis.hget(userKey, 'nickname')
    return this.redis
      .pipeline()
      .del(userKey)
      .del(getNicknameKey(nickname))
      .srem(VERIFIED_KEY, email)
      .exec()
  }

  deleteToken(token) {
    return this.redis.del(getTokenKey(token))
  }

  async verifyUser(token) {
    try {
      const tokenKey = getTokenKey(token)
      const email = await this.redis.get(tokenKey)

      if (email) {
        const userKey = getUserKey(email)
        const nickname = await this.redis.hget(userKey, 'nickname')
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

  async verifyPassword(email, password) {
    try {
      const [hash] = await this.redis.hmget(getUserKey(email), 'pwd')
      if (!this.isVerified(email)) {
        return false
      }
      if (typeof hash !== 'string') {
        return false
      }

      return bcrypt.compare(password, hash)
    } catch {
      return false
    }
  }

  async isVerified(email) {
    return (await this.redis.sismember(VERIFIED_KEY, email)) === 1
  }

  /* Email notifications */

  subscribe(email) {
    return this.redis.sadd(SUBSCRIPTIONS_KEY, email)
  }

  unsubscribe(email) {
    return this.redis.srem(SUBSCRIPTIONS_KEY, email)
  }

  async isSubscribed(email) {
    return (await this.redis.sismember(SUBSCRIPTIONS_KEY, email)) === 1
  }

  getSubscribedEmails() {
    return this.redis.sinter(SUBSCRIPTIONS_KEY, VERIFIED_KEY)
  }

  /* Chat */

  async getMessages() {
    const res = await this.redis.zrangebyscore(MESSAGES_KEY, '-inf', '+inf', 'WITHSCORES')

    const messages = []
    while (res.length) {
      const timestamp = parseInt(res.pop(), 10)
      const [uuid, senderNickname, msg] = JSON.parse(res.pop())
      messages.push([uuid, timestamp, senderNickname, msg])
    }

    return messages
  }

  storeMessage(uuid, timestamp, nickname, cleanMsg) {
    return this.redis.zadd(MESSAGES_KEY, timestamp, JSON.stringify([uuid, nickname, cleanMsg]))
  }
}

export default RedisConnection
