import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons'

import style from './chatControls.sss'

const Login = ({ connectState, login, nickname, showRegisterForm }) => {
  const [loginNickname, setLoginNickname] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    setLoginNickname(nickname)
  }, [nickname])

  const submit = (ev) => {
    ev.preventDefault()
    if (loginNickname && password) {
      ev.preventDefault()
      login(loginNickname, password)
    }
  }

  const inputsDisabled = connectState !== 'disconnected'
  const btnLoginDisabled = inputsDisabled || !loginNickname || !password

  return (
    <form className={style.loginForm} onSubmit={submit}>
      <div>
        <input
          autoComplete="off"
          autoCorrect="off"
          disabled={inputsDisabled}
          maxLength="16"
          onChange={(ev) => setLoginNickname(ev.target.value)}
          placeholder="Nickname"
          spellCheck="false"
          type="text"
          value={loginNickname}
        />
        <input
          autoComplete="current-password"
          disabled={inputsDisabled}
          maxLength="16"
          onChange={(ev) => setPassword(ev.target.value)}
          placeholder="Password"
          type="password"
          value={password}
        />
      </div>
      <div>
        <button disabled={btnLoginDisabled} type="submit">
          <FontAwesomeIcon icon={faSignInAlt} fixedWidth />
          Login
        </button>
        <button disabled={inputsDisabled} type="button" onClick={() => showRegisterForm()}>
          <FontAwesomeIcon icon={faUserPlus} fixedWidth />
          New account
        </button>
      </div>
    </form>
  )
}

export default Login
