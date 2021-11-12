import { useContext, useEffect } from 'react'

import ModalContext from './contexts/ModalContext'
import SocketIOContext from './contexts/SocketIOContext'

const getVerificationToken = () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  if (Object.prototype.hasOwnProperty.call(params, 'token')) {
    const { token } = params
    if (token.length === 10) {
      return token
    }
  }

  return undefined
}

const CheckVerificationToken = ({ children }) => {
  const { pushModal } = useContext(ModalContext)
  const [socket] = useContext(SocketIOContext)

  useEffect(() => {
    const token = getVerificationToken()

    if (token && socket) {
      socket.on('connect', () => {
        socket.emit('user:verify', token)

        socket.on('user:verify-success', () => {
          pushModal({
            action: () => {
              window.location = process.env.BASE_URL
            },
            content: 'Email was verified. You can login now.',
          })
        })

        socket.on('user:verify-fail', () => {
          pushModal({ content: 'Email verification failed.' })
        })
      })
    }
  }, [socket, pushModal])

  return children
}

export default CheckVerificationToken
