import { useState } from 'react'
import style from './chatControls.sss'

const Register = ({ connectState, register }) => {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const filledCompletely = nickname && email && password && passwordConfirm

  const onKeyDown = (ev) => {
    if (ev.key === 'Enter' && filledCompletely) {
      ev.preventDefault()
      register(nickname, email, password, passwordConfirm)
    }
  }

  return (
    <>
      <form className={style.registerForm}>
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={connectState !== 'registerForm'}
          maxLength="16"
          onChange={(ev) => setNickname(ev.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Nickname"
          spellCheck="false"
          type="text"
          value={nickname}
        />
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={connectState !== 'registerForm'}
          maxLength="200"
          onChange={(ev) => setEmail(ev.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Email"
          spellCheck="false"
          type="text"
          value={email}
        />
        <input
          autoComplete="off"
          disabled={connectState !== 'registerForm'}
          maxLength="16"
          onChange={(ev) => setPassword(ev.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Password"
          type="password"
          value={password}
        />
        <input
          autoComplete="off"
          disabled={connectState !== 'registerForm'}
          maxLength="16"
          onChange={(ev) => setPasswordConfirm(ev.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Password confirmation"
          type="password"
          value={passwordConfirm}
        />
        <button
          disabled={!filledCompletely || connectState !== 'registerForm'}
          type="button"
          onClick={() => register(nickname, email, password, passwordConfirm)}
        >
          Register
        </button>
      </form>
      <p className={style.registerExplanation}>
        Registering will allow you to write in the chat and receive email notifications when the
        stream comes online.
      </p>
    </>
  )
}

export default Register
