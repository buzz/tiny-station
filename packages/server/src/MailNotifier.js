import util from 'util'

const log = util.debuglog('listen-app:MailNotifier')

const NOTIFY_DELAY = (process.env.NOTIFY_DELAY || 60) * 1000

const notificationText = (title, listenUrl) => `Hey there!

This is to let you know that a stream went live right now.

Stream title: ${title}

You can listen and chat here:
${process.env.VITE_BASE_URL}

Use this URL directly in your media player:
${listenUrl}

You receive this email because you subscribed to the stream. You can login
and change email notifications under settings.
`

class MailNotifier {
  constructor(streamInfoHandler, redis, mailer) {
    this.redis = redis
    this.mailer = mailer
    this.notifyTimeout = null
    this.info = null
    streamInfoHandler.on('update', (info) => this.onInfoUpdate(info))
  }

  async notify() {
    log('notify', this.info)

    const emails = await this.redis.getSubscribedEmails()
    await Promise.all(
      emails.map((email) =>
        this.mailer.send(
          email,
          `Stream is live now! ${this.info.name}`,
          notificationText(this.info.name, this.info.listenUrl)
        )
      )
    )
  }

  clear() {
    if (this.notifyTimeout) {
      this.info = null
      clearTimeout(this.notifyTimeout)
    }
  }

  onInfoUpdate(info) {
    log('onInfoUpdate', info)

    this.clear()
    if (info && typeof info.name === 'string' && !info.name.includes('__TEST__')) {
      this.info = info
      this.notifyTimeout = setTimeout(() => this.notify(), NOTIFY_DELAY)
    }
  }
}

export default MailNotifier
