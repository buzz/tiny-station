import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'

import ModalContext from './ModalContext'
import SocketIOContext from './SocketIOContext'

const COOKIE_NICKNAME = 'listen-app-nickname'

const UserContext = React.createContext()

const UserProvider = ({ children }) => {
  const { pushModal } = useContext(ModalContext)
  const [socket, socketReconnect] = useContext(SocketIOContext)

  const [connectState, setConnectState] = useState('disconnected')
  const [nickname, setNickname] = useState('')
  const [notif, setNotif] = useState()
  const [cookies, setCookie, removeCookie] = useCookies([
    COOKIE_NICKNAME,
    import.meta.env.VITE_COOKIE_TOKEN,
  ])

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        // Verify JWT if present
        if (cookies[import.meta.env.VITE_COOKIE_TOKEN]) {
          socket.emit('user:verify-jwt')
        }

        socket.on('user:verify-jwt-success', (newNickname, newNotif) => {
          setNickname(newNickname)
          setNotif(newNotif)
          setConnectState('connected')
        })

        socket.on('user:verify-jwt-fail', () => {
          setCookie(import.meta.env.VITE_COOKIE_TOKEN, undefined, {
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
          setCookie(import.meta.env.VITE_COOKIE_TOKEN, token, {
            path: '/',
          })
          socketReconnect()
        })

        socket.on('user:login-fail', (msg) => {
          setConnectState('disconnected')
          pushModal({ content: msg })
        })

        socket.on('user:register-success', (msg) => {
          pushModal({ content: msg })
          setConnectState('disconnected')
        })

        socket.on('user:register-fail', (msg) => {
          pushModal({ content: msg })
          setConnectState('registerForm')
        })

        socket.on('user:update-notif-success', (val) => {
          setNotif(val)
        })

        socket.on('user:delete-success', () => {
          window.location = import.meta.env.VITE_BASE_URL
        })

        socket.on('user:kick', (errorMsg) => {
          setConnectState('disconnected')
          setCookie(import.meta.env.VITE_COOKIE_TOKEN, undefined, {
            path: '/',
          })
          if (errorMsg) {
            pushModal({ content: errorMsg })
          }
        })
      })
    }
  }, [cookies, socket, setCookie, pushModal, socketReconnect])

  // Set remembered nickname
  useEffect(() => {
    if (connectState === 'disconnected' && cookies[COOKIE_NICKNAME]) {
      setNickname(cookies[COOKIE_NICKNAME])
    }
  }, [connectState, cookies])

  const value = useMemo(
    () => ({
      connectState,
      deleteAccount: () => {
        socket.emit('user:delete')
      },
      nickname,
      notif,
      login: (loginNickname, pwd) => {
        socket.emit('user:login', loginNickname, pwd)
        setConnectState('connecting')
      },
      logout: () => {
        removeCookie(import.meta.env.VITE_COOKIE_TOKEN)
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
      updateNotif: (val) => {
        socket.emit('user:update-notif', val)
      },
    }),
    [connectState, nickname, notif, removeCookie, socket, socketReconnect]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContext
export { UserProvider }
