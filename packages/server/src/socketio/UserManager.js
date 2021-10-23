import EmailValidator from 'email-validator'

class UserManager {
  redis = undefined

  constructor(redis) {
    this.redis = redis
  }

  handleClientConnect(io, socket) {
    console.log('[UserManager] handleClientConnect')

    socket.on('user:register', (nickname, email, password, passwordConfirm) => {
      console.log(`[UserManager] user:register ${nickname} ${email} ${password} ${passwordConfirm}`)

      if (!nickname) {
        socket.emit('user-register:fail', 'No nickname.')
        return
      }

      if (!EmailValidator.validate(email)) {
        socket.emit('user:register-fail', 'No valid email.')
        return
      }

      if (password !== passwordConfirm) {
        socket.emit('user-register:fail', 'Passwords do not match.')
        return
      }

      try {
        this.redis.addUser(email, nickname, password)
      } catch (err) {
        socket.emit('user-register:fail', err.message)
        return
      }

      socket.emit('user-register:success', 'Passwords do not match.')
    })

    socket.on('disconnect', () => {
      console.log('[UserManager] disconnect')
    })
  }
}

export default UserManager
