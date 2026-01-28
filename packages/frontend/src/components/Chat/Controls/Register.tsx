import { faArrowLeft, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { DEFAULT_MAX_LENGTH } from '#constants'
import useUser from '#hooks/useUser'

import style from './chatControls.module.css'

function Register() {
  const { loginState, register, showLoginForm } = useUser()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [notifChecked, setNotifChecked] = useState(true)

  const formDisabled = loginState !== 'registerForm'
  const filledCompletely = nickname && email && password && passwordConfirm
  const registerBtnDisabled = !filledCompletely || formDisabled

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (filledCompletely) {
      register({ nickname, email, password, passwordConfirm, notif: notifChecked })
    }
  }

  return (
    <div className={style.registerForm}>
      <form onSubmit={submit}>
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={formDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setNickname(ev.target.value)
          }}
          placeholder="Nickname"
          spellCheck="false"
          type="text"
          value={nickname}
        />
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={formDisabled}
          maxLength={200}
          onChange={(ev) => {
            setEmail(ev.target.value)
          }}
          placeholder="Email"
          spellCheck="false"
          type="text"
          value={email}
        />
        <input
          autoComplete="off"
          disabled={formDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setPassword(ev.target.value)
          }}
          placeholder="Password"
          type="password"
          value={password}
        />
        <input
          autoComplete="off"
          disabled={formDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setPasswordConfirm(ev.target.value)
          }}
          placeholder="Password confirmation"
          type="password"
          value={passwordConfirm}
        />
        <label htmlFor="notifCheckedRegist">
          <input
            checked={notifChecked}
            disabled={formDisabled}
            id="notifCheckedRegist"
            onChange={() => {
              setNotifChecked((c) => !c)
            }}
            type="checkbox"
          />
          Stream notifications
        </label>
        <div className={style.buttons}>
          <button disabled={registerBtnDisabled} type="submit">
            <FontAwesomeIcon icon={faUserPlus} />
            Register
          </button>
          <button type="button" onClick={showLoginForm}>
            <FontAwesomeIcon icon={faArrowLeft} />
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
