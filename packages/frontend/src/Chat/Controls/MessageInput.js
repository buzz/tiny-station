import { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faEnvelope, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import ChatContext from '../../contexts/ChatContext'
import ModalContext from '../../contexts/ModalContext'
import UserContext from '../../contexts/UserContext'
import Settings from '../../Settings'
import style from './chatControls.sss'

const MessageInput = () => {
  const [setModal] = useContext(ModalContext)
  const { sendMessage } = useContext(ChatContext)
  const { logout, nickname } = useContext(UserContext)
  const [message, setMessage] = useState('')

  const submit = (ev) => {
    ev.preventDefault()
    if (message) {
      sendMessage(message.trim())
      setMessage('')
    }
  }

  const showSettings = () => setModal({ content: <Settings /> })

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
          <FontAwesomeIcon icon={faEnvelope} fixedWidth />
          Send
        </button>
        <button type="button" onClick={showSettings}>
          <FontAwesomeIcon icon={faCog} fixedWidth />
          Settings
        </button>
        <button type="button" onClick={logout}>
          <FontAwesomeIcon icon={faSignOutAlt} fixedWidth />
          Logout
        </button>
      </div>
    </form>
  )
}

export default MessageInput
