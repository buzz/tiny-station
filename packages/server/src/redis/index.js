import Redis from 'ioredis'

const MESSAGES_KEY = 'messages'

const redis = new Redis(process.env.REDIS_URL, {
  keyPrefix: 'listen-app:',
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
})

const getMessages = async () => {
  const res = await redis.zrange(MESSAGES_KEY, '-inf', '+inf', 'BYSCORE', 'WITHSCORES')

  const messages = []
  while (res.length) {
    const timestamp = parseInt(res.pop(), 10)
    const [uuid, senderNickname, msg] = JSON.parse(res.pop())
    messages.push([uuid, timestamp, senderNickname, msg])
  }

  return messages
}

const storeMessage = (uuid, timestamp, nickname, cleanMsg) => {
  redis.zadd(MESSAGES_KEY, timestamp, JSON.stringify([uuid, nickname, cleanMsg]))
}

export { getMessages, storeMessage }
