import type { EventsMap } from '@socket.io/component-emitter'
import type { Socket as SocketIOClientSocket } from 'socket.io-client'

import type { ChatMessage } from './chat.js'
import type { StreamInfo } from './stream.js'

interface ServerEvents extends EventsMap {
  'chat:message': (message: ChatMessage) => void
  'stream:info': (info: StreamInfo | null) => void
  'stream:listeners': (count: number) => void
  'user:kick': (errorMessage?: string) => void
}

interface ClientEvents extends EventsMap {
  'chat:message': (text: string) => Promise<void>
  'stream:request': () => void
}

type ClientSocket = SocketIOClientSocket<ServerEvents, ClientEvents>

export type { ClientEvents, ClientSocket, ServerEvents }
