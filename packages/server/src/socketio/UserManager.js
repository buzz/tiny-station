import util from 'util'

import EmailValidator from 'email-validator'
import jwt from 'jsonwebtoken'

import AbstractHandler from './AbstractHandler.js'

const log = util.debuglog('listen-app:UserManager')

const confirmationText = (token) => `Hey there!

Open this link to confirm your email:
${process.env.VITE_BASE_URL}?token=${token}

If it wasn't you who registered, please just ignore this message.
`

class UserManager extends AbstractHandler {
  handleClientConnect(socket) {
    const mailer = this.getMailer()
    const redis = this.getRedis()

    socket.on('user:verify-jwt', async () => {
      log('user:verify-jwt')

      try {
        await this.auth(socket)
      } catch {
        socket.emit('user:kick')
        return
      }

      socket.emit(
        'user:verify-jwt-success',
        socket.request.user.nickname,
        socket.request.user.notif
      )
    })

    socket.on('user:login', async (nickname, password) => {
      log(`user:login ${nickname}`)

      const email = await redis.getEmail(nickname)
      if (typeof email !== 'string') {
        socket.emit('user:login-fail', 'Wrong nickname or password.')
        return
      }

      if (!(await redis.verifyPassword(email, password))) {
        socket.emit('user:login-fail', 'Wrong nickname or password.')
        return
      }

      const token = UserManager.createJWT(nickname, email)

      socket.emit('user:login-success', nickname, token, await redis.isSubscribed(email))
    })

    socket.on('user:register', async (nickname, email, password, passwordConfirm, notif) => {
      log(`user:register ${nickname} ${email}`)

      if (!nickname || !email || !password || !passwordConfirm) {
        socket.emit('user-register:fail', 'Bad form data.')
        return
      }

      const cleanNickname = nickname.trim()

      if (!cleanNickname || cleanNickname.length > 16) {
        socket.emit('user:register-fail', 'Bad nickname,')
        return
      }

      if (!EmailValidator.validate(email)) {
        socket.emit('user:register-fail', 'Not a valid email address.')
        return
      }

      if (password !== passwordConfirm) {
        socket.emit('user:register-fail', 'Passwords do not match.')
        return
      }

      if (password.length < 6) {
        socket.emit('user:register-fail', 'Password needs to be at least 6 characters long.')
        return
      }

      if (await redis.nicknameExists(cleanNickname)) {
        socket.emit('user:register-fail', 'The nickname is not available.')
        return
      }

      if (await redis.emailExists(email)) {
        socket.emit('user:register-fail', 'The email is not available.')
        return
      }

      const token = UserManager.generateVerificationToken()

      try {
        await redis.addUser(email, cleanNickname, password, token)
      } catch (err) {
        socket.emit('user:register-fail', err.message)
        return
      }

      if (notif) {
        await redis.subscribe(email)
      }

      try {
        await mailer.send(email, 'Listen app - Confirmation Mail', confirmationText(token))
        socket.emit(
          'user:register-success',
          "Check your inbox and click the link in the confirmation mail. It's valid for one hour."
        )
      } catch (err) {
        try {
          console.error('Failed to send mail:', err)
          await redis.deleteUser(email)
          await redis.deleteToken(token)
          await redis.unsubscribe(email)
        } finally {
          socket.emit('user:register-fail', 'Failed to send confirmation mail. Try again later…')
        }
      }
    })

    socket.on('user:verify', async (token) => {
      log(`user:verify ${token}`)

      if (await redis.verifyUser(token)) {
        socket.emit('user:verify-success')
      } else {
        socket.emit('user:verify-fail')
      }
    })

    socket.on('user:delete', async () => {
      log('user:delete')

      try {
        await this.auth(socket)
      } catch {
        socket.emit('user:kick', 'Connection lost. Please relogin.')
        return
      }

      await redis.deleteUser(socket.request.user.email)
      await redis.unsubscribe(socket.request.user.email)

      socket.emit('user:delete-success')
    })

    socket.on('user:update-notif', async (val) => {
      log(`user:update-notif ${val}`)

      try {
        await this.auth(socket)
      } catch {
        socket.emit('user:kick', 'Connection lost. Please relogin.')
        return
      }

      if (val) {
        await redis.subscribe(socket.request.user.email)
      } else {
        await redis.unsubscribe(socket.request.user.email)
      }

      socket.emit('user:update-notif-success', val)
    })
  }

  static generateVerificationToken() {
    let token = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < 10; i += 1) {
      token += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return token
  }

  static createJWT(nickname, email) {
    return jwt.sign({ user: { _id: email, nickname } }, process.env.JWT_SECRET)
  }
}

export default UserManager
