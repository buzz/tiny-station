import express from 'express'
import http from 'http'

import './dotenvConfig'
import ChatManager from './ChatManager'
import errorHandlers from './errorHandlers'
import StreamInfoDispatcher from './StreamInfoDispatcher'
import StreamInfoFetcher from './StreamInfoFetcher'
import SocketIOManager from './SocketIOManager'

const PORT = 3001

const streamInfoFetcher = new StreamInfoFetcher(process.env.ICECAST_URL)
const streamInfoDispatcher = new StreamInfoDispatcher(streamInfoFetcher)
const chatManager = new ChatManager()

const socketIOHandlers = [streamInfoDispatcher, chatManager]
const socketIOManager = new SocketIOManager(socketIOHandlers)

const app = express()
app.use(express.json()).use(errorHandlers)
const server = http.createServer(app)
socketIOManager.start(server)
server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
