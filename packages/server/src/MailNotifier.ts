import { debuglog } from 'node:util'

import type { StreamInfo } from '@listen-app/common'

import type { Config } from '#config.js'
import type Mailer from '#mailer.js'
import type RedisConnection from '#redis.js'
import type StreamInfoHandler from '#StreamInfoHandler.js'

const log = debuglog('listen-app:MailNotifier')

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
  private config: Config
  private redis: RedisConnection
  private mailer: Mailer
  private notifyTimeout: NodeJS.Timeout | null = null
  private info: StreamInfo | null = null

  constructor(
    config: Config,
    streamInfoHandler: StreamInfoHandler,
    redis: RedisConnection,
    mailer: Mailer
  ) {
    this.config = config
    this.redis = redis
    this.mailer = mailer

    this.notifyTimeout = null
    this.info = null

    streamInfoHandler.on('update', (info: StreamInfo | null) => {
      this.onInfoUpdate(info)
    })
  }

  async notify() {
    const serverInfo = this.info
    if (!serverInfo) {
      return
    }

    log('notify', this.info)

    const emails = await this.redis.getSubscribedEmails()
    await Promise.all(
      emails.map((email) => {
        return this.mailer.send(
          email,
          `Stream is live now! ${serverInfo.name}`,
          notificationText(serverInfo.name, serverInfo.listenUrl, this.config.viteBaseUrl)
        )
      })
    )
  }

  clear() {
    if (this.notifyTimeout) {
      this.info = null
      clearTimeout(this.notifyTimeout)
    }
  }

  private onInfoUpdate(info: StreamInfo | null) {
    log('onInfoUpdate', info)

    const shouldNotify = info && typeof info.name === 'string' && !info.name.includes('__TEST__')

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
