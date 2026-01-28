import { createContext, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import { io } from 'socket.io-client'
import type { PropsWithChildren } from 'react'
import type { ManagerOptions, Socket as SocketIOSocket, SocketOptions } from 'socket.io-client'

import type { ClientEvents, ServerEvents } from '@listen-app/common'

import { getCookie } from '#utils'

function SocketIOProvider({ children }: PropsWithChildren) {
  const [cookies] = useCookies([import.meta.env.VITE_COOKIE_TOKEN])
  const token = getCookie(cookies, import.meta.env.VITE_COOKIE_TOKEN)

  const socket = useMemo(() => {
    // Prevent auto-connect to allow binding listeners before connection
    const opts: Partial<ManagerOptions & SocketOptions> = { autoConnect: false }
    if (token) {
      opts.auth = { token }
    }
    return io(opts)
  }, [token])

  // Handle connection lifecycle
  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [socket])

  return <SocketIOContext value={socket}>{children}</SocketIOContext>
}

type Socket = SocketIOSocket<ServerEvents, ClientEvents>

const SocketIOContext = createContext<Socket | null>(null)

export type { Socket }
export { SocketIOProvider }
export default SocketIOContext
