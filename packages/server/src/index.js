import express from 'express'
import http from 'http'

import './dotenvConfig'
import errorHandlers from './errorHandlers'
import StreamInfoFetcher from './StreamInfoFetcher'
import SocketIOManager from './socketio'
import setupPassport from './passport'
import RedisConnection from './redis'

const PORT = 3001

const redis = new RedisConnection()
const passport = setupPassport(redis)
const streamInfoFetcher = new StreamInfoFetcher(process.env.ICECAST_URL)
const socketIOManager = new SocketIOManager(passport, redis, streamInfoFetcher)

const app = express()
app.use(express.json()).use(errorHandlers)
const server = http.createServer(app)
socketIOManager.start(server)
server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
