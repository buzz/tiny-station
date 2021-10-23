import { v4 as uuidv4 } from 'uuid'

class ChatManager {
  nicknamesBySocket = {}

  redis = undefined

  constructor(redis) {
    this.redis = redis
  }

  handleClientConnect(io, socket) {
    console.log('[ChatManager] handleClientConnect')

    socket.on('chat:join', (nickname) => {
      console.log(`[ChatManager] chat:join ${nickname}`)

      const cleanNickname = ChatManager.processString(nickname, 16)

      try {
        this.addNickname(socket.id, cleanNickname)
      } catch (e) {
        socket.emit('chat:join-fail', e.message)
        return
      }

      socket.emit('chat:join-success', cleanNickname)
    })

    socket.on('chat:exit', () => {
      console.log('[ChatManager] chat:exit')

      const nickname = this.getNickname(socket.id)
      if (nickname) {
        this.removeNickname(socket.id)
        socket.emit('chat:exit-success')
      }
    })

    socket.on('chat:message', (msg) => {
      const nickname = this.getNickname(socket.id)
      const cleanMsg = ChatManager.processString(msg, 512)

      if (nickname && cleanMsg) {
        const uuid = uuidv4()
        const timestamp = Date.now()
        io.to('chat').emit('chat:message', uuid, timestamp, nickname, cleanMsg)
        this.redis.storeMessage(uuid, timestamp, nickname, cleanMsg)
      } else {
        socket.emit('chat:kick', 'Connection lost. Please rejoin.')
      }
    })

    socket.on('disconnect', () => {
      console.log('[ChatManager] disconnect')
      this.removeNickname(socket.id)
    })

    socket.join('chat')

    this.redis.getMessages().then((messages) => {
      socket.emit('chat:push-messages', messages)
    })
  }

  getNickname(socketId) {
    return this.nicknamesBySocket[socketId]
  }

  addNickname(socketId, nickname) {
    if (!nickname) {
      throw new Error('Nickname is empty.')
    }

    if (this.nicknameTaken(nickname)) {
      throw new Error('Nickname is already taken.')
    }

    this.nicknamesBySocket[socketId] = nickname
  }

  removeNickname(socketId) {
    if (Object.prototype.hasOwnProperty.call(this.nicknamesBySocket, socketId)) {
      delete this.nicknamesBySocket[socketId]
    }
  }

  nicknameTaken(nickname) {
    return Object.values(this.nicknamesBySocket).some((n) => n === nickname)
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
