import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import { io } from 'socket.io-client'

const SocketIOContext = React.createContext()

const SocketIOProvider = ({ children }) => {
  const [socket, setSocket] = useState()
  const [cookies] = useCookies([process.env.COOKIE_TOKEN])

  const reconnect = useCallback(() => {
    socket.disconnect()
    setSocket(null)
  }, [socket])

  useEffect(() => {
    if (!socket) {
      const extraHeaders = cookies[process.env.COOKIE_TOKEN]
        ? {
            Authorization: `Bearer ${cookies[process.env.COOKIE_TOKEN]}`,
          }
        : {}

      const newSocket = io({ extraHeaders })

      setSocket(newSocket)
    }
  }, [cookies, socket])

  return (
    <SocketIOContext.Provider value={useMemo(() => [socket, reconnect], [socket, reconnect])}>
      {children}
    </SocketIOContext.Provider>
  )
}

export default SocketIOContext
export { SocketIOProvider }
