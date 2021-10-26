import nodemailer from 'nodemailer'

class Mailer {
  transporter = undefined

  constructor() {
    const transportOpts = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: process.env.SMTP_IGNORE_INVALID_CERT !== 'true',
      },
    }

    if (process.env.SMTP_USER && process.env.SMTP_PWD) {
      transportOpts.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD,
      }
    }

    this.transporter = nodemailer.createTransport(transportOpts)
  }

  send(to, subject, text) {
    return this.transporter.sendMail({
      from: process.env.SMTP_SENDER,
      to,
      subject,
      text,
    })
  }
}

export default Mailer
