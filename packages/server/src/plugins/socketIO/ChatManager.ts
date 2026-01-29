import { v4 as uuidv4 } from 'uuid'

import type { ChatMessage } from '@listen-app/common'

import { MAX_CHAT_MESSAGE_LENGTH } from '#constants.js'
import type RedisConnection from '#plugins/redis/RedisConnection.js'

import AbstractHandler from './AbstractHandler.js'
import type { Socket, SocketIOServer } from './index.js'

class ChatManager extends AbstractHandler {
  constructor(
    io: SocketIOServer,
    private redis: RedisConnection
  ) {
    super(io)
  }

  async handleClientConnect(socket: Socket) {
    socket.on('chat:message', async (messageText) => {
      const { user } = socket.data
      if (!user) {
        socket.emit('user:kick', 'You must be logged in to chat.')
        return
      }

      const cleanText = ChatManager.processString(messageText)

      if (cleanText) {
        const message = {
          uuid: uuidv4(),
          timestamp: Date.now(),
          senderNickname: user.nickname,
          message: cleanText,
        } satisfies ChatMessage
        this.io.to('chat').emit('chat:message', message)
        await this.redis.storeMessage(message)
      }
    })

    await socket.join('chat')
  }

  private static processString(str: string) {
    const clean = str.trim()
    return clean.length > MAX_CHAT_MESSAGE_LENGTH ? clean.slice(0, MAX_CHAT_MESSAGE_LENGTH) : clean
  }
}

export default ChatManager
