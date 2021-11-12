import { useContext, useEffect, useRef } from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

import ChatContext from '../../contexts/ChatContext'
import Message from './Message'
import style from './MessagePane.sss'

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

const MessagePane = () => {
  const { messages } = useContext(ChatContext)

  const uuidsSorted = sortUUidsByTimestamp(messages)
  const scrollToRef = useRef()

  useEffect(() => {
    if (scrollToRef.current) {
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  })

  return (
    <SimpleBar className={style.messagePane}>
      <table className={style.messageTable}>
        <tbody>
          {uuidsSorted.map((uuid, idx) =>
            idx === uuidsSorted.length - 1 ? (
              <Message message={messages[uuid]} key={uuid} elementRef={scrollToRef} />
            ) : (
              <Message message={messages[uuid]} key={uuid} />
            )
          )}
        </tbody>
      </table>
    </SimpleBar>
  )
}

export default MessagePane
