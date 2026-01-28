import { createContext, useCallback, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import type { PropsWithChildren } from 'react'

import {
  errorResponseSchema,
  loginResponseSchema,
  messageResponseSchema,
  updateNotificationsResponseSchema,
  verifyJwtResponseSchema,
} from '@listen-app/common'
import type { LoginBody, RegisterBody, UpdateNotificationsBody } from '@listen-app/common'

import { COOKIE_NICKNAME } from '#constants'
import useModal from '#hooks/useModal'
import useSocketIO, { useSocketEvent } from '#hooks/useSocketIO'
import { callApi, getCookie } from '#utils'

const UserContext = createContext<UserContextValue | undefined>(undefined)

const COOKIE_OPTIONS = { path: '/' }

function UserProvider({ children }: PropsWithChildren) {
  const { pushModal } = useModal()
  useSocketIO()

  const [loginState, setLoginState] = useState<LoginState>('loggedOut')
  const [nicknameFromAuth, setNicknameFromAuth] = useState<string | undefined>()
  const [notif, setNotif] = useState<boolean | undefined>()
  const [cookies, setCookie, removeCookie] = useCookies([
    COOKIE_NICKNAME,
    import.meta.env.VITE_COOKIE_TOKEN,
  ])

  // Nickname (use stored in cookie or from socket)
  const nicknameFromCookie = getCookie(cookies, COOKIE_NICKNAME)
  const nickname =
    loginState === 'loggedOut' &&
    typeof nicknameFromCookie === 'string' &&
    nicknameFromCookie.length > 0
      ? nicknameFromCookie
      : nicknameFromAuth

  const registerUser = useCallback(
    async (registrationData: RegisterBody) => {
      const response = await callApi('/api/auth/register', { body: registrationData })

      if (response.status === 201) {
        const data = messageResponseSchema.parse(await response.json())
        pushModal({ content: data.message })
        setLoginState('loggedOut')
      } else if (response.status === 400 || response.status === 409) {
        const data = errorResponseSchema.parse(await response.json())
        pushModal({ content: data.error })
        setLoginState('registerForm')
      } else {
        pushModal({ content: 'Registration failed' })
        setLoginState('registerForm')
      }
    },
    [pushModal]
  )

  const loginUser = useCallback(
    async (nickname: string, password: string) => {
      const loginData: LoginBody = { nickname, password }
      const response = await callApi('/api/auth/login', { body: loginData })

      if (response.status === 200) {
        const data = loginResponseSchema.parse(await response.json())
        setNicknameFromAuth(data.nickname)
        setNotif(data.subscribed)
        setCookie(COOKIE_NICKNAME, data.nickname, COOKIE_OPTIONS)
        setCookie(import.meta.env.VITE_COOKIE_TOKEN, data.token, COOKIE_OPTIONS)
        setLoginState('loggedIn')
      } else if (response.status === 401) {
        const data = errorResponseSchema.parse(await response.json())
        setLoginState('loggedOut')
        pushModal({ content: data.error })
      } else {
        setLoginState('loggedOut')
        pushModal({ content: 'Login failed' })
      }
    },
    [pushModal, setCookie]
  )

  const verifyJwtUser = useCallback(
    async (token: string) => {
      const response = await callApi('/api/auth/verify-jwt', { method: 'GET', token })

      if (response.status === 200) {
        const data = verifyJwtResponseSchema.parse(await response.json())
        setNicknameFromAuth(data.nickname)
        setNotif(data.subscribed)
        setLoginState('loggedIn')
      } else if (response.status === 401) {
        removeCookie(import.meta.env.VITE_COOKIE_TOKEN, COOKIE_OPTIONS)
        setLoginState('loggedOut')
      } else {
        setLoginState('loggedOut')
      }
    },
    [removeCookie]
  )

  const deleteUserAccount = useCallback(
    async (token: string) => {
      const response = await callApi('/api/user', { method: 'DELETE', token })

      if (response.status === 204) {
        setLoginState('loggedOut')
        removeCookie(import.meta.env.VITE_COOKIE_TOKEN, COOKIE_OPTIONS)
        removeCookie(COOKIE_NICKNAME, COOKIE_OPTIONS)
        pushModal({
          action: () => {
            globalThis.location.assign(import.meta.env.VITE_BASE_URL)
          },
          content: 'Account was deleted.',
        })
      } else if (response.status === 401) {
        pushModal({ content: 'Unauthorized' })
      } else {
        pushModal({ content: 'Failed to delete account' })
      }
    },
    [pushModal, removeCookie]
  )

  const updateUserNotif = useCallback(
    async (token: string, newNotif: boolean) => {
      const updateData: UpdateNotificationsBody = { subscribed: newNotif }
      const response = await callApi('/api/user/notifications', {
        method: 'PUT',
        token,
        body: updateData,
      })

      if (response.status === 200) {
        const data = updateNotificationsResponseSchema.parse(await response.json())
        setNotif(data.subscribed)
      } else if (response.status === 401) {
        setLoginState('loggedOut')
        pushModal({ content: 'Unauthorized' })
      } else {
        pushModal({ content: 'Failed to update notifications' })
      }
    },
    [pushModal]
  )

  const handleConnect = useCallback(() => {
    const token = getCookie(cookies, import.meta.env.VITE_COOKIE_TOKEN)
    if (typeof token === 'string') {
      void verifyJwtUser(token)
    }
  }, [cookies, verifyJwtUser])

  const handleUserKick = useCallback(
    (errorMessage: string | undefined) => {
      setLoginState('loggedOut')
      removeCookie(import.meta.env.VITE_COOKIE_TOKEN, COOKIE_OPTIONS)
      if (errorMessage) {
        pushModal({ content: errorMessage })
      }
    },
    [pushModal, removeCookie]
  )

  useSocketEvent('connect', handleConnect)
  useSocketEvent('user:kick', handleUserKick)

  const value = useMemo(
    () => ({
      loginState,
      nickname,
      notif,
      deleteAccount: () => {
        const token = getCookie(cookies, import.meta.env.VITE_COOKIE_TOKEN)
        if (typeof token === 'string') {
          void deleteUserAccount(token)
        }
      },
      login: async (nick: string, password: string) => {
        setLoginState('loggingIn')
        await loginUser(nick, password)
      },
      logout: () => {
        removeCookie(import.meta.env.VITE_COOKIE_TOKEN, COOKIE_OPTIONS)
        setLoginState('loggedOut')
      },
      register: async (registrationData: RegisterBody) => {
        setLoginState('registering')
        await registerUser(registrationData)
      },
      showLoginForm: () => {
        setLoginState('loggedOut')
      },
      showRegisterForm: () => {
        setLoginState('registerForm')
      },
      updateNotif: async (newNotif: boolean) => {
        const token = getCookie(cookies, import.meta.env.VITE_COOKIE_TOKEN)
        if (typeof token === 'string') {
          await updateUserNotif(token, newNotif)
        }
      },
    }),
    [
      nickname,
      notif,
      loginState,
      removeCookie,
      cookies,
      deleteUserAccount,
      loginUser,
      registerUser,
      updateUserNotif,
    ]
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
  register: (registrationData: RegisterBody) => void
  showLoginForm: () => void
  showRegisterForm: () => void
  updateNotif: (notif: boolean) => void
}

export type { UserContextValue }
export { UserProvider }
export default UserContext
