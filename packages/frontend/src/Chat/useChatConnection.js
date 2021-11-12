import { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import SocketIOContext from '../contexts/SocketIOContext'

const COOKIE_NICKNAME = 'listen-app-nickname'

const useChatConnection = (setModal) => {
  const [socket, socketReconnect] = useContext(SocketIOContext)
  const [connectState, setConnectState] = useState('disconnected')
  const [nickname, setNickname] = useState('')
  const [notif, setNotif] = useState()
  const [messages, setMessages] = useState({})
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NICKNAME, process.env.COOKIE_TOKEN])

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        // Verify JWT if present
        if (cookies[process.env.COOKIE_TOKEN]) {
          socket.emit('user:verify-jwt')
        }

        socket.on('user:verify-jwt-success', (newNickname, newNotif) => {
          setNickname(newNickname)
          setNotif(newNotif)
          setConnectState('connected')
        })

        socket.on('user:verify-jwt-fail', () => {
          setCookie(process.env.COOKIE_TOKEN, undefined, {
            path: '/',
          })
          setConnectState('disconnected')
        })

        socket.on('user:login-success', (newNickname, token, newNotif) => {
          setNickname(newNickname)
          setNotif(newNotif)
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
          setModal({ content: msg })
        })

        socket.on('user:register-success', (msg) => {
          setModal({ content: msg })
          setConnectState('disconnected')
        })

        socket.on('user:register-fail', (msg) => {
          setModal({ content: msg })
          setConnectState('registerForm')
        })

        socket.on('user:update-notif-success', (val) => {
          setNotif(val)
        })

        socket.on('user:delete-success', () => {
          window.location = process.env.BASE_URL
        })

        socket.on('user:kick', (errorMsg) => {
          setConnectState('disconnected')
          setCookie(process.env.COOKIE_TOKEN, undefined, {
            path: '/',
          })
          setModal({ content: errorMsg })
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
  }, [cookies, socket, setCookie, setModal, socketReconnect])

  // Set remembered nickname
  useEffect(() => {
    if (connectState === 'disconnected' && cookies[COOKIE_NICKNAME]) {
      setNickname(cookies[COOKIE_NICKNAME])
    }
  }, [connectState, cookies])

  return {
    connectState,
    deleteAccount: () => {
      socket.emit('user:delete')
    },
    messages,
    nickname,
    notif,
    login: (loginNickname, pwd) => {
      socket.emit('user:login', loginNickname, pwd)
      setConnectState('connecting')
    },
    logout: () => {
      removeCookie(process.env.COOKIE_TOKEN)
      setConnectState('disconnected')
      socketReconnect()
    },
    register: (registerNickname, email, password, passwordConfirm, regNotif) => {
      socket.emit('user:register', registerNickname, email, password, passwordConfirm, regNotif)
      setConnectState('registering')
    },
    showLoginForm: () => {
      setConnectState('disconnected')
    },
    showRegisterForm: () => {
      setConnectState('registerForm')
    },
    sendMessage: (message) => {
      socket.emit('chat:message', message)
    },
    updateNotif: (val) => {
      socket.emit('user:update-notif', val)
    },
  }
}

export default useChatConnection
