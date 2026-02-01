import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import useChat from '#hooks/useChat'
import type { Messages, MessageWithoutUuid } from '#contexts/ChatContext'

import MessageContent from './MessageContent'
import TimeSince from './TimeSince'

import style from './MessagePane.module.css'

const AT_TOP_THRESHOLD = 100
const AT_BOTTOM_THRESHOLD = 50

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

function Message({ message: { timestamp, senderNickname, message } }: MessageProps) {
  return (
    <div className={style.message}>
      <TimeSince timestamp={timestamp} />
      <span className={style.nickname}>{senderNickname}:</span>
      <MessageContent text={message} />
    </div>
  )
}

interface MessageProps {
  message: MessageWithoutUuid
}

function MessagePane() {
  const { messages, loadOlderMessages, isLoading, hasMore } = useChat()

  const uuidsSorted = useMemo(() => sortUUidsByTimestamp(messages), [messages])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isAtBottomRef = useRef(true)
  const hasLoadedInitialRef = useRef(false)
  // Handle scroll anchoring
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container && prevScrollHeight) {
      // Adjust scroll position by the delta of the new content
      container.scrollTop = container.scrollHeight - prevScrollHeight
      queueMicrotask(() => {
        setPrevScrollHeight(0)
      })
    }
  }, [uuidsSorted, prevScrollHeight])

  // Handle auto-scroll
  useEffect(() => {
    if (uuidsSorted.length === 0) {
      return
    }

    if (!hasLoadedInitialRef.current) {
      // Scroll to bottom on first load
      hasLoadedInitialRef.current = true
      const scrollToBottom = () => {
        const container = containerRef.current
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }
      scrollToBottom()
      requestAnimationFrame(() => {
        scrollToBottom()
      })
      const timeoutId = setTimeout(() => {
        scrollToBottom()
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    } else if (isAtBottomRef.current && containerRef.current) {
      // Scroll to bottom on first message
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }

    return
  }, [uuidsSorted])

  const onScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    // Check if user is near top to load more
    if (container.scrollTop < AT_TOP_THRESHOLD && !isLoading && hasMore) {
      setPrevScrollHeight(container.scrollHeight)
      void loadOlderMessages()
    }

    const scrollPositionFromBottom = container.scrollHeight - container.scrollTop
    isAtBottomRef.current = scrollPositionFromBottom <= container.clientHeight + AT_BOTTOM_THRESHOLD
  }, [isLoading, hasMore, loadOlderMessages])

  const messageOutput =
    Object.keys(messages).length > 0 ? (
      uuidsSorted.map((uuid) => {
        const message = messages[uuid]
        return message ? <Message message={message} key={uuid} /> : null
      })
    ) : (
      <div className={style.noMessages}>
        <em>No messages...</em> 😕
      </div>
    )

  return (
    <div className={style.messagePane} ref={containerRef} onScroll={onScroll}>
      {messageOutput}
    </div>
  )
}

export default MessagePane
