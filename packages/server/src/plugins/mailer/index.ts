import fastifyPlugin from 'fastify-plugin'

import Mailer from './Mailer.js'

const mailerPlugin = fastifyPlugin((fastify) => {
  const mailer = new Mailer(fastify.config)
  fastify.decorate('mailer', mailer)
})

export default mailerPlugin
