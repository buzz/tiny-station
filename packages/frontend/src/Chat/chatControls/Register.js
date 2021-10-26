import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faUserPlus } from '@fortawesome/free-solid-svg-icons'

import style from './chatControls.sss'

const Register = ({ connectState, register, showLoginForm }) => {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [notifChecked, setNotifChecked] = useState(true)

  const filledCompletely = nickname && email && password && passwordConfirm
  const btnsDisabled = !filledCompletely || connectState !== 'registerForm'

  const submit = (ev) => {
    ev.preventDefault()
    if (filledCompletely) {
      register(nickname, email, password, passwordConfirm, notifChecked)
    }
  }

  return (
    <div className={style.registerForm}>
      <form onSubmit={submit}>
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
        <div className={style.buttons}>
          <button disabled={btnsDisabled} type="submit">
            <FontAwesomeIcon icon={faUserPlus} fixedWidth />
            Register
          </button>
          <button disabled={btnsDisabled} type="button" onClick={showLoginForm}>
            <FontAwesomeIcon icon={faArrowLeft} fixedWidth />
            Back
          </button>
        </div>
      </form>
      <div className={style.registerExplanation}>
        <p>Create an account to</p>
        <ul>
          <li>write in the chat</li>
          <li>receive email notifications when the stream starts</li>
        </ul>
      </div>
    </div>
  )
}

export default Register
