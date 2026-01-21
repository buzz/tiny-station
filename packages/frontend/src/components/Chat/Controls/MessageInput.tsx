import { faCog, faEnvelope, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import type { FormEvent } from 'react'

import Settings from '#components/Settings'
import useChat from '#hooks/useChat'
import useModal from '#hooks/useModal'
import useUser from '#hooks/useUser'

import style from './chatControls.module.css'

function MessageInput() {
  const { pushModal } = useModal()
  const { sendMessage } = useChat()
  const { logout, nickname } = useUser()
  const [message, setMessage] = useState('')

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const messageTrimmed = message.trim()
    if (messageTrimmed) {
      sendMessage(messageTrimmed)
      setMessage('')
    }
  }

  const showSettings = () => {
    pushModal({ content: <Settings /> })
  }

  return (
    <form className={style.messageInputForm} onSubmit={submit}>
      <div>
        <div>{nickname}</div>
        <input
          autoComplete="off"
          autoCorrect="off"
          maxLength={500}
          onChange={(ev) => {
            setMessage(ev.target.value)
          }}
          placeholder="Type your message…"
          spellCheck="false"
          type="text"
          value={message}
        />
      </div>
      <div>
        <button disabled={message.length === 0} type="submit">
          <FontAwesomeIcon icon={faEnvelope} />
          Send
        </button>
        <button type="button" onClick={showSettings}>
          <FontAwesomeIcon icon={faCog} />
          Settings
        </button>
        <button type="button" onClick={logout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </button>
      </div>
    </form>
  )
}

export default MessageInput
