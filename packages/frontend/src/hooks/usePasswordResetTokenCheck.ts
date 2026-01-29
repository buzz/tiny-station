import { useEffect, useRef } from 'react'

import useUser from '#hooks/useUser'

function getPasswordResetToken(): string | undefined {
  const token = new URL(globalThis.location.href).searchParams.get('resetToken')
  return token?.length === 10 ? token : undefined
}

function usePasswordResetTokenCheck() {
  const { showResetPasswordForm } = useUser()
  const resetSentRef = useRef(false)

  useEffect(() => {
    if (resetSentRef.current) {
      return
    }

    const token = getPasswordResetToken()
    if (token) {
      resetSentRef.current = true
      showResetPasswordForm()
    }
  }, [showResetPasswordForm])
}

export { getPasswordResetToken }
export default usePasswordResetTokenCheck
