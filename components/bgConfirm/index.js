const app = getApp()

Component({
  properties: {
    msg: String,
    confirm: String,
    cancel: String
  },
  data: {
    isBgContent: false,
    contentName: '',
    handleCallback: null
  },
  methods: {
    closeBgConfirm () {
      this.setData({
        isBgContent: false,
        contentName: ''
      })
    },
    hideShow(val, name, callback) {
      this.setData({
        isBgContent: val,
        contentName: name,
        handleCallback: callback
      })

      if (name === 'login') {
        this.login()
      }
    },
    login () {
      // 模拟扫码后登录成功
      setTimeout(() => {
        // 执行登录
        this.data.handleCallback()
        this.setData({
          isBgContent: false
        })
      }, 1000)
    },
    loginOut () {
      this.data.handleCallback()
      this.closeBgConfirm()
    }
  },
  attached(options) {

  }
})