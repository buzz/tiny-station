import { useState } from 'react'
import style from './Chat.sss'

const MessageInput = ({ nickname, sendMessage }) => {
  const [message, setMessage] = useState('')

  const submit = () => {
    if (message) {
      sendMessage(message.trim())
      setMessage('')
    }
  }

  const onKeyDown = (ev) => {
    if (ev.key === 'Enter' && message) {
      ev.preventDefault()
      submit()
    }
  }

  return (
    <>
      <div className={style.label}>{nickname}</div>
      <input
        className={style.messageInput}
        maxLength="500"
        onChange={(ev) => setMessage(ev.target.value)}
        onKeyDown={onKeyDown}
        type="text"
        value={message}
      />
      <button disabled={message.length < 1} type="button" onClick={submit}>
        Send
      </button>
    </>
  )
}

export default MessageInput
