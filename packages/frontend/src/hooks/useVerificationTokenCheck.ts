import { useEffect, useRef } from 'react'

import { errorResponseSchema } from '@tiny-station/common'
import type { VerifyEmailBody } from '@tiny-station/common'

import useModal from '#hooks/useModal'
import { callApi } from '#utils'

function getVerificationToken(): string | undefined {
  const token = new URL(globalThis.location.href).searchParams.get('token')
  return token?.length === 10 ? token : undefined
}

function useVerificationTokenCheck() {
  const { pushModal } = useModal()
  const verificationSentRef = useRef(false)

  useEffect(() => {
    // Prevent double sending
    if (verificationSentRef.current) {
      return
    }

    const token = getVerificationToken()
    if (token) {
      verificationSentRef.current = true
      void (async () => {
        const verifyData: VerifyEmailBody = { token }
        const response = await callApi('/api/auth/verify', { body: verifyData })

        if (response.status === 200) {
          pushModal({
            action: () => {
              globalThis.location.assign(import.meta.env.VITE_BASE_URL)
            },
            content: 'Email was verified. You can login now.',
          })
        } else if (response.status === 400) {
          const data = errorResponseSchema.parse(await response.json())
          pushModal({ content: `Email verification failed: ${data.error}` })
        } else {
          pushModal({ content: 'Email verification failed.' })
        }
      })()
    }
  }, [pushModal])
}

export default useVerificationTokenCheck
