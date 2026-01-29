import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { chatMessagesResponseSchema } from '@listen-app/common'
import type { ChatMessage } from '@listen-app/common'

import useSocketIO, { useSocketEvent } from '#hooks/useSocketIO'
import { callApi } from '#utils'

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

const MESSAGES_LIMIT = 50

function ChatProvider({ children }: PropsWithChildren) {
  const socket = useSocketIO()
  const [messages, setMessages] = useState<Messages>({})
  const [hasMore, setHasMore] = useState(false)
  const [earliestTimestamp, setEarliestTimestamp] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchMessages = useCallback(async (before?: number) => {
    setIsLoading(true)

    const url = before
      ? `/api/chat/messages?limit=${MESSAGES_LIMIT}&before=${before}`
      : `/api/chat/messages?limit=${MESSAGES_LIMIT}`

    const response = await callApi(url, { method: 'GET' })

    if (response.status === 200) {
      const data = chatMessagesResponseSchema.parse(await response.json())
      const newMessages: Messages = {}
      for (const msg of data.messages) {
        newMessages[msg.uuid] = {
          timestamp: msg.timestamp,
          senderNickname: msg.senderNickname,
          message: msg.message,
        }
      }

      setMessages((oldMessages) => {
        if (before !== undefined) {
          return { ...newMessages, ...oldMessages }
        }
        return { ...oldMessages, ...newMessages }
      })

      setHasMore(data.pagination.hasMore)
      setEarliestTimestamp(data.pagination.earliestTimestamp)
    }

    setIsLoading(false)
  }, [])

  const loadOlderMessages = useCallback(async () => {
    if (isLoading || !hasMore || earliestTimestamp === null) {
      return
    }
    await fetchMessages(earliestTimestamp)
  }, [isLoading, hasMore, earliestTimestamp, fetchMessages])

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

  // Initial load
  useEffect(() => {
    queueMicrotask(() => {
      void fetchMessages()
    })
  }, [fetchMessages])

  const value = useMemo(
    () => ({
      messages,
      sendMessage: (message: string) => {
        socket.emit('chat:message', message)
      },
      loadOlderMessages,
      hasMore,
      isLoading,
    }),
    [messages, socket, loadOlderMessages, hasMore, isLoading]
  )

  return <ChatContext value={value}>{children}</ChatContext>
}

interface ChatContextValue {
  messages: Messages
  sendMessage: (message: string) => void
  loadOlderMessages: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
}

type MessageWithoutUuid = Omit<ChatMessage, 'uuid'>
type Messages = Record<string, MessageWithoutUuid>

export type { ChatContextValue, Messages, MessageWithoutUuid }
export { ChatProvider }
export default ChatContext
