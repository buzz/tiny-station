import { useState } from 'react'
import style from './chatControls.sss'

const MessageInput = ({ exitChat, nickname, sendMessage }) => {
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
        autoComplete="off"
        autoCorrect="off"
        className={style.messageInput}
        maxLength="500"
        onChange={(ev) => setMessage(ev.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your message…"
        spellCheck="false"
        type="text"
        value={message}
      />
      <button disabled={message.length < 1} type="button" onClick={submit}>
        Send
      </button>
      <button type="button" onClick={exitChat}>
        Exit
      </button>
    </>
  )
}

export default MessageInput
