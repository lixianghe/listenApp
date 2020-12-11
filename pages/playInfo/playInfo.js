
const app = getApp()
import tool from '../../utils/util'
import btnConfig from '../../utils/pageOtpions/pageOtpions'
// const { getData } = require('../../utils/https')

var timer = null

Page({
  mixins: [require('../../developerHandle/playInfo')],
  data: {
    songInfo: {},
    playing: false,
    drapType: false,
    percent: 0,
    drapPercent: 0,
    playtime: '00:00',
    showList: false,
    currentId: null,
    // 开发者不传默认的按钮
    defaultBtns: [
      {
        name: 'toggle',                                          // 播放/暂停
        img: {
          stopUrl: '/images/stop2.png' ,                         // 播放状态的图标
          playUrl: '/images/play2.png'                           // 暂停状态的图标
        }
      },
    ],
    btnCurrent: null,
    noTransform: '',
    typelist: ['listLoop', 'singleLoop', 'shufflePlayback'],
    typeName: {
      "listLoop": '循环播放',
      "singleLoop": '单曲循环',
      "shufflePlayback": '随机播放',
    },
    loopType: 'listLoop',   // 默认列表循环
    likeType: 'noLike',
    total: 0,
    scrolltop: 0,
    isDrag: '',
    barWidth: 0,
    currentTime: 0,
    mainColor: btnConfig.colorOptions.mainColor,
    percentBar: btnConfig.percentBar,
    showImg: false,
    bigScreen: app.globalData.PIbigScreen,
    abumInfoName: null,
    existed: false,
    mainColor: btnConfig.colorOptions.mainColor,
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen
  },
  // 播放器实例
  audioManager: null,
  onReady: function () {
    this.animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear'
    })
  },
  async onLoad(options) {
    // 根据分辨率设置样式
    this.setStyle()
    // 获取歌曲列表
    const canplay = wx.getStorageSync('allList')
    let abumInfoName = wx.getStorageSync('abumInfoName')
    const songInfo = app.globalData.songInfo
    this.setData({
      songInfo: songInfo,
      canplay: canplay,
      noPlay: options.noPlay || null,
      abumInfoName: options.abumInfoName || null,
      loopType: wx.getStorageSync('loopType') || 'listLoop'
    })
    // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
    wx.setStorageSync('abumInfoName', options.abumInfoName)
    if (options.noPlay !== 'true' || abumInfoName !== options.abumInfoName) wx.setStorageSync('nativeList', canplay)
    if (options.noPlay !== 'true') wx.showLoading({ title: '加载中...', mask: true })
  },
  onShow: function () {
    const that = this;
    // 监听歌曲播放状态，比如进度，时间
    tool.playAlrc(that, app);
    timer = setInterval(function () {
      tool.playAlrc(that, app);
    }, 1000);
    that.queryProcessBarWidth()
  },
  onUnload: function () {
    clearInterval(timer);
  },
  onHide: function () {
    clearInterval(timer)
  },
  imgOnLoad() {
    this.setData({ showImg: true })
  },
  play() {
    // 初始化audioManager
    let that = this
    tool.initAudioManager(that, this.data.canplay)
    // 从统一播放界面切回来，根据playing判断播放状态options.noPlay为true代表从minibar过来的
    const playing = wx.getStorageSync('playing')
    if (playing || this.data.noPlay !== 'true') app.playing()
  },
  btnsPlay(e) {
    const type = e.currentTarget.dataset.name
    if (type) this[type]()
  },
  // 上一首
  pre() {
    let loopType = wx.getStorageSync('loopType')
    if (loopType !== 'singleLoop') this.setData({ showImg: false })
    const that = this
    app.cutplay(that, -1)
  },
  // 下一首
  next() {
    let loopType = wx.getStorageSync('loopType')
    if (loopType !== 'singleLoop') this.setData({ showImg: false })
    const that = this
    app.cutplay(that, 1)
  },
  // 切换播放模式
  loopType() {
    const canplay = wx.getStorageSync('allList')
    let nwIndex = this.data.typelist.findIndex(n => n === this.data.loopType)
    let index = nwIndex < 2 ? nwIndex + 1 : 0
    app.globalData.loopType = this.data.typelist[index]
    // 根据播放模式切换currentList
    const list = this.checkLoop(this.data.typelist[index], canplay)
    wx.setStorageSync('allList', canplay)
    this.setData({
      loopType: this.data.typelist[index],
      canplay: list
    })
  },
  // 判断循环模式
  checkLoop(type, list) {
    wx.setStorageSync('loopType', type)
    wx.showToast({ title: this.data.typeName[type], icon: 'none' })
    let loopList;
    // 列表循环
    if (type === 'listLoop') {
      let nativeList = wx.getStorageSync('nativeList') || []
      loopList = nativeList        
    } else if (type === 'singleLoop') {
      // 单曲循环
      loopList = [list[app.globalData.songInfo.episode]]
    } else {
      // 随机播放
      loopList = this.randomList(list)
    }
    return loopList
  },
  // 打乱数组
  randomList(arr) {
    let len = arr.length;
    while (len) {
        let i = Math.floor(Math.random() * len--);
        [arr[i], arr[len]] = [arr[len], arr[i]];
    }
    return arr;
  },
  // 暂停/播放
  toggle() {
    const that = this
    tool.toggleplay(that, app)
  },
  // 播放列表
  more() {
    setTimeout(()=> {
      this.setScrollTop()
    }, 100)
    let allPlay = wx.getStorageSync('allList')
    this.setData({
      showList: true,
      currentId: this.data.currentId || Number(this.data.songInfo.id),
      canplay: allPlay
    })
    // 显示的过度动画
    this.animation.translate(0, 0).step()
    this.setData({
      animation: this.animation.export()
    })
    setTimeout(() => {
      this.setData({
        noTransform: 'noTransform'
      })
    }, 300)
  },
  closeList() {
    this.setData({
      showList: false,
      noTransform: ''
    })
    // 显示的过度动画
    this.animation.translate('-180vh', 0).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  // 在播放列表里面点击播放歌曲
  async playSong(e) {
    const songInfo = e.currentTarget.dataset.song
    app.globalData.songInfo = songInfo
    // 获取歌曲详情
    let params = {mediaId: app.globalData.songInfo.id, contentType: 'story'}
    await this.getMedia(params)
    this.setData({
      songInfo: songInfo,
      currentId: app.globalData.songInfo.id,
      playing: true
      // noTransform: ''
    })
    app.playing()
    wx.setStorage({
      key: "songInfo",
      data: app.globalData.songInfo
    })
  },
  // 开始拖拽
  dragStartHandle(event) {
    console.log('isDrag', this.data.isDrag)
    this.setData({
      isDrag: 'is-drag',
      _offsetLeft: event.changedTouches[0].pageX,
      _posLeft: event.currentTarget.offsetLeft
    })
  },
  // 拖拽中
  touchmove(event) {
    let offsetLeft = event.changedTouches[0].pageX
    let process = (offsetLeft - this.data._offsetLeft + this.data._posLeft) / this.data.barWidth
    if (process < 0) {
        process = 0
    } else if (process > 1) {
        process = 1
    }
    let percent = (process * 100).toFixed(3)
    let currentTime = process * tool.formatToSend(app.globalData.songInfo.dt)
    let playtime = currentTime ? tool.formatduration(currentTime * 1000) : '00:00'
    this.setData({
      percent,
      currentTime,
      playtime
    })
  },
  // 拖拽结束
  dragEndHandle(event) {
    wx.seekBackgroundAudio({
      position: this.data.currentTime
    })
    setTimeout(() => {
      this.setData({isDrag: ''})
    }, 500)
  },
  // 查询processBar宽度
  queryProcessBarWidth() {
    var query = this.createSelectorQuery();
    query.selectAll('.process-bar').boundingClientRect();
    query.exec(res => {
      try {
        this.setData({
          barWidth: res[0][0].width
        })
      } catch (err) {
      }
    })
  },
  // ******按钮点击态处理********/
  btnstart(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      btnCurrent: index

    })
  },
  btend() {
    setTimeout(()=> {
      this.setData({
        btnCurrent: null
      })
    }, 150)
  },
   // ******按钮点击态处理********/
   
  // 根据分辨率判断显示哪种样式
  setStyle() {
    // 判断分辨率的比列
    const windowWidth =  wx.getSystemInfoSync().screenWidth;
    const windowHeight = wx.getSystemInfoSync().screenHeight;
    // 如果是小于1/2的情况
    if (windowHeight / windowWidth >= 0.41) {
      this.setData({
        bigScreen: false,
        leftWith: windowWidth * 0.722 + 'px',
        leftPadding: '0vh 9.8vh 20vh',
        btnsWidth: '140vh',
        imageWidth: windowWidth * 0.17 + 'px'
      })
    } else {
      // 1920*720
      this.setData({
        bigScreen: true,
        leftWith: '184vh',
        leftPadding: '0vh 12.25vh 20vh',
        btnsWidth: '165vh',
        imageWidth: '49vh'
      })
    }
  },
  // 处理scrollTop的高度
  setScrollTop() {
    let index = this.data.canplay.findIndex(n => Number(n.id) === Number(this.data.songInfo.id))
    let query = wx.createSelectorQuery();
    query.select('.songList').boundingClientRect(rect=>{
      let listHeight = rect.height;
      this.setData({
        scrolltop: index > 2 ? listHeight / this.data.canplay.length * (index - 2) : 0
      })
    }).exec();
  }
})