import type { FastifyBaseLogger } from 'fastify'

import type { StreamInfo } from '@listen-app/common'

import { NOTIFIER_IGNORE_PATTERN } from '#constants.js'
import type { Config } from '#plugins/config.js'
import type Mailer from '#plugins/mailer/Mailer.js'
import type RedisConnection from '#plugins/redis/RedisConnection.js'
import type StreamInfoHandler from '#plugins/streamInfo/StreamInfoHandler.js'

const notificationText = (title: string, listenUrl: string, baseUrl: string) => `Hey there!

This is to let you know that a stream went live right now.

Stream title: ${title}

You can listen and chat here:
${baseUrl}

Use this URL directly in your media player:
${listenUrl}

You receive this email because you subscribed to the stream. You can login
and change email notifications under settings.
`

class MailNotifier {
  private notifyTimeout: NodeJS.Timeout | null = null
  private info: StreamInfo | null = null

  constructor(
    private config: Config,
    private redis: RedisConnection,
    private mailer: Mailer,
    private log: FastifyBaseLogger,
    streamInfoHandler: StreamInfoHandler
  ) {
    streamInfoHandler.on('update', (info) => {
      this.onInfoUpdate(info)
    })
  }

  async notify() {
    const { info } = this

    if (!info) {
      return
    }

    this.log.debug(`Notifying: name=${info.name} listenUrl=${info.listenUrl}`)

    const emails = await this.redis.getSubscribedEmails()

    for (const email of emails) {
      await this.mailer.send(
        email,
        `Stream is live now! ${info.name}`,
        notificationText(info.name, info.listenUrl, this.config.baseUrl)
      )
    }
  }

  clear() {
    if (this.notifyTimeout) {
      this.info = null
      clearTimeout(this.notifyTimeout)
    }
  }

  private onInfoUpdate(info: StreamInfo | null) {
    const shouldNotify =
      info && typeof info.name === 'string' && !info.name.includes(NOTIFIER_IGNORE_PATTERN)

    this.clear()
    if (shouldNotify) {
      this.info = info
      const notifyDelayMillis = this.config.notifyDelay * 1000
      this.notifyTimeout = setTimeout(() => {
        void this.notify()
      }, notifyDelayMillis)
    }
  }
}

export default MailNotifier
