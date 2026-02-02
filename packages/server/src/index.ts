import process from 'node:process'

import makeApp from '#app.js'

import { HOST, PORT } from './constants.js'

const isDebug = process.env.NODE_ENV !== 'production'
const fastify = makeApp(isDebug)

fastify.listen({ host: HOST, port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Listening on ${address}`)
})
