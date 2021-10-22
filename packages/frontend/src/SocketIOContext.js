import React from 'react'
import { io } from 'socket.io-client'

const socket = io()
const SocketIOContext = React.createContext()

export default SocketIOContext
export { socket }
