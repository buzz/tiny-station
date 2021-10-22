import { useState } from 'react'

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
      <input
        autoComplete="off"
        autoCorrect="off"
        maxLength="16"
        onChange={(ev) => setNickname(ev.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Choose nickname"
        spellCheck="false"
        type="text"
        value={nickname}
      />
      <button disabled={nickname.length < 1} type="button" onClick={() => joinChat(nickname)}>
        Chat
      </button>
    </>
  )
}

export default Joiner
