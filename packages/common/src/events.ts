import type { EventsMap } from '@socket.io/component-emitter'

import type { ChatMessage } from './chat'
import type { StreamInfo } from './stream'

interface ServerEvents extends EventsMap {
  'chat:message': (message: ChatMessage) => void
  'chat:push-messages': (messages: ChatMessage[]) => void
  'stream:info': (info: StreamInfo | null) => void
  'stream:listeners': (count: number) => void
  'user:delete-success': () => void
  'user:kick': (errorMessage: string) => void
  'user:login-fail': (message: string) => void
  'user:login-success': (newNickname: string, token: string, newNotif: boolean) => void
  'user:register-fail': (message: string) => void
  'user:register-success': (message: string) => void
  'user:update-notif-success': (newNotif: boolean) => void
  'user:verify-jwt-fail': () => void
  'user:verify-jwt-success': (newNickname: string, newNotif: boolean) => void
}

interface ClientEvents extends EventsMap {
  'chat:message': (text: string) => void
  'user:delete': () => void
  'user:login': (nickname: string, password: string) => void
  'user:register': (
    nickname: string,
    email: string,
    password: string,
    passwordConfirm: string,
    notif: boolean
  ) => void
  'user:update-notif': (notif: boolean) => void
  'user:verify-jwt': () => void
}

export type { ClientEvents, ServerEvents }
