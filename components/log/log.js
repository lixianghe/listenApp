// components/log/log.js
//获取应用实例
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    log:'',
    mini:true,
    logTop:'100vh',
    logWidth:'100vh',
    timer:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshLog(){
      //注释掉return,可以看log
          // return
      this.setData({
        log: app.logText
      })
      clearTimeout(app.logTimer)
      app.logTimer = setTimeout(()=>{
        this.refreshLog()
      },1000)
    },
    openLog(){
      this.setData({
        logTop:'0',
        mini:false
      })
      this.refreshLog()
    },
    closeLog() {
      this.setData({
        logTop: '100vh',
        mini: true
      })
    },
    maxLog() {
      app.showHttpLog = !app.showHttpLog
      this.setData({
        logWidth: '100vw'
      })
    },
    minLog() {
      this.setData({
        logWidth: '100vh'
      })
    },
    clearLog() {
      app.logText = 'v' + app.version + '\n';
      this.setData({
        log: app.logText
      })
    },
    tapLog() {
      let stamp = new Date().getTime()
      let timer = this.data.timer;
      if (timer.length < 3) {
        timer.push(stamp);
      } else {
        if (timer[2] - timer[0] < 5000) {
          this.openLog();
        }
        timer = []
      }
      this.setData({
        timer
      })
    }
  },

  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
  }
})
