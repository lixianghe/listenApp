const app = getApp()
import tool from '../../utils/util'
import btnConfig from '../../utils/pageOtpions/pageOtpions'
import { isFavorite, like } from '../../developerHandle/playInfo'

var timer = null

Component({
  properties: {
    percent: {
      type: Number,
      default: 0,
    },
    songpic: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    no: {
      type: Number,
      default: 0,
    },
    songInfo: {
      type: Object,
      default: {}
    }
  },
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    // mini player按钮配置
    miniBtns: [
      {
        name: 'pre',
        img: '/images/pre.png',
      },
      {
        name: 'toggle',
        img: {
          stopUrl: '/images/stop.png' ,
          playUrl: '/images/play.png'
        }
      },
      {
        name: 'next',
        img: '/images/next.png'
      },
      {
        name: 'like',                                             // 收藏
        img: {
          noLike: '/images/like_none.png' ,                    // 未收藏的图标
          liked: '/images/like.png'                          // 已收藏的图标
        }
      }
    ],
    // 开发者不传的话默认的按钮
    defaultBtns: [
      {
        name: 'toggle',
        img: {
          stopUrl: '/images/stop.png' ,
          playUrl: '/images/play.png'
        }
      }
    ],
    playing: false,
    hoverflag: false,
    current: null,
    canplay: [],
    mianColor: btnConfig.colorOptions.mainColor,
    percentBar: btnConfig.percentBar,
    existed: false
  },
  audioManager: null,
  observers: {
    'playing': function() {
      console.log('playing')
    }
  },
  attached: function () {
    
  },
  detached: function () {

  },
  methods: {
    player(e) {
      if (!this.data.songInfo || !this.data.songInfo.title) return false
      const type = e.currentTarget.dataset.name
      if (type) this[type]()
    },
    // 上一首
    pre() {
      if (app.globalData.songInfo.title) {
        setTimeout(() => {
          this.triggerEvent('current', this.data.currentId)
        }, 300)
      }
      // 设置播放图片名字和时长
      const that = this
      app.cutplay(that, - 1)
    },
    // 下一首
    next() {
      if (app.globalData.songInfo.title) {
        setTimeout(() => {
          this.triggerEvent('current', this.data.currentId)
        }, 300)
      }
      // 设置播放图片名字和时长
      const that = this
      app.cutplay(that, + 1)
    },
    // 暂停
    toggle() {
      tool.toggleplay(this, app)
    },
    // 进入播放详情
    playInfo() {
      let abumInfoName = wx.getStorageSync('abumInfoName')
      wx.navigateTo({
        url: `../playInfo/playInfo?noPlay=true&abumInfoName=${abumInfoName}`
      })
    },
    // 监听音乐播放的状态
    listenPlaey() {
      const that = this;
      // 每次从缓存中拿到当前歌曲的相关信息，还有播放列表
      if (app.globalData.songInfo && app.globalData.songInfo.title) {
        that.setData({
          songInfo: app.globalData.songInfo
        })
      }
      // 监听歌曲播放状态，比如进度，时间
      tool.playAlrc(that, app);
      timer = setInterval(() => {
        tool.playAlrc(that, app);
      }, 1000);
    },
    btnstart(e) {
      const index = e.currentTarget.dataset.index
      this.setData({
        hoverflag: true,
        current: index

      })
    },
    btend() {
      setTimeout(()=> {
        this.setData({
          hoverflag: false,
          current: null
        })
      }, 150)
    },
    // 收藏和取消
    like() {
      let that = this
      like(that)
    },
    watchPlay() {
      app.globalData.songInfo = wx.getStorageSync('songInfo')
      const playing = wx.getStorageSync('playing')
      this.setData({
        songInfo: app.globalData.songInfo 
      })
      // 如果上次退出是播放状态就继续播放
      if (playing) {
        app.playing()
      }
    },
    // 因为1.9.2版本无法触发onshow和onHide所以事件由它父元素触发
    setOnShow() {
      clearInterval(timer)
      const canplay = wx.getStorageSync('canplay')
      this.setData({
        canplay: canplay
      })
      this.listenPlaey()
      // 初始化backgroundManager
      let that = this
      tool.initAudioManager(that, canplay)
      const playing = wx.getStorageSync('playing')
      if (playing) app.playing()
      // 是否被收藏
      let songInfo = wx.getStorageSync('songInfo')
      isFavorite({mediaId: songInfo.id}, that)
    },
    setOnHide() {
      clearInterval(timer)
    }
  }
})
