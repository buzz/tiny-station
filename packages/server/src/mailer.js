import nodemailer from 'nodemailer'

class Mailer {
  transporter = undefined

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD,
      },
    })
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
