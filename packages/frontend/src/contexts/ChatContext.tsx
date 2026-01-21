import { createContext, useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import type { ChatMessage } from '@listen-app/common'

import useSocketIo, { useSocketEvent } from '#hooks/useSocketIo'

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function ChatProvider({ children }: PropsWithChildren) {
  const { socket } = useSocketIo()
  const [messages, setMessages] = useState<Messages>({})

  const handleChatMessage = useCallback(
    ({ uuid, timestamp, senderNickname, message }: ChatMessage) => {
      setMessages((oldMessages) => ({
        ...oldMessages,
        [uuid]: { timestamp, senderNickname, message },
      }))
    },
    []
  )
  useSocketEvent('chat:message', handleChatMessage)

  const handleChatPushMessages = useCallback((pushMessages: ChatMessage[]) => {
    const newMessages: Messages = {}
    for (const { uuid, timestamp, senderNickname, message } of pushMessages) {
      newMessages[uuid] = { timestamp, senderNickname, message }
    }
    setMessages((oldMessages) => ({
      ...oldMessages,
      ...newMessages,
    }))
  }, [])
  useSocketEvent('chat:push-messages', handleChatPushMessages)

  const value = useMemo(
    () => ({
      messages,
      sendMessage: (message: string) => {
        socket.emit('chat:message', message)
      },
    }),
    [messages, socket]
  )

  return <ChatContext value={value}>{children}</ChatContext>
}

interface ChatContextValue {
  messages: Messages
  sendMessage: (message: string) => void
}

type MessageWithoutUuid = Omit<ChatMessage, 'uuid'>
type Messages = Record<string, MessageWithoutUuid>

export type { ChatContextValue, Messages, MessageWithoutUuid }
export { ChatProvider }
export default ChatContext
