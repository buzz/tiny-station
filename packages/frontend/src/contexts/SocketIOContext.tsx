import { createContext, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import { io } from 'socket.io-client'
import type { PropsWithChildren } from 'react'
import type { Socket as SocketIOSocket } from 'socket.io-client'

import type { ClientEvents, ServerEvents } from '@listen-app/common'

const socket: Socket = io()

const SocketIOContext = createContext<SocketIOContextValue | undefined>(undefined)

function SocketIOProvider({ children }: PropsWithChildren) {
  const [cookies] = useCookies([import.meta.env.VITE_COOKIE_TOKEN])
  const [isConnected, setIsConnected] = useState(false)

  const tokenVal = cookies[import.meta.env.VITE_COOKIE_TOKEN] as unknown
  const token = typeof tokenVal === 'string' && tokenVal.length > 0 ? tokenVal : undefined

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })
    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // Sync auth token and bounce connection
    socket.auth = { token }
    socket.disconnect().connect()
  }, [token])

  const value = useMemo(() => ({ socket, isConnected }), [isConnected])

  return <SocketIOContext value={value}>{children}</SocketIOContext>
}

type Socket = SocketIOSocket<ServerEvents, ClientEvents>

interface SocketIOContextValue {
  socket: Socket
  isConnected: boolean
}

export type { SocketIOContextValue }
export { SocketIOProvider }
export default SocketIOContext
