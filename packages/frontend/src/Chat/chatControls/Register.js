import { useState } from 'react'

import style from './chatControls.sss'

const Register = ({ connectState, register }) => {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [notifChecked, setNotifChecked] = useState(true)

  const filledCompletely = nickname && email && password && passwordConfirm

  const submit = (ev) => {
    ev.preventDefault()
    if (filledCompletely) {
      register(nickname, email, password, passwordConfirm, notifChecked)
    }
  }

  return (
    <>
      <form className={style.registerForm} onSubmit={submit}>
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={connectState !== 'registerForm'}
          maxLength="16"
          onChange={(ev) => setNickname(ev.target.value)}
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
          placeholder="Password"
          type="password"
          value={password}
        />
        <input
          autoComplete="off"
          disabled={connectState !== 'registerForm'}
          maxLength="16"
          onChange={(ev) => setPasswordConfirm(ev.target.value)}
          placeholder="Password confirmation"
          type="password"
          value={passwordConfirm}
        />
        <label htmlFor="notifCheckedRegist">
          <input
            type="checkbox"
            checked={notifChecked}
            id="notifCheckedRegist"
            onChange={() => setNotifChecked((c) => !c)}
          />
          Stream notifications
        </label>
        <button disabled={!filledCompletely || connectState !== 'registerForm'} type="submit">
          Register
        </button>
      </form>
      <div className={style.registerExplanation}>
        <p>Register to</p>
        <ul>
          <li>Write in the chat</li>
          <li>Receive an email when the stream starts</li>
        </ul>
      </div>
    </>
  )
}

export default Register
