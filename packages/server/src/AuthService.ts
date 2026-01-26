import { debuglog } from 'node:util'

import jwt from 'jsonwebtoken'

import type { Config } from '#config.js'
import type Mailer from '#mailer.js'
import type RedisConnection from '#redis.js'

const log = debuglog('listen-app:AuthService')

const confirmationText = (token: string, baseUrl: string) => `Hey there!

Open this link to confirm your email:
${baseUrl}?token=${token}

If it wasn't you who registered, please just ignore this message.
`

class AuthService {
  constructor(
    private config: Config,
    private redis: RedisConnection,
    private mailer: Mailer
  ) {}

  async register(
    nickname: string,
    email: string,
    password: string,
    passwordConfirm: string,
    notif: boolean
  ) {
    log(`register ${nickname} ${email}`)

    if (password !== passwordConfirm) {
      throw new Error('Passwords do not match.')
    }

    const cleanNickname = nickname.trim()

    if (await this.redis.nicknameExists(cleanNickname)) {
      throw new Error('The nickname is not available.')
    }

    if (await this.redis.emailExists(email)) {
      throw new Error('The email is not available.')
    }

    const token = AuthService.generateVerificationToken()

    try {
      await this.redis.addUser(email, cleanNickname, password, token)
    } catch (error) {
      throw error instanceof Error ? error : new TypeError('Failed to register user.')
    }

    if (notif) {
      await this.redis.subscribe(email)
    }

    try {
      await this.mailer.send(
        email,
        'Listen app - Confirmation Mail',
        confirmationText(token, this.config.viteBaseUrl)
      )
    } catch (error) {
      console.error('Failed to send mail:', error)
      await this.redis.deleteUser(email)
      await this.redis.deleteToken(token)
      await this.redis.unsubscribe(email)
      throw new Error('Failed to send confirmation mail. Try again later…')
    }
  }

  async login(nickname: string, password: string) {
    log(`login ${nickname}`)

    const email = await this.redis.getEmail(nickname)
    if (typeof email !== 'string') {
      throw new TypeError('Wrong nickname or password.')
    }

    if (!(await this.redis.verifyPassword(email, password))) {
      throw new Error('Wrong nickname or password.')
    }

    const token = this.createJWT(nickname, email)
    const subscribed = await this.redis.isSubscribed(email)

    return { token, nickname, subscribed }
  }

  async verifyEmail(token: string) {
    log(`verify ${token}`)

    if (await this.redis.verifyUser(token)) {
      return { success: true }
    }

    return { success: false }
  }

  async deleteUser(email: string) {
    log(`delete ${email}`)

    await this.redis.deleteUser(email)
    await this.redis.unsubscribe(email)
  }

  async updateNotifications(email: string, subscribed: boolean) {
    log(`updateNotifications ${email} ${subscribed}`)

    await (subscribed ? this.redis.subscribe(email) : this.redis.unsubscribe(email))
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

  createJWT(nickname: string, email: string) {
    return jwt.sign({ user: { _id: email, nickname } }, this.config.jwtSecret)
  }
}

export default AuthService
