const app = getApp()
import tool from './util'
import btnConfig from '../../utils/pageOtpions/pageOtpions'

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
    },
    total: {
      type: Number,
      default: 0,
    },
    list: {
      type: Array,
      default: []
    }
  },
  data: {
    // minibar的按钮
    items: btnConfig.miniBtns,
    playing: false,
    hoverflag: false,
    current: null,
    canplay: [],
    mianColor: btnConfig.colorOptions.mainColor,
    percentBar: btnConfig.percentBar,
    useCarPlay: wx.canIUse('backgroundAudioManager.onUpdateAudio')
  },
  audioManager: null,
  attached: function () {
    
    // 用于测试数据
    const songInfo = wx.getStorageSync('songInfo')
    const list = wx.getStorageSync('canplay')
    this.setData({
      songInfo: songInfo,
      list: list
    })
    this.setOnShow()
  },
  detached: function () {
    this.setOnHide()
  },
  methods: {
    player(e) {
      const type = e.currentTarget.dataset.name
      switch (type) {
        case 'pre':
          this.pre()
          break;
        case 'toggle':
          this.togglePlay()
          break;
        case 'next':
          this.next()
          break;
        default:
          break;
      }
    },
    // 上一首
    pre() {
      const that = this
      this.cutplay(that, - 1)
    },
    // 下一首
    next() {
      // 设置播放图片名字和时长
      const that = this
      this.cutplay(that, + 1)
    },
    // 暂停
    togglePlay() {
      tool.toggleplay(this)
    },
    stopmusic: function () {
      wx.pauseBackgroundAudio();
    },
    // 切歌的方法
    cutplay: function (that, type) {
      // 设置列表的index
      let no = this.data.songInfo.episode
      let index = this.setIndex(type, no, this.data.list) - 1
      //播放列表中下一首
      this.data.songInfo = this.data.list[index]
      //歌曲切换 停止当前音乐
      this.data.playing = false;
      wx.pauseBackgroundAudio();
      this.playing()
      // 切完歌改变songInfo的index
      this.data.songInfo.episode = index + 1
      this.data.songInfo.dt = String(this.data.songInfo.dt).split(':').length > 1 ? this.data.songInfo.dt : tool.formatduration(Number(this.data.songInfo.dt))
      that.setData({
        songInfo: this.data.songInfo
      })
    },
    // 根据循环模式设置切歌的index
    setIndex(type, no, list) {
      let index
      if (type === 1) {
        index = no + 1 > list.length - 1 ? 0 : no + 1
      } else {
        index = no - 1 < 0 ? list.length - 1 : no - 1
      }
      return index
    },
    // 根据歌曲url播放歌曲
    playing: function (seek, cb) {
      const songInfo = this.data.songInfo
      // 如果是车载情况
      if (this.data.useCarPlay) {
        this.carHandle()
      } else {
        this.wxPlayHandle(songInfo, seek, cb)
      }

    },
    // 车载情况下的播放
    carHandle() {
      let media = wx.getStorageSync('songInfo') || {} 
      this.audioManager.src = media.src
      this.audioManager.title = media.title
      this.audioManager.coverImgUrl = media.coverImgUrl
    },
    // 非车载情况的播放
    wxPlayHandle(songInfo, seek, cb) {
      var that = this
      wx.playBackgroundAudio({
        dataUrl: songInfo.src,
        title: songInfo.title,
        success: function (res) {
          if (seek != undefined && typeof(seek) === 'number') {
            wx.seekBackgroundAudio({ position: seek })
          };
          that.data.playing = true;
          cb && cb();
        },
        fail: function () {

        }
      })
    },
    // 进入播放详情
    playInfo() {
      wx.navigateTo({
        url: '../playInfo/playInfo?noPlay=true'
      })
    },
    // 监听音乐播放的状态
    listenPlaey() {
      const that = this;
      // 每次从缓存中拿到当前歌曲的相关信息，还有播放列表
      if (this.data.songInfo && this.data.songInfo.title) {
        that.setData({
          songInfo: this.data.songInfo
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
      if (playing) this.playing()
    },
    setOnHide() {
      clearInterval(timer)
    }
  }
})
