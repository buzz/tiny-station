import { useState } from 'react'
import style from './Chat.sss'

const Joiner = ({ joinChat }) => {
  const [nickname, setNickname] = useState('')

  const onKeyDown = (ev) => {
    if (ev.key === 'Enter' && nickname) {
      ev.preventDefault()
      joinChat(nickname)
    }
  }

  return (
    <>
      <div className={style.label}>Choose a nickname</div>
      <input
        maxLength="16"
        onChange={(ev) => setNickname(ev.target.value)}
        onKeyDown={onKeyDown}
        type="text"
        value={nickname}
      />
      <button disabled={nickname.length < 1} type="button" onClick={() => joinChat(nickname)}>
        Login
      </button>
    </>
  )
}

export default Joiner
