import { useState } from 'react'
import style from './chatControls.sss'

const MessageInput = ({ logout, nickname, sendMessage }) => {
  const [message, setMessage] = useState('')

  const submit = (ev) => {
    ev.preventDefault()
    if (message) {
      sendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <>
      <div className={style.label}>{nickname}</div>
      <form onSubmit={submit}>
        <input
          autoComplete="off"
          autoCorrect="off"
          className={style.messageInput}
          maxLength="500"
          onChange={(ev) => setMessage(ev.target.value)}
          placeholder="Type your message…"
          spellCheck="false"
          type="text"
          value={message}
        />
        <button disabled={message.length < 1} type="submit">
          Send
        </button>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </form>
    </>
  )
}

export default MessageInput
