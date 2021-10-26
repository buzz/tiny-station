import express from 'express'
import http from 'http'
import process from 'process'

import './dotenvConfig'
import errorHandlers from './errorHandlers'
import StreamInfoHandler from './StreamInfoHandler'
import SocketIOManager from './socketio'
import setupPassport from './passport'
import Mailer from './mailer'
import RedisConnection from './redis'

const PORT = 3001

const mailer = new Mailer()
const redis = new RedisConnection()
const passport = setupPassport(redis)
const streamInfoHandler = new StreamInfoHandler(process.env.ICECAST_URL)
const socketIOManager = new SocketIOManager(passport, redis, streamInfoHandler, mailer)

const shutdown = () => {
  console.log('Received signal. Exiting...')
  redis.quit(() => {
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(errorHandlers)
app.use('/ic', streamInfoHandler.getRouter())
const server = http.createServer(app)
socketIOManager.start(server)
server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
