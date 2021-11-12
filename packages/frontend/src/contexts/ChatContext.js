import React, { useContext, useEffect, useMemo, useState } from 'react'
import SocketIOContext from './SocketIOContext'

const ChatContext = React.createContext()

const ChatProvider = ({ children }) => {
  const [socket] = useContext(SocketIOContext)
  const [messages, setMessages] = useState({})

  useEffect(() => {
    if (socket) {
      socket.on('chat:message', (uuid, timestamp, senderNickname, msg) => {
        setMessages((oldMessages) => ({
          ...oldMessages,
          [uuid]: [timestamp, senderNickname, msg],
        }))
      })

      socket.on('chat:push-messages', (pushMessages) => {
        const newMessages = pushMessages.reduce(
          (acc, [uuid, timestamp, senderNickname, msg]) => ({
            ...acc,
            [uuid]: [timestamp, senderNickname, msg],
          }),
          {}
        )

        setMessages((oldMessages) => ({
          ...oldMessages,
          ...newMessages,
        }))
      })
    }
  }, [socket])

  const value = useMemo(
    () => ({
      messages,
      sendMessage: (message) => {
        socket.emit('chat:message', message)
      },
    }),
    [messages, socket]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export default ChatContext
export { ChatProvider }
