import { useEffect, useState } from 'react'

const Joiner = ({ joinChat, nickname, showRegisterForm }) => {
  const [joinNickname, setJoinNickname] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    setJoinNickname(nickname)
  }, [nickname])

  const onKeyDown = (ev) => {
    if (ev.key === 'Enter' && joinNickname && password) {
      ev.preventDefault()
      joinChat(joinNickname)
    }
  }

  return (
    <>
      <input
        autoComplete="off"
        autoCorrect="off"
        maxLength="16"
        onChange={(ev) => setJoinNickname(ev.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Nickname"
        spellCheck="false"
        type="text"
        value={joinNickname}
      />
      <input
        maxLength="16"
        onChange={(ev) => setPassword(ev.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Password"
        type="password"
        value={password}
      />
      <button
        disabled={!joinNickname || !password}
        type="button"
        onClick={() => joinChat(joinNickname)}
      >
        Login
      </button>
      <button type="button" onClick={() => showRegisterForm()}>
        Register
      </button>
    </>
  )
}

export default Joiner
