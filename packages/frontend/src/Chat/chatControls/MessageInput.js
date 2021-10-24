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
    <form className={style.messageInputForm} onSubmit={submit}>
      <div>
        <div>{nickname}</div>
        <input
          autoComplete="off"
          autoCorrect="off"
          maxLength="500"
          onChange={(ev) => setMessage(ev.target.value)}
          placeholder="Type your message…"
          spellCheck="false"
          type="text"
          value={message}
        />
      </div>
      <div>
        <button disabled={message.length < 1} type="submit">
          Send
        </button>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    </form>
  )
}

export default MessageInput
