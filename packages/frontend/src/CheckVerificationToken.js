import { useContext, useEffect } from 'react'
import SocketIOContext from './SocketIOContext'

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

const CheckVerificationToken = ({ children, setModalAction, setModalMessage }) => {
  const [socket] = useContext(SocketIOContext)

  useEffect(() => {
    const token = getVerificationToken()

    if (token && socket) {
      socket.on('connect', () => {
        socket.emit('user:verify', token)

        socket.on('user:verify-success', () => {
          setModalMessage('Email was verified. You can login now.')
          setModalAction('reload')
        })

        socket.on('user:verify-fail', () => {
          setModalMessage('Email verification failed.')
        })
      })
    }
  }, [socket, setModalAction, setModalMessage])

  return children
}

export default CheckVerificationToken
