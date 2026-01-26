import fastifyPlugin from 'fastify-plugin'

import authRoutes from './authRoutes.js'
import AuthService from './AuthService.js'

const authPlugin = fastifyPlugin((fastify) => {
  const authService = new AuthService(fastify.config, fastify.redis, fastify.mailer, fastify.log)

  fastify.decorate('authService', authService).after(() => {
    fastify.register(authRoutes, { authService, prefix: '/api/auth' })
  })
})

export default authPlugin
