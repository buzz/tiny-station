import bcrypt from 'bcrypt'
import Redis from 'ioredis'

const MESSAGES_KEY = 'messages'
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
    if (user) {
      return {
        nickname: user.nickname,
        ver: user.ver === '1',
        notif: user.notif === '1',
      }
    }
    return null
  }

  async addUser(email, nickname, password, token, notif) {
    const userKey = getUserKey(email)
    const tokenKey = getTokenKey(token)
    const hashedPassword = await bcrypt.hash(password, 10)
    const oneHour = 60 * 60

    return this.redis
      .pipeline()
      .hset(userKey, 'nickname', nickname, 'pwd', hashedPassword, 'ver', 0, 'notif', notif ? 1 : 0)
      .expire(userKey, oneHour)
      .set(getNicknameKey(nickname), email, 'EX', oneHour)
      .set(tokenKey, email, 'EX', oneHour)
      .exec()
  }

  async deleteUser(email) {
    const userKey = getUserKey(email)
    const nickname = await this.redis.hget(userKey, 'nickname')
    return this.redis.pipeline().del(userKey).rem(getNicknameKey(nickname)).exec()
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
          .hset(userKey, 'ver', 1)
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
      const [verified, hash] = await this.redis.hmget(getUserKey(email), 'ver', 'pwd')
      if (verified !== '1') {
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

  /* Chat */

  async getMessages() {
    const res = await this.redis.zrange(MESSAGES_KEY, '-inf', '+inf', 'BYSCORE', 'WITHSCORES')

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
