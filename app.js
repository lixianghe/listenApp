import { init, checkStatus } from './utils/httpOpt/api'
import btnConfig from './utils/pageOtpions/pageOtpions'
import { getMedia } from './developerHandle/playInfo'

require('./utils/minixs')

App({
  globalData: {
    appName: 'kaishustory',
    // 屏幕类型
    screen: '',
    mainColor: btnConfig.colorOptions.mainColor,
    // 登录相关
    openid: '',
    appId: '60008',
    userId: '-1',
    haveLogin: false,
    token: '',
    appId: '60180',
    // 版本号
    version: '1.0.195.20200928',
    isNetConnected: true,
    indexData: [], // 静态首页数据
    latelyListenId: [], // 静态记录播放id
    abumInfoData: [],
    playing: false,
    percent: 0,
    curplay: {},
    globalStop: true,
    currentPosition: 0,
    canplay: [],
    currentList: [],
    loopType: 'listLoop', // 默认列表循环
    useCarPlay: wx.canIUse('backgroundAudioManager.onUpdateAudio'),
    PIbigScreen: null
  },
  // 小程序颜色主题
  sysInfo: {
    colorStyle: 'dark',
    backgroundColor: 'transparent',
    defaultBgColor: '#151515'
  },
   // 用户信息
   userInfo: {
    userId: null,
    token: '',
    refreshToken: ''
  },
  // 用户认证信息
  authInfo: {
    openId: '',
    unionId: '',
    authCode: ''
  },
  // 访客信息
  guestInfo: {
    token: '',
    refreshToken: '',
    deviceId: ''
  },
   // token状态，0-正常，1001-token过期，1003-refresh-token过期，1004-登录过期
  tokenStatus: 0,
  // 日志文本
  logText: '',
  audioManager: null,
  currentIndex: null,
  onLaunch: function () {
    this.initCode()
    // 获取小程序颜色主题
    this.getTheme()
    // 判断playInfo页面样式，因为这里最快执行所以放在这
    this.setStyle()
    this.audioManager = wx.getBackgroundAudioManager()
    // 判断用户是否已经登录了
    this.checkStatus()
    // wx.setStorageSync('username', 'T-mac')
    
    // 判断横竖屏
    if (wx.getSystemInfoSync().windowWidth > wx.getSystemInfoSync().windowHeight) {
      this.globalData.screen = 'h'
    } else {
      this.globalData.screen = 'v'
    }
    // myPlugin.injectWx(wx)
    // 关于音乐播放的
    var that = this;
    //播放列表中下一首
    wx.onBackgroundAudioStop(function () {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      that.cutplay(currentPage, 1, true)
    });
    //监听音乐暂停，保存播放进度广播暂停状态
    wx.onBackgroundAudioPause(function () {
      that.globalData.playing = false;
      wx.getBackgroundAudioPlayerState({
        complete: function (res) {
          that.globalData.currentPosition = res.currentPosition ? res.currentPosition : 0
        }
      })
    });
    if (wx.canIUse('getShareData')) {
      wx.getShareData({
        name: this.globalData.appName,
        success: (res) => {
          let playing = res.data.playStatus
          wx.setStorageSync('playing', playing)
        }
      })
    }
    // 测试getPlayInfoSync
    if (wx.canIUse('getPlayInfoSync')) {
      let res = wx.getPlayInfoSync()
    }

  },

  // 保存用户信息
  setUserInfo(userInfo) {
    this.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },
  // 获取用户信息
  getUserInfo(key) {
    let userInfo = this.userInfo.userId ? this.userInfo : wx.getStorageSync('userInfo')
    if (key) {
      return userInfo[key]
    }
    return userInfo
  },
  vision: '1.0.0',
  cutplay: async function (that, type, cutFlag) {
    that.setData({percent: 0})
    // 判断循环模式
    let allList = wx.getStorageSync('nativeList')
    // 根据循环模式设置数组
    let loopType = wx.getStorageSync('loopType') || 'listLoop'
    // 如果缓存没有abumInfoName，说明是从首页单曲进入，list为单首
    let abumInfoName = wx.getStorageSync('abumInfoName')
    // 歌曲列表
    allList = abumInfoName ? this.setList(loopType, allList, cutFlag) : [this.globalData.songInfo]
    // 当前歌曲的索引
    let no = allList.findIndex(n => Number(n.id) === Number(this.globalData.songInfo.id))
    let index = this.setIndex(type, no, allList)
    //歌曲切换 停止当前音乐
    this.globalData.playing = false;
    let song = allList[index] || allList[0]
    wx.pauseBackgroundAudio();
    that.setData({
      currentId: Number(song.id),       // 当前播放的歌曲id
      currentIndex: index
    })
    // 获取歌曲的url
    let params = {
      mediaId: song.id,
      contentType: 'story'
    }
    await getMedia(params, that)
    loopType === 'singleLoop' ? this.playing(0) : this.playing()
  },
  // 根据循环模式设置播放列表
  setList(loopType, list, cutFlag = false){
    let loopList = []
    // 列表循环
    if (loopType === 'listLoop') {
      loopList = list     
    } else if (loopType === 'singleLoop') {
      // 单曲循环
      loopList = cutFlag ? [this.globalData.songInfo] : list
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
  // 根据循环模式设置切歌的index,cutFlag为true时说明是自然切歌
  setIndex(type, no, list) {
    let index
    if (type === 1) {
      index = no + 1 > list.length - 1 ? 0 : no + 1
    } else {
      index = no - 1 < 0 ? list.length - 1 : no - 1
    }
    return index
  },
  // 暂停音乐
  stopmusic: function () {
    wx.pauseBackgroundAudio();
  },
  // 根据歌曲url播放歌曲
  playing: function (seek, cb) {
    const songInfo = this.globalData.songInfo
    // 如果是车载情况
    if (!this.globalData.useCarPlay) {
      this.carHandle(songInfo, seek)
    } else {
      this.wxPlayHandle(songInfo, seek, cb)
    }

  },
  // 车载情况下的播放
  carHandle(songInfo, seek) {
    this.audioManager.src = songInfo.src
    this.audioManager.title = songInfo.title
    this.audioManager.coverImgUrl = songInfo.coverImgUrl
    if (seek != undefined && typeof (seek) === 'number') {
      wx.seekBackgroundAudio({
        position: seek
      })
    }
  },
  // 非车载情况的播放
  wxPlayHandle(songInfo, seek, cb) {
    var that = this
    wx.playBackgroundAudio({
      dataUrl: songInfo.src,
      title: songInfo.title,
      success: function (res) {
        if (seek != undefined && typeof (seek) === 'number') {
          wx.seekBackgroundAudio({
            position: seek
          })
        };
        that.globalData.playing = true;
        cb && cb();
      },
      fail: function () {
      }
    })
  },

  // 根据分辨率判断显示哪种样式
  setStyle() {
    // 判断分辨率的比列
    const windowWidth = wx.getSystemInfoSync().screenWidth;
    const windowHeight = wx.getSystemInfoSync().screenHeight;
    // 如果是小于1/2的情况
    if (windowHeight / windowWidth >= 0.41) {
      this.globalData.PIbigScreen = false
    } else {
      // 1920*720
      this.globalData.PIbigScreen = true
    }
  },
  // 初始化token、deviceId、refreshToken
  initCode() {
    let guestInfo = wx.getStorageSync('guestInfo');
    let userInfo = wx.getStorageSync('userInfo');
    let authInfo = wx.getStorageSync('authInfo');
    if (authInfo){
      this.authInfo = authInfo;
    }
    if (userInfo){
      this.userInfo = userInfo;
      this.guestInfo = guestInfo;
      return;
    }
    if (guestInfo){
      this.guestInfo = guestInfo;
      return;
    }

    const token = wx.getStorageSync('token')
    if (token) return false
    let deviceInfo = {
      phoneDeviceCode: this.uuid()
    }
    wx.getSystemInfo({
      success: async (res) => {
        deviceInfo.phoneModel = res.system
        deviceInfo.sysVersion = res.version
        let initData = await init(deviceInfo)
        wx.setStorageSync('deviceId', initData.deviceId)
        wx.setStorageSync('refreshToken', initData.refreshToken)
        wx.setStorageSync('token', initData.token)
      }
    })
  },
  checkStatus(){
    if(!this.userInfo.token){
      return
    }
    checkStatus({}).then(res => {
      // 若code为0且changeFlag为true，更新token和refreshToken
      if (res.changeFlag){
        this.userInfo.token = res.token
        this.userInfo.refreshToken = res.refreshToken
        wx.setStorageSync('token', res.token)
        wx.setStorageSync('refreshToken', res.refreshToken)
      }

      this.tokenStatus = 0
      wx.setStorageSync('userInfo', this.userInfo)
    }).catch(err => {

    })
  },
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  },
  /**
   * 记录日志
   */
  log(...text){
    for(let e of text){
      if(typeof e == 'object'){
        try{
          if(e===null){
            this.logText += 'null'
          } else if(e.stack){
            this.logText += e.stack
          } else{
            this.logText += JSON.stringify(e)
          }
        }catch(err){
          this.logText += err.stack
        }
      } else {
        this.logText += e
      }
      this.logText += '\n'
    }
    this.logText += '########################\n'
  },
  // 获取颜色主题
  getTheme: function () {
    if (wx.canIUse("getColorStyle")) {
      wx.getColorStyle({
        success: (res) => {
          this.sysInfo.colorStyle = res.colorStyle
          this.sysInfo.backgroundColor = res.backgroundColor
          this.globalData.themeLoaded = true
          // this.initTabbar()
        },
        fail: (res) => {
          this.log('配色加载失败')
          this.sysInfo.backgroundColor = this.sysInfo.defaultBgColor
          this.globalData.themeLoaded = true
          // this.initTabbar()
        }
      })
    } else{
      this.sysInfo.backgroundColor = this.sysInfo.defaultBgColor
      this.globalData.themeLoaded = true
      // this.initTabbar()
    }
    if(wx.canIUse('onColorStyleChange')){
      wx.onColorStyleChange((res) => {
        this.sysInfo.colorStyle = res.colorStyle
        this.sysInfo.backgroundColor = res.backgroundColor
        wx.setTabBarStyle({
          color: res.colorStyle == 'dark'?'#FFFFFF':'#c4c4c4'
        })
      })
    }
  },
  // 设置页面配色
  setTheme(page) {
    if (this.globalData.themeLoaded) {
      page.setData({
        colorStyle: this.sysInfo.colorStyle,
        backgroundColor: this.sysInfo.backgroundColor
      })
    } else {
      this.watch(page, 'themeLoaded', val => {
        if (val) {
          page.setData({
            colorStyle: this.sysInfo.colorStyle,
            backgroundColor: this.sysInfo.backgroundColor
          })
        }
      })
    }
    if(wx.canIUse('onColorStyleChange')){
      wx.onColorStyleChange((res) => {
        this.sysInfo.colorStyle = res.colorStyle
        this.sysInfo.backgroundColor = res.backgroundColor
        page.setData({
          colorStyle: this.sysInfo.colorStyle,
          backgroundColor: this.sysInfo.backgroundColor
        })
      })
    }
  },
  
})