import type { EventsMap } from '@socket.io/component-emitter'

import type { ChatMessage } from './chat'
import type { StreamInfo } from './stream'

interface ServerEvents extends EventsMap {
  'chat:message': (message: ChatMessage) => void
  'chat:push-messages': (messages: ChatMessage[]) => void
  'stream:info': (info: StreamInfo | null) => void
  'stream:listeners': (count: number) => void
  'user:kick': (errorMessage?: string) => void
}

interface ClientEvents extends EventsMap {
  'chat:message': (text: string) => Promise<void>
}

export type { ClientEvents, ServerEvents }
