import { useCallback } from 'react'

import useModal from '#hooks/useModal'
import useSocketIo, { useSocketEvent } from '#hooks/useSocketIo'

function getVerificationToken(): string | undefined {
  const token = new URL(globalThis.location.href).searchParams.get('token')
  return token?.length === 10 ? token : undefined
}

function useVerificationTokenCheck() {
  const { pushModal } = useModal()
  const { socket } = useSocketIo()

  const handleConnect = useCallback(() => {
    const token = getVerificationToken()
    if (token) {
      socket.emit('user:verify', token)
    }
  }, [socket])

  const handleUserVerifySuccess = useCallback(() => {
    pushModal({
      action: () => {
        globalThis.location.assign(import.meta.env.VITE_BASE_URL)
      },
      content: 'Email was verified. You can login now.',
    })
  }, [pushModal])

  const handleUserVerifyFail = useCallback(() => {
    pushModal({ content: 'Email verification failed.' })
  }, [pushModal])

  useSocketEvent('connect', handleConnect)
  useSocketEvent('user:verify-success', handleUserVerifySuccess)
  useSocketEvent('user:verify-fail', handleUserVerifyFail)
}

export default useVerificationTokenCheck
