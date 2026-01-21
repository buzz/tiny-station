import { use, useEffect } from 'react'

import type { ServerEvents } from '@listen-app/common'

import SocketIOContext from '#contexts/SocketIOContext'
import type { SocketIOContextValue } from '#contexts/SocketIOContext'

function useSocketIo(): SocketIOContextValue {
  const ctx = use(SocketIOContext)
  if (!ctx) {
    throw new Error('useSocketIo must be used within <SocketIOProvider>')
  }
  return ctx
}

function useSocketEvent<T extends string>(event: T, handler: ServerEvents[T]) {
  const { socket } = useSocketIo()

  useEffect(() => {
    socket.on(event, handler)

    // Special case: If we are listening for 'connect' and it's already connected
    if (event === 'connect' && socket.connected) {
      const connectHandler = handler as () => void
      connectHandler()
    }

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, handler])
}

export { useSocketEvent }
export default useSocketIo
