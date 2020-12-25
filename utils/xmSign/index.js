import { inNode, encrypt } from './utils'

class xmSign {
  constructor() {
    if (xmSign._instance) return xmSign._instance
    xmSign._instance = this

    this.clockTimer = null

    this.URL = 'https://www.ximalaya.com/revision/time'
    this.INISTAL_TIME = null // 服务初始时间
    this.CLOCK_UPDATE_INTERVAL = 3 * 1111 // 更新间隔
    this.RESET_SERVER_CLOCK_LIMIT = 10 * 60 * 1000 // 重新获取服务器时间的间隔

    this.start()
  }

  start(force = false) {
    if (inNode()) return
    if (!window.XM_SERVER_CLOCK || force) {
      this.getServerDate().then(time => {
        this.INISTAL_TIME = time
        window.XM_SERVER_CLOCK = time
        this.updateClock()
      })
    }
  }

  getSign() {
    let serverTime = ''
    if (inNode()) {
      serverTime = Date.now()
    } else {
      serverTime = window.XM_SERVER_CLOCK || 0
    }
    let sign = encrypt(serverTime)

    return sign
  }

  getServerDate() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()
      xhr.open('GET', this.URL, true)
      xhr.send(null)
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          let time = Number(xhr.responseText)
          time = isNaN(time) ? Date.now() : time
          resolve(time)
        }
      }
    })
  }

  updateClock() {
    this.clockTimer = setInterval(() => {
      if (
        window.XM_SERVER_CLOCK - this.INISTAL_TIME <=
          this.RESET_SERVER_CLOCK_LIMIT ||
        document.hidden
      ) {
        window.XM_SERVER_CLOCK += this.CLOCK_UPDATE_INTERVAL
      } else {
        clearInterval(this.clockTimer)
        this.clockTimer = null
        this.start(true)
      }
    }, this.CLOCK_UPDATE_INTERVAL)
  }
}

export default xmSign
