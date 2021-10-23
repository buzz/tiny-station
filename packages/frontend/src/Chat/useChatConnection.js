import { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import SocketIOContext from '../SocketIOContext'

const COOKIE_NICKNAME = 'listen-app-nickname'

const useChatConnection = (setModalMessage) => {
  const [socket, socketReconnect] = useContext(SocketIOContext)
  const [connectState, setConnectState] = useState('disconnected')
  const [nickname, setNickname] = useState('')
  const [messages, setMessages] = useState({})
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NICKNAME])

  useEffect(
    () => {
      if (socket) {
        socket.on('connect', () => {
          // Verify JWT if present
          socket.emit('user:verify-jwt')

          socket.on('user:verify-jwt-success', (newNickname) => {
            setNickname(newNickname)
            setConnectState('connected')
          })

          socket.on('user:verify-jwt-fail', () => {
            setConnectState('disconnected')
          })

          socket.on('user:login-success', (newNickname, token) => {
            setNickname(newNickname)
            setCookie(COOKIE_NICKNAME, newNickname, {
              path: '/',
            })
            setCookie(process.env.COOKIE_TOKEN, token, {
              path: '/',
            })
            socketReconnect()
          })

          socket.on('user:login-fail', (msg) => {
            setConnectState('disconnected')
            setModalMessage(msg)
          })

          socket.on('user:register-success', (msg) => {
            setModalMessage(msg)
            setConnectState('disconnected')
          })

          socket.on('user:register-fail', (msg) => {
            setModalMessage(msg)
            setConnectState('registerForm')
          })

          socket.on('user:kick', (errorMsg) => {
            setConnectState('disconnected')
            setModalMessage(errorMsg)
          })

          socket.on('chat:message', (uuid, timestamp, senderNickname, msg) => {
            setMessages((oldMessages) => ({
              ...oldMessages,
              [uuid]: [timestamp, senderNickname, msg],
            }))
          })

          socket.on('chat:push-messages', (pushMessages) => {
            const newMessages = pushMessages.reduce(
              (acc, [uuid, timestamp, senderNickname, msg]) => ({
                ...acc,
                [uuid]: [timestamp, senderNickname, msg],
              }),
              {}
            )

            setMessages((oldMessages) => ({
              ...oldMessages,
              ...newMessages,
            }))
          })
        })
      }
    },
    [socket] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Set remembered nickname
  useEffect(() => {
    if (connectState === 'disconnected' && cookies[COOKIE_NICKNAME]) {
      setNickname(cookies[COOKIE_NICKNAME])
    }
  }, [connectState, cookies])

  return {
    connectState,
    messages,
    nickname,
    login: (loginNickname, pwd) => {
      socket.emit('user:login', loginNickname, pwd)
      setConnectState('connecting')
    },
    logout: () => {
      removeCookie(process.env.COOKIE_TOKEN)
      setConnectState('disconnected')
      socketReconnect()
    },
    register: (registerNickname, email, password, passwordConfirm, notif) => {
      socket.emit('user:register', registerNickname, email, password, passwordConfirm, notif)
      setConnectState('registering')
    },
    showRegisterForm: () => {
      setConnectState('registerForm')
    },
    sendMessage: (message) => {
      socket.emit('chat:message', message)
    },
  }
}

export default useChatConnection
