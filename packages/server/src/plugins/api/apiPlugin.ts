import fastifyPlugin from 'fastify-plugin'

import apiRoutes from './apiRoutes.js'
import AuthService from './AuthService.js'

const apiPlugin = fastifyPlugin((fastify) => {
  const authService = new AuthService(fastify.config, fastify.redis, fastify.mailer, fastify.log)

  fastify.decorate('authService', authService).after(() => {
    fastify.register(apiRoutes, { authService, prefix: '/api' })
  })
})

export default apiPlugin
