import { createContext, useCallback, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import type { PropsWithChildren } from 'react'

import { COOKIE_NICKNAME } from '#constants'
import useModal from '#hooks/useModal'
import useSocketIO, { useSocketEvent } from '#hooks/useSocketIO'

const UserContext = createContext<UserContextValue | undefined>(undefined)

function handleUserDeleteSuccess() {
  globalThis.location.assign(import.meta.env.APP_BASE_URL)
}

function UserProvider({ children }: PropsWithChildren) {
  const { pushModal } = useModal()
  const { socket } = useSocketIO()

  const [loginState, setLoginState] = useState<LoginState>('loggedOut')
  const [nicknameFromSocket, setNicknameFromSocket] = useState<string | undefined>()
  const [notif, setNotif] = useState<boolean | undefined>()
  const [cookies, setCookie, removeCookie] = useCookies([
    COOKIE_NICKNAME,
    import.meta.env.VITE_COOKIE_TOKEN,
  ])

  // Nickname (use stored in cookie or from socket)
  const nicknameFromCookie = cookies[COOKIE_NICKNAME] as unknown
  const nickname =
    loginState === 'loggedOut' &&
    typeof nicknameFromCookie === 'string' &&
    nicknameFromCookie.length > 0
      ? nicknameFromCookie
      : nicknameFromSocket

  const handleConnect = useCallback(() => {
    if (cookies[import.meta.env.VITE_COOKIE_TOKEN]) {
      socket.emit('user:verify-jwt')
    }
  }, [cookies, socket])

  const handleUserKick = useCallback(
    (errorMessage: string | undefined) => {
      setLoginState('loggedOut')
      setCookie(import.meta.env.VITE_COOKIE_TOKEN, undefined, {
        path: '/',
      })
      if (errorMessage) {
        pushModal({ content: errorMessage })
      }
    },
    [pushModal, setCookie]
  )

  const handleUserLoginFail = useCallback(
    (message: string) => {
      setLoginState('loggedOut')
      pushModal({ content: message })
    },
    [pushModal, setLoginState]
  )

  const handleUserLoginSuccess = useCallback(
    (newNickname: string, token: string, newNotif: boolean) => {
      setNicknameFromSocket(newNickname)
      setNotif(newNotif)
      setCookie(COOKIE_NICKNAME, newNickname, { path: '/' })
      setCookie(import.meta.env.VITE_COOKIE_TOKEN, token, { path: '/' })
      setLoginState('loggedIn')
    },
    [setCookie]
  )

  const handleUserRegisterFail = useCallback(
    (message: string) => {
      pushModal({ content: message })
      setLoginState('registerForm')
    },
    [pushModal]
  )

  const handleUserRegisterSuccess = useCallback(
    (message: string) => {
      pushModal({ content: message })
      setLoginState('loggedOut')
    },
    [pushModal]
  )

  const handleUserUpdateNotifSuccess = useCallback((newNotif: boolean) => {
    setNotif(newNotif)
  }, [])

  const handleUserVerifyJwtFail = useCallback(() => {
    setCookie(import.meta.env.VITE_COOKIE_TOKEN, undefined, { path: '/' })
    setLoginState('loggedOut')
  }, [setCookie])

  const handleUserVerifyJwtSuccess = useCallback((newNickname: string, newNotif: boolean) => {
    setNicknameFromSocket(newNickname)
    setNotif(newNotif)
    setLoginState('loggedIn')
  }, [])

  useSocketEvent('connect', handleConnect)
  useSocketEvent('user:delete-success', handleUserDeleteSuccess)
  useSocketEvent('user:kick', handleUserKick)
  useSocketEvent('user:login-fail', handleUserLoginFail)
  useSocketEvent('user:login-success', handleUserLoginSuccess)
  useSocketEvent('user:register-fail', handleUserRegisterFail)
  useSocketEvent('user:register-success', handleUserRegisterSuccess)
  useSocketEvent('user:update-notif-success', handleUserUpdateNotifSuccess)
  useSocketEvent('user:verify-jwt-fail', handleUserVerifyJwtFail)
  useSocketEvent('user:verify-jwt-success', handleUserVerifyJwtSuccess)

  const value = useMemo(
    () => ({
      loginState,
      nickname,
      notif,
      deleteAccount: () => {
        socket.emit('user:delete')
      },
      login: (nick: string, password: string) => {
        socket.emit('user:login', nick, password)
        setLoginState('loggingIn')
      },
      logout: () => {
        // Removing the cookie will automatically trigger a reconnect
        removeCookie(import.meta.env.VITE_COOKIE_TOKEN)
        setLoginState('loggedOut')
      },
      register: (
        nick: string,
        email: string,
        password: string,
        passwordConfirm: string,
        regNotif: boolean
      ) => {
        socket.emit('user:register', nick, email, password, passwordConfirm, regNotif)
        setLoginState('registering')
      },
      showLoginForm: () => {
        setLoginState('loggedOut')
      },
      showRegisterForm: () => {
        setLoginState('registerForm')
      },
      updateNotif: (newNotif: boolean) => {
        socket.emit('user:update-notif', newNotif)
      },
    }),
    [nickname, notif, loginState, removeCookie, socket]
  )

  return <UserContext value={value}>{children}</UserContext>
}

type LoginState = 'loggedIn' | 'loggedOut' | 'loggingIn' | 'registering' | 'registerForm'

interface UserContextValue {
  loginState: LoginState
  deleteAccount: () => void
  nickname: string | undefined
  notif: boolean | undefined
  login: (nickname: string, password: string) => void
  logout: () => void
  register: (
    nickname: string,
    email: string,
    password: string,
    passwordConfirm: string,
    notif: boolean
  ) => void
  showLoginForm: () => void
  showRegisterForm: () => void
  updateNotif: (notif: boolean) => void
}

export type { UserContextValue }
export { UserProvider }
export default UserContext
