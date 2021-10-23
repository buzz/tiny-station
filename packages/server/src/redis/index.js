import bcrypt from 'bcrypt'
import Redis from 'ioredis'

const MESSAGES_KEY = 'messages'
const userKey = (email) => `user:${email}`

class RedisConnection {
  redis = undefined

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      keyPrefix: 'listen-app:',
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    })
  }

  async findUser(email) {
    const res = await this.redis.hmgetall(userKey(email))
    return res
  }

  async addUser(email, nickname, password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    await this.redis.hset(
      userKey(email),
      'nickname',
      nickname,
      'pwhash',
      hashedPassword,
      'ver',
      false
    )
  }

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

  async storeMessage(uuid, timestamp, nickname, cleanMsg) {
    this.redis.zadd(MESSAGES_KEY, timestamp, JSON.stringify([uuid, nickname, cleanMsg]))
  }
}

export default RedisConnection
