import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

import type { Config } from '#plugins/configPlugin.js'

class Mailer {
  private transporter: Transporter | null = null

  constructor(private config: Config) {
    this.transporter = this.makeTransport()
  }

  async send(to: string, subject: string, text: string) {
    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.config.smtpSender,
        to,
        subject,
        text,
      })
    }
  }

  private makeTransport() {
    const transportOpts: SMTPTransport.Options = {
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: !this.config.smtpIgnoreInvalidCert,
      },
    }

    if (this.config.smtpUser && this.config.smtpPassword) {
      transportOpts.auth = {
        user: this.config.smtpUser,
        pass: this.config.smtpPassword,
      }
    }

    return nodemailer.createTransport(transportOpts)
  }
}

export default Mailer
