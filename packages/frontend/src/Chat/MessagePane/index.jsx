import { useContext, useEffect, useRef } from 'react'

import ChatContext from '../../contexts/ChatContext'
import MessageContent from './MessageContent'
import TimeSince from './TimeSince'
import style from './MessagePane.module.css'

const sortUUidsByTimestamp = (messages) =>
  Object.keys(messages).sort((a, b) => {
    if (messages[a][0] < messages[b][0]) {
      return -1
    }
    if (messages[a][0] > messages[b][0]) {
      return 1
    }
    return 0
  })

const Message = ({ message: [timestamp, nickname, text], elementRef }) => (
  <div className={style.message} ref={elementRef}>
    <TimeSince timestamp={timestamp} />
    <span className={style.nickname}>{nickname}:</span>
    <MessageContent text={text} />
  </div>
)

const MessagePane = () => {
  const { messages } = useContext(ChatContext)

  const uuidsSorted = sortUUidsByTimestamp(messages)
  const scrollToRef = useRef()

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [uuidsSorted])

  return (
    <div className={style.messagePane}>
      {uuidsSorted.map((uuid, idx) =>
        idx === uuidsSorted.length - 1 ? (
          <Message message={messages[uuid]} key={uuid} elementRef={scrollToRef} />
        ) : (
          <Message message={messages[uuid]} key={uuid} />
        )
      )}
    </div>
  )
}

export default MessagePane
