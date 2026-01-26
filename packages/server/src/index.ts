import http from 'node:http'
import process from 'node:process'
import { debuglog } from 'node:util'

import express from 'express'

import getConfig from './config.js'
import { PORT } from './constants.js'
import errorHandlers from './errorHandlers.js'
import Mailer from './mailer.js'
import MailNotifier from './MailNotifier.js'
import RedisConnection from './redis.js'
import SocketIOManager from './socketio/SocketIOManager.js'
import StreamInfoHandler from './StreamInfoHandler.js'

const log = debuglog('listen-app')

const config = getConfig()
const mailer = new Mailer(config)
const redis = new RedisConnection(config.redisUrl)
const streamInfoHandler = new StreamInfoHandler(config.icecastUrl)
const socketIOManager = new SocketIOManager(config, redis, streamInfoHandler, mailer)
const mailNotifier = new MailNotifier(config, streamInfoHandler, redis, mailer)

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(errorHandlers)
app.use('/ic', streamInfoHandler.getRouter())
const server = http.createServer(app)
socketIOManager.start(server)

async function shutdown() {
  console.log('Received signal. Exiting...')
  mailNotifier.clear()
  server.close()
  await redis.quit()
  console.log('Graceful shutdown finished.')
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}
process.on('SIGINT', () => {
  void shutdown()
})
process.on('SIGTERM', () => {
  void shutdown()
})

server.listen(PORT, () => {
  log(`Listening on port ${PORT}`)
})
