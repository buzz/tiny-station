import fastifyPlugin from 'fastify-plugin'

import StreamInfoHandler from './StreamInfoHandler.js'

const streamInfoPlugin = fastifyPlugin((fastify) => {
  const streamInfoHandler = new StreamInfoHandler(fastify.config.icecastUrl, fastify.log)

  fastify
    .decorate('streamInfoHandler', streamInfoHandler)
    .after(() => {
      fastify
        .post('/ic/source-connect', () => {
          fastify.log.info('Received source-connect event')
          streamInfoHandler.handleSourceConnect()
          return ''
        })
        .post('/ic/source-disconnect', () => {
          fastify.log.info('Received source-diconnect event')
          streamInfoHandler.handleSourceDisconnect()
          return ''
        })
    })
    .ready(() => {
      streamInfoHandler.fetchInfo()
    })
})

export default streamInfoPlugin
