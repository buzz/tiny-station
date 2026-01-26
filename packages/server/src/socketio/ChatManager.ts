import { debuglog } from 'node:util'

import { v4 as uuidv4 } from 'uuid'

import type { ChatMessage } from '@listen-app/common'

import AbstractHandler from './AbstractHandler.js'
import type { Socket } from './SocketIOManager.js'

const log = debuglog('listen-app:StreamInfoHandler')

class ChatManager extends AbstractHandler {
  async handleClientConnect(socket: Socket) {
    const redis = this.getRedis()

    socket.on('chat:message', async (messageText) => {
      log('chat:message', messageText)

      const { user } = socket.data
      if (!user) {
        socket.emit('user:kick', 'You must be logged in to chat.')
        return
      }

      const cleanText = ChatManager.processString(messageText, 512)

      if (cleanText) {
        const message = {
          uuid: uuidv4(),
          timestamp: Date.now(),
          senderNickname: user.nickname,
          message: cleanText,
        } satisfies ChatMessage
        this.getIOServer().to('chat').emit('chat:message', message)
        await redis.storeMessage(message)
      }
    })

    await socket.join('chat')

    // TODO: use paginated REST API
    socket.emit('chat:push-messages', await redis.getMessages())
  }

  static processString(str: string, maxLength: number) {
    const clean = str.trim()
    if (clean.length > maxLength) {
      clean.slice(0, maxLength)
    }
    return clean
  }
}

export default ChatManager
