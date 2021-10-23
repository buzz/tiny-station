import { v4 as uuidv4 } from 'uuid'
import AbstractHandler from './AbstractHandler'

class ChatManager extends AbstractHandler {
  async handleClientConnect(socket) {
    const redis = this.getRedis()

    console.log('[ChatManager] handleClientConnect')

    socket.on('chat:message', async (msg) => {
      try {
        await this.auth(socket)
      } catch (err) {
        socket.emit('user:kick', 'Connection lost. Please relogin.')
        return
      }

      const cleanMsg = ChatManager.processString(msg, 512)

      if (cleanMsg) {
        const uuid = uuidv4()
        const timestamp = Date.now()
        this.getIOSocket()
          .to('chat')
          .emit('chat:message', uuid, timestamp, socket.request.user.nickname, cleanMsg)
        await redis.storeMessage(uuid, timestamp, socket.request.user.nickname, cleanMsg)
      }
    })

    socket.join('chat')

    socket.emit('chat:push-messages', await redis.getMessages())
  }

  static processString(s, maxLength) {
    const clean = s.trim()
    if (clean.length > maxLength) {
      clean.slice(0, maxLength)
    }
    return clean
  }
}

export default ChatManager
