// import { init, checkStatus } from './utils/api'
import btnConfig from './utils/pageOtpions/pageOtpions'
import utils from './utils/util'
import {encrypt} from './utils/xmSign/utils';
import { data, getVipMedia,getMedia } from './developerHandle/playInfo'
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
    userId: '',
    isTaiUserChange: false,
    token: '',
    // 版本号
    version: '1.0.0',
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
    PIbigScreen: null,
    startTime:'00:00',
    playBeginAt:'',
    abumInfoId:''
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
    refreshToken: '',
    isLogin:false,
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
  version: '',
  // 日志文本
  logText: '',
  // 日志计时器
  logTimer: null,
  audioManager: null,
  currentIndex: null,
  onLaunch: function () {
    this.log('app---------------onLaunch:')
    //  this.isTaiAccountChange()
    // this.goAuthGetToken()
    // 获取小程序颜色主题
    this.getTheme()
    //图片压缩
    this.initImgPress()
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
      console.log('res-------------:',  res)
      if(res.playState){
        let playing = res.playState.status == 1 ? true : false
        wx.setStorageSync('playing', playing)
      }
    
    }

  },

  

  isTaiAccountChange(){
    
    // this.log("function-----------------appId--:",this.globalData.appId)
    // this.log("function-----------------onTaiAccountStatusChange--:",this.globalData.isTaiUserChange)
    // if (wx.canIUse('onTaiAccountStatusChange')) {
    //   wx.onTaiAccountStatusChange(function (res) {
    //     this.log("---onTaiAccountStatusChange--", res)
    //     this.globalData.isTaiUserChange = res.isLoginUser
      
    //   })
    // } else {
    //   this.log('不支持-----------------onTaiAccountStatusChange')

    // }
    // this.log("-----isTaiAccountChange--:",this.globalData.isTaiUserChange)


  },
// 图片压缩 - 初始化
  initImgPress: function () {
      let canUseImgCompress = false;
      let imgCompresDomain = "";
      let that = this;
      if (wx.canIUse("getMossApiSync") && wx.canIUse("getMossApi")) {
        const ret = wx.getMossApiSync({
          type: "image-compress",
        });
        if (typeof ret == null || ret == "" || ret == "undefined") {
          //判断字符串是否为空，为空用getMossApi
          wx.getMossApi({
            type: "image-compress",
            success(e) {
              // this.log("getMossApi" + e.url);
              canUseImgCompress = true;
              imgCompresDomain = e.url;
              that.globalData.canUseImgCompress = canUseImgCompress;
              that.globalData.imgCompresDomain = imgCompresDomain;
            },
            fail() {
              // this.log("getMossApi执行失败");
              that.globalData.initImgTimer && clearTimeout(that.globalData.initImgTimer);
              that.globalData.initImgTimer = setTimeout(() => {
                that.initImgPress();
              }, 30000);
            },
            complete() {
              // this.log("getMossApi执行完成");
            },
          });
        } else {
          // this.log("getMossApiSync" + ret);
          canUseImgCompress = true;
          imgCompresDomain = ret;
        }
      }
      this.globalData.canUseImgCompress = canUseImgCompress;
      this.globalData.imgCompresDomain = imgCompresDomain;
    },
    // 图片压缩 - 执行函数
    impressImg(imgUrl, w, h) {
   
      let impressImg = imgUrl;
      const canUseImgCompress = this.globalData.canUseImgCompress;
      const imgCompresDomain = this.globalData.imgCompresDomain;
      if (canUseImgCompress) {
        //可以使用压缩服务
        if (imgCompresDomain.length > 0) {
          //压缩域名获取成功
          const encodeImgUrl = encodeURIComponent(imgUrl);
          impressImg = `${imgCompresDomain}&w=${w ? w : 200}&h=${h ? h : 200}&url=${encodeImgUrl}`;
        } else {
          //压缩域名获取失败
          impressImg = "";
          // this.log(imgCompresDomain + "压缩域名获取失败");
          this.initImgPress();
        }
      } else {
        //不可以使用压缩服务，显示默认图
        impressImg = imgUrl;
      }
  // console.log('压缩图片:',impressImg)
  return impressImg
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
      contentType: 'story',
      isVipFree:song.isVipFree
    }
    console.log(params)
    if(params.isVipFree){
      await getVipMedia(params, that)
    }else{
      await getMedia(params, that)
    }
    
    loopType === 'singleLoop' ? this.playing(0, that) : this.playing(that)
    this.globalData.playBeginAt = new Date().getTime();
    // this.upLoadPlayinfo()
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
      loopList = list
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
    this.globalData.playBeginAt = new Date().getTime();
    this.upLoadPlayinfo()
  },
  // 根据歌曲url播放歌曲
  playing: function (seek, that) {
    if (that == undefined) {
      that = seek
    }
    const songInfo = wx.getStorageSync('songInfo')
     console.log('playingSong', songInfo)
    // 如果是车载情况
    utils.initAudioManager(that, songInfo)
    this.carHandle(songInfo, seek)
    // let app = this
    
    this.globalData.playBeginAt = new Date().getTime();
     this.upLoadPlayinfo()
  },
  // 车载情况下的播放
  carHandle(songInfo, seek) {
    // console.log('carHandle--songInfo.src:',songInfo)
    if(songInfo.src){
      this.audioManager.src = songInfo.src
      this.audioManager.title = songInfo.title
      this.audioManager.coverImgUrl = songInfo.coverImgUrl
      if (seek != undefined && typeof (seek) === 'number') {
        wx.seekBackgroundAudio({
          position: seek
        })
      }
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
   var that = this
     return new Promise(function (resolve, reject) {
      var isLogin = wx.getStorageSync('USERINFO')
      var Token = wx.getStorageSync('TOKEN')
      var currentTime = new Date().getTime()
      // console.log('-------isLogin',isLogin)
      // console.log('-------token',Token)
      // console.log('-------currentTime',currentTime)
      // console.log('-------endTime',Token.deadline)
      if(!Token.access_token  || Token.access_token == null){
        that.getToken(resolve, reject)
      }

      if(isLogin){
        // console.log('-------')
        // console.log('---==----',(currentTime < Token.deadline)) 
        // console.log('---++++----',Token.isLogin)
        if (currentTime < Token.deadline && Token.isLogin ) {
          wx.setStorageSync('TOKEN', Token)
          //  console.log('token:',Token)
          resolve(Token)
        } else {
          // console.log('----====---')
          that.getToken(resolve, reject)
        }
      }else{
        // if (currentTime < Token.deadline  ) {
        //   wx.setStorageSync('TOKEN', Token)
        //    console.log('token:',Token)
        //   resolve(Token)
        // } else {
        //    console.log('----====---')
          that.getToken(resolve, reject)
        // }
      }

     })

   
      
   },
    getToken(resolve, reject){
      var that = this

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
      //  console.log('sig:',sig)
      //  console.log('params:',params)
       let header ={
        'xm-sign':encrypt(Date.now()),
        'content-type': 'application/x-www-form-urlencoded',
       }
      //  console.log('header:',header)
      wx.request({
        url:utils.baseUrl + 'oauth2/secure_access_token',
      method:"POST",
      data:params,
       header:header,
        success: res => {
          
          // console.log("access_token----success--", res)   
          res.data.deadline = +new Date() + (res.data.expires_in * 1000);
          that.log("失效时间", res.data.deadline)   
          // canUseToken = res.data
          wx.setStorageSync('TOKEN', res.data)
          resolve(res.data)
          

        },
        fail: err => {
          reject(err.data)
        }
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
            console.logText += 'null'
          } else if(e.stack){
            console.logText += e.stack
          } else{
            console.logText += JSON.stringify(e)
          }
        }catch(err){
          console.logText += err.stack
        }
      } else {
        console.logText += e
      }
      console.logText += '\n'
    }
    console.logText += '########################\n'
  },
  //全局上传播放行为
  upLoadPlayinfo:function(){
    // console.log('-----------------------songInfo:',this.globalData.songInfo)
    if(!this.globalData.songInfo.id || this.globalData.songInfo.id == undefined){
      return
    }
    const playRecords = {
       track_id:this.globalData.songInfo.id,
      played_secs: ~~this.globalData.currentPosition || ~~this.globalData.startTime,
      started_at:this.globalData.playBeginAt,
      ended_at:new Date().getTime(),
      play_type:0,
    } 
      // console.log('播放行为数据:',playRecords)
      let param = {
        track_records:JSON.stringify([playRecords])
      }
      utils.PLAYRECORDPOST(param,utils.upLoadPlayInfo,res=>{
        // console.log('上传播放信息:',res)
        if(res.statusCode == 200){
         
        }else{
  
        }
      } )


   

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
          console.log('配色加载失败')
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
   * 记录日志。
   */
  log(str, object) {
    // return
    this.logText += str + '\n'
    if (object) {
      this.logText += JSON.stringify(object) + '\n'
      // console.log(str + JSON.stringify(object) + '\n')
    }
  },
})