class AbstractHandler {
  manager = undefined

  constructor(manager) {
    this.manager = manager

    if (this.handleClientConnect === undefined) {
      throw new TypeError('Must override handleClientConnect')
    }
  }

  auth(socket) {
    return new Promise((resolve, reject) => {
      this.manager.passportAuthenticate(socket, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  getClientsNum(room) {
    const { rooms } = this.getIOSocket().of('/').adapter
    return rooms.has(room) ? rooms.get(room).size : 0
  }

  getIOSocket() {
    return this.manager.getIOSocket()
  }

  getStreamInfoHandler() {
    return this.manager.getStreamInfoHandler()
  }

  getRedis() {
    return this.manager.getRedis()
  }

  getMailer() {
    return this.manager.getMailer()
  }
}

export default AbstractHandler
