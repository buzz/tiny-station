import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { DEFAULT_MAX_LENGTH } from '#constants'
import useUser from '#hooks/useUser'

import style from './chatControls.module.css'

function Login() {
  const { loginState, login, nickname, showRegisterForm } = useUser()

  const [loginNickname, setLoginNickname] = useState(nickname)
  const [password, setPassword] = useState('')

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (loginNickname && password) {
      ev.preventDefault()
      login(loginNickname, password)
    }
  }

  const inputsDisabled = loginState !== 'loggedOut'
  const btnLoginDisabled = inputsDisabled || !loginNickname || !password

  return (
    <form className={style.loginForm} onSubmit={submit}>
      <div>
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={inputsDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setLoginNickname(ev.target.value)
          }}
          placeholder="Nickname"
          spellCheck="false"
          type="text"
          value={loginNickname}
        />
        <input
          autoComplete="current-password"
          disabled={inputsDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setPassword(ev.target.value)
          }}
          placeholder="Password"
          type="password"
          value={password}
        />
      </div>
      <div>
        <button disabled={btnLoginDisabled} type="submit">
          <FontAwesomeIcon icon={faSignInAlt} />
          Login
        </button>
        <button
          disabled={inputsDisabled}
          type="button"
          onClick={() => {
            showRegisterForm()
          }}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          New account
        </button>
      </div>
    </form>
  )
}

export default Login
