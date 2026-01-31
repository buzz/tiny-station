import process from 'node:process'

import makeApp from '#app.js'

import { PORT } from './constants.js'

const isDebug = process.env.NODE_ENV !== 'production'
const fastify = makeApp(isDebug)

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`Listening on ${address}`)
})
