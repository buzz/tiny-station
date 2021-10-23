import { useEffect, useState } from 'react'

const Login = ({ login, nickname, showRegisterForm }) => {
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

  return (
    <form onSubmit={submit}>
      <input
        autoComplete="off"
        autoCorrect="off"
        maxLength="16"
        onChange={(ev) => setLoginNickname(ev.target.value)}
        placeholder="Nickname"
        spellCheck="false"
        type="text"
        value={loginNickname}
      />
      <input
        autoComplete="current-password"
        maxLength="16"
        onChange={(ev) => setPassword(ev.target.value)}
        placeholder="Password"
        type="password"
        value={password}
      />
      <button disabled={!loginNickname || !password} type="submit">
        Login
      </button>
      <button type="button" onClick={() => showRegisterForm()}>
        Register
      </button>
    </form>
  )
}

export default Login
