import fastifyPlugin from 'fastify-plugin'

import RedisConnection from './RedisConnection.js'

const redisPlugin = fastifyPlugin((fastify) => {
  const redis = new RedisConnection(fastify.config)

  fastify.decorate('redis', redis)
  fastify.addHook('onClose', async () => {
    await redis.quit()
  })
})

export default redisPlugin
