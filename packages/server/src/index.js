import express from 'express'
import http from 'http'
import process from 'process'
import util from 'util'

import './dotenvConfig.js'
import errorHandlers from './errorHandlers.js'
import StreamInfoHandler from './StreamInfoHandler.js'
import SocketIOManager from './socketio/SocketIOManager.js'
import setupPassport from './passport.js'
import Mailer from './mailer.js'
import MailNotifier from './MailNotifier.js'
import RedisConnection from './redis.js'

const log = util.debuglog('listen-app')

const PORT = 3001

const mailer = new Mailer()
const redis = new RedisConnection()
const passport = setupPassport(redis)
const streamInfoHandler = new StreamInfoHandler(process.env.ICECAST_URL)
const socketIOManager = new SocketIOManager(passport, redis, streamInfoHandler, mailer)
const mailNotifier = new MailNotifier(streamInfoHandler, redis, mailer)

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(errorHandlers)
app.use('/ic', streamInfoHandler.getRouter())
const server = http.createServer(app)
socketIOManager.start(server)

const shutdown = async () => {
  console.log('Received signal. Exiting...')
  mailNotifier.clear()
  server.close()
  await redis.quit()
  console.log('Graceful shutdown finished.')
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

server.listen(PORT, () => log(`Listening on port ${PORT}`))
