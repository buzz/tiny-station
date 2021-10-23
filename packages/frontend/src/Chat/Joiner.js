import { useEffect, useState } from 'react'

const Joiner = ({ joinChat, nickname }) => {
  const [joinNickname, setJoinNickname] = useState('')

  useEffect(() => {
    setJoinNickname(nickname)
  }, [nickname])

  const onKeyDown = (ev) => {
    if (ev.key === 'Enter' && joinNickname) {
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
        placeholder="Choose nickname"
        spellCheck="false"
        type="text"
        value={joinNickname}
      />
      <button disabled={!joinNickname} type="button" onClick={() => joinChat(joinNickname)}>
        Chat
      </button>
    </>
  )
}

export default Joiner
