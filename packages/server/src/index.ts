import process from 'node:process'

import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

import { PORT } from './constants.js'
import errorHandler from './errorHandler.js'
import apiPlugin from './plugins/api/index.js'
import configPlugin from './plugins/config.js'
import mailerPlugin from './plugins/mailer/index.js'
import mailNotifierPlugin from './plugins/mailNotifier/index.js'
import redisPlugin from './plugins/redis/index.js'
import socketIOPlugin from './plugins/socketIO/index.js'
import streamInfoPlugin from './plugins/streamInfo/index.js'

const isDebug = process.env.NODE_ENV !== 'production'

const fastify = Fastify({
  disableRequestLogging: !isDebug,
  logger: { level: isDebug ? 'debug' : 'info' },
})

fastify
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .setErrorHandler(errorHandler)
  .register(configPlugin, { isDebug })
  .register(mailerPlugin)
  .register(redisPlugin)
  .register(streamInfoPlugin)
  .register(socketIOPlugin)
  .register(apiPlugin)
  .register(mailNotifierPlugin)
  .listen({ port: PORT }, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`Listening on ${address}`)
  })
