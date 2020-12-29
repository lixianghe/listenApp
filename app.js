// import { init, checkStatus } from './utils/api'
import btnConfig from './utils/pageOtpions/pageOtpions'
import utils from './utils/util'
import {encrypt} from './utils/xmSign/utils';
import { data, getMedia } from './developerHandle/playInfo'
require('./utils/minixs')
App({
  globalData: {
    appName: 'ximalayaxin',
    // 屏幕类型
    screen: '',
    mainColor: btnConfig.colorOptions.mainColor,
    // 登录相关
    openid: '',
    appId: '60023',
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
    this.goAuthGetToken()
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
    wx.setStorageSync('playing', false)
    // 测试getPlayInfoSync
    if (wx.canIUse('getPlayInfoSync')) {
      let res = wx.getPlayInfoSync()
      console.log('res-------------' + JSON.stringify(res))
      let playing = res.playState.status == 1 ? true : false
      wx.setStorageSync('playing', playing)
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
    loopType === 'singleLoop' ? this.playing(0, that) : this.playing(that)
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
  playing: function (seek, that) {
    if (that == undefined) {
      that = seek
    }
    const songInfo = this.globalData.songInfo
    // 如果是车载情况
    this.carHandle(songInfo, seek)
    let app = this
    utils.initAudioManager(app, that, songInfo)
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

    // 获得token
   goAuthGetToken() {
    var isLogin = wx.getStorageSync('USERINFO')
    var Token = wx.getStorageSync('TOKEN')
    var canUseToken
    if(isLogin){
      if (Token && (+new Date() < Token.deadline) && Token.isLogin) {
        canUseToken = token
      } else {
       //刷新token
       let param = {
        client_id: utils.APP_KEY,
        client_secret:utils.APP_SECRET,
        device_id: utils.getDeviceId(),
        grant_type:"refresh_token",
        refresh_token: wx.getStorageSync('TOKEN').access_token,
        redirect_uri: utils.baseUrl,
       }
       let sig = utils.calcuSig(param, utils.APP_SECRET);
       let params = {
        ...param,
          sig
       }
       console.log('sig:',sig)
       console.log('params:',params)
    
       let header ={
        'xm-sign':encrypt(Date.now()),
        'content-type': 'application/x-www-form-urlencoded',
       }
       console.log('header:',header)
    

       wx.request({
        url:utils.baseUrl + 'oauth2/refresh_token',
        method:"POST",
        data:params,
         header:header,
        success: function(res) {
          console.log("刷新access_token----success--", res)   
          res.data.deadline = +new Date() + (res.data.expires_in * 1000);
          console.log("失效时间", res.data.deadline)   
          canUseToken = res.data
          wx.setStorageSync('TOKEN', res.data)
        },
        fail: function(err) {
          console.log("刷新token---fail--",err)  
        },
      });
    
      }
  
    }else{
    console.log("APP_KEY--",  utils.APP_KEY)
    console.log("deviceid--",  utils.getDeviceId())
     console.log("nonce--",  utils.generateRandom())

   let param = {
    client_id: utils.APP_KEY,
    device_id: utils.getDeviceId(),
    grant_type: "client_credentials",
    nonce: utils.generateRandom(),
    timestamp: +new Date(),
   }
   let sig = utils.calcuSig(param, utils.APP_SECRET);
   let params = {
    ...param,
      sig
   }
   console.log('sig:',sig)
   console.log('params:',params)

   let header ={
    'xm-sign':encrypt(Date.now()),
    'content-type': 'application/x-www-form-urlencoded',
   }
   console.log('header:',header)

    wx.request({
      url:utils.baseUrl + 'oauth2/secure_access_token',
      method:"POST",
      data:params,
       header:header,
      success: function(res) {
        console.log("access_token----success--", res)   
        res.data.deadline = +new Date() + (res.data.expires_in * 1000);
        console.log("失效时间", res.data.deadline)   
        canUseToken = res.data
        wx.setStorageSync('TOKEN', res.data)
      },
      fail: function(err) {
        console.log("access_token---fail--",err)  
      },
    });
  
  }
  return canUseToken
      
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
  }
})