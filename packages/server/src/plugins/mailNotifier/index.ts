import fastifyPlugin from 'fastify-plugin'

import MailNotifier from './MailNotifier.js'

const mailNotifierPlugin = fastifyPlugin((fastify) => {
  const mailNotifier = new MailNotifier(
    fastify.config,
    fastify.redis,
    fastify.mailer,
    fastify.log,
    fastify.streamInfoHandler
  )

  fastify.decorate('mailNotifier', mailNotifier)

  fastify.addHook('onClose', () => {
    mailNotifier.clear()
  })
})

export default mailNotifierPlugin
