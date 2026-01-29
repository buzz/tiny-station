import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { DEFAULT_MAX_LENGTH } from '#constants'
import { getPasswordResetToken } from '#hooks/usePasswordResetTokenCheck'
import useUser from '#hooks/useUser'

import style from './chatControls.module.css'

function ResetPassword() {
  const { loginState, resetPassword, showLoginForm } = useUser()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const formDisabled = loginState !== 'resetPassword'
  const filledCompletely = password && passwordConfirm
  const submitDisabled = !filledCompletely || formDisabled

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (filledCompletely) {
      const token = getPasswordResetToken()
      if (token) {
        resetPassword(token, password, passwordConfirm)
      }
    }
  }

  return (
    <div className={style.registerForm}>
      <form onSubmit={submit}>
        <p className={style.forgotPasswordInfo}>Enter your new password.</p>
        <input
          autoComplete="new-password"
          disabled={formDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setPassword(ev.target.value)
          }}
          placeholder="New password"
          type="password"
          value={password}
        />
        <input
          autoComplete="new-password"
          disabled={formDisabled}
          maxLength={DEFAULT_MAX_LENGTH}
          onChange={(ev) => {
            setPasswordConfirm(ev.target.value)
          }}
          placeholder="Confirm password"
          type="password"
          value={passwordConfirm}
        />
        <div className={style.buttons}>
          <button disabled={submitDisabled} type="submit">
            Reset Password
          </button>
          <button type="button" onClick={showLoginForm}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword
