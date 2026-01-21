import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import useChat from '#hooks/useChat'
import type { Messages, MessageWithoutUuid } from '#contexts/ChatContext'

import MessageContent from './MessageContent'
import TimeSince from './TimeSince'

import style from './MessagePane.module.css'

function sortUUidsByTimestamp(messages: Messages) {
  return Object.keys(messages).toSorted((a, b) => {
    const messageA = messages[a]
    const messageB = messages[b]

    if (messageA && messageB) {
      if (messageA.timestamp < messageB.timestamp) {
        return -1
      }
      if (messageA.timestamp > messageB.timestamp) {
        return 1
      }
    }
    return 0
  })
}

function Message({ message: { timestamp, senderNickname, message }, ref }: MessageProps) {
  return (
    <div className={style.message} ref={ref}>
      <TimeSince timestamp={timestamp} />
      <span className={style.nickname}>{senderNickname}:</span>
      <MessageContent text={message} />
    </div>
  )
}

interface MessageProps {
  message: MessageWithoutUuid
  ref?: RefObject<HTMLDivElement | null>
}

function MessagePane() {
  const { messages } = useChat()

  const uuidsSorted = sortUUidsByTimestamp(messages)
  const scrollToRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [uuidsSorted])

  const sortedMessages = uuidsSorted.map((uuid, idx) => {
    const message = messages[uuid]
    if (!message) {
      return null
    }
    return idx === uuidsSorted.length - 1 ? (
      // Scroll to most recent message
      <Message message={message} key={uuid} ref={scrollToRef} />
    ) : (
      <Message message={message} key={uuid} />
    )
  })

  return <div className={style.messagePane}>{sortedMessages}</div>
}

export default MessagePane
