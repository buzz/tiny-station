import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import type { FormEvent } from 'react'

import useUser from '#hooks/useUser'

import style from './chatControls.module.css'

function ForgotPassword() {
  const { loginState, requestPasswordReset, showLoginForm } = useUser()

  const [email, setEmail] = useState('')

  const formDisabled = loginState !== 'forgotPassword'
  const emailFilled = email.length > 0
  const submitDisabled = !emailFilled || formDisabled

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (email) {
      requestPasswordReset(email)
    }
  }

  return (
    <div className={style.registerForm}>
      <form onSubmit={submit}>
        <p className={style.forgotPasswordInfo}>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
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
        <div className={style.buttons}>
          <button disabled={submitDisabled} type="submit">
            Send Reset Link
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

export default ForgotPassword
