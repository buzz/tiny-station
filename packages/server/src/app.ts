import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import errorHandler from './errorHandler.js'
import apiPlugin from './plugins/api/index.js'
import configPlugin from './plugins/configPlugin.js'
import mailerPlugin from './plugins/mailer/index.js'
import mailNotifierPlugin from './plugins/mailNotifier/index.js'
import redisPlugin from './plugins/redis/index.js'
import socketIOPlugin from './plugins/socketIO/index.js'
import streamInfoPlugin from './plugins/streamInfo/index.js'

function makeApp(isDebug: boolean) {
  const fastify = Fastify({
    disableRequestLogging: !isDebug,
    logger: { level: isDebug ? 'debug' : 'info' },
  })
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

  return fastify.withTypeProvider<ZodTypeProvider>()
}

type FastifyInstance = ReturnType<typeof makeApp>

export type { FastifyInstance }
export default makeApp
