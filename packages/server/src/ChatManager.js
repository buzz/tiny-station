class ChatManager {
  handleClientConnect(io, socket) {
    console.log('[ChatManager] handleClientConnect')

    socket.join('chat')

    socket.on('chatLogin', (nickname) => {
      console.log(`[ChatManager] chatLogin ${nickname}`)
    })

    socket.on('disconnect', () => {
      console.log('[ChatManager] disconnect')
    })
  }
}

export default ChatManager
