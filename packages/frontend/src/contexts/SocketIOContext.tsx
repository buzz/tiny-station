import { createContext, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import { io } from 'socket.io-client'
import type { PropsWithChildren } from 'react'
import type { ManagerOptions, SocketOptions } from 'socket.io-client'

import type { ClientSocket } from '@listen-app/common'

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
    return io(opts) as unknown as ClientSocket
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

const SocketIOContext = createContext<ClientSocket | null>(null)

export { SocketIOProvider }
export default SocketIOContext
