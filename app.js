import btnConfig from './utils/pageOtpions/pageOtpions'
import utils from './utils/util'
import {encrypt} from './utils/xmSign/utils';
import { data, getVipMedia,getMedia } from './developerHandle/playInfo'
require('./utils/minixs')
App({
  globalData: {
    albumLength:0,
    isBmw:false,
    canUseImgCompress: false,
    imgCompresDomain: "",
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
    version: '7.0.49',
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
    abumInfoId:'',
    isVip:false
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
    this.log('app---------onLaunch---版本号:',this.globalData.version)
    this.globalData.isVip = wx.getStorageSync('USERINFO').is_vip?wx.getStorageSync('USERINFO').is_vip:false
    //区分平台
    this.isBMW()
     this.goAuthGetToken()
    // 获取小程序颜色主题
    this.getTheme()
    //图片压缩
    this.initImgPress()
    // 判断playInfo页面样式，因为这里最快执行所以放在这
    this.setStyle()
    this.audioManager = wx.getBackgroundAudioManager()
   
    
    // 判断横竖屏
    if (wx.getSystemInfoSync().windowWidth > wx.getSystemInfoSync().windowHeight) {
      this.globalData.screen = 'h'
    } else {
      this.globalData.screen = 'v'
    }
    // 关于音乐播放的
    var that = this;
    // utils.EventListener(that)
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
    console.log('app11111111111111111111111:')
    if (wx.canIUse('getPlayInfoSync')) {
      let res = wx.getPlayInfoSync()
      console.log('app----getPlayInfoSync-----res:',  res)
        if(res.playList && res.playList.length > 0 && res.playState.curIndex>-1){
          res.playList.forEach(item => {
            item.customize = JSON.parse(item.options)
            item.albumId = item.customize.albumId
            item.id = item.customize.id
            item.dt = item.customize.dt
            item.mediaAuthor = item.customize.mediaAuthor
            item.authorId = item.customize.authorId
            item.albumName = item.customize.albumName
          });
          console.log('-----------2:',res.playList)
          let panelSong = res.playList[res.playState.curIndex]
          wx.setStorageSync('songInfo', panelSong)
          wx.setStorageSync('canplay', res.playList)
          wx.setStorageSync('allList', res.playList)
          wx.setStorageSync('nativeList', res.playList)

          let playing = res.playState.status == 1 ? true : false
          wx.setStorageSync('playing', playing)
          let  time = res.playState.currentPosition / res.playState.duration * 100
          let isCollect = wx.getStorageSync('ALBUMISCOLLECT')
          console.log('-----------songInfo:',panelSong)
          console.log('-----------percent:',time)
          console.log('-----------playing:',playing)
          console.log('-----------existed:',isCollect)
          that.globalData.songInfo = panelSong
          that.globalData.playing = playing
          that.globalData.percent = time
          that.globalData.playing = playing
          that.globalData.currentPosition = res.playState.currentPosition
       
        }else{
          this.globalData.songInfo = ''
          wx.setStorageSync('songInfo', '')
        }
        if(that.globalData.playing){
          this.playing( that.globalData.currentPosition ,that)

        }
     
      }else{
        this.log('不支持app----getPlayInfoSync-----res')

      }
      // that.globalData.songInfo = wx.getStorageSync('songInfo')
       this.log('app-------------songInfo:',that.globalData.songInfo)
    
    
  

  },
  //判断是否bmw平台
  isBMW() {
    let sysInfo = wx.getSystemInfoSync();
    console.log('-----------------isbmw', sysInfo)
    if (sysInfo.brand == "BMW") {
      this.globalData.isBmw = true
    
    } else {
      this.globalData.isBmw = false

    }
    console.log('isBmw-------', JSON.stringify(this.data))
  },
  
  /**
   * 初始化图片压缩
   */
  initImgPress() {
    // INFO('初始化压缩域名');
    // this.log('-----initImgPress----:')
    let canUseImgCompress = false;
    let imgCompresDomain = '';
    const that = this;
    
    if (wx.canIUse('getMossApiSync') || wx.canIUse('getMossApi')) {
      // this.log('----支持----initImgPress----:')

      const ret = wx.getMossApiSync({
        type: 'image-compress',
      });
      this.log('----支持----initImgPress----ret:',ret)
      if (typeof ret === null || ret === '' || ret === undefined) {
        this.log('111111111111111:')

        // 判断字符串是否为空，为空用getMossApi
        wx.getMossApi({
          type: 'image-compress',
          success(e) {
            this.log('222222222222-----initImgPress----success:',e)

            that.globalData.initImgCount = 0;
            console.log(`getMossApi${e.url}`);
            canUseImgCompress = true;
            imgCompresDomain = e.url;
            that.globalData.canUseImgCompress = canUseImgCompress;
            that.globalData.imgCompresDomain = imgCompresDomain;
          },
          fail(res) {
            this.log('-----initImgPress----fail:',e)

            console.log(`getMossApi执行失败------initImgCount=${that.globalData.initImgCount}}`);
            that.globalData.initImgTimer && clearTimeout(that.globalData.initImgTimer);
            if (that.globalData.initImgCount < 10) {
              that.globalData.initImgTimer = setTimeout(() => {
                that.globalData.initImgCount += 1;
                that.initImgPress();
              }, 30000);
            }
            Report.apiCallFailReport('getMossApi', JSON.stringify(res));
          },
          complete() {
            console.log('getMossApi执行完成');
          },
        });
      } else {
        // this.log('555555555555555:')

        // INFO(`getMossApiSync${ret}`);
        canUseImgCompress = true;
        imgCompresDomain = ret;
        this.globalData.canUseImgCompress = canUseImgCompress;
        this.globalData.imgCompresDomain = imgCompresDomain;
        // this.log('initImgPress-----555----:',this.globalData.canUseImgCompress)
        // this.log('initImgPress-----5555----:',this.globalData.imgCompresDomain)
      }
    }else{
    // this.log('-不支持----initImgPress----:')

    }
  

  },
/**
   * 压缩图片
   */
  impressImg(imgUrl, width, height) {
    // this.log('app----impressImg:',imgUrl)
    // this.log('app----impressImg---width:',width)
    // this.log('app----impressImg---height:',height)
   
    let impressImg = imgUrl;
    // this.log('impressImg----6----:',this.globalData.canUseImgCompress)
    // this.log('impressImg-----6----:',this.globalData.imgCompresDomain)
    const  canUseImgCompress  = this.globalData.canUseImgCompress;
    const  imgCompresDomain  = this.globalData.imgCompresDomain;
    if(this.globalData.isBmw){
      // console.log('宝马平台压缩:')
      //是宝马平台就压缩
      if (canUseImgCompress) {
        // 可以使用压缩服务
        if (imgCompresDomain.length > 0) {
          // 压缩域名获取成功
          const encodeImgUrl = encodeURIComponent(imgUrl);
          impressImg = `${imgCompresDomain}&w=${width}&h=${height}&url=${encodeImgUrl}`;
          //  DEBUG(`压缩图片${impressImg}`);
        } else {
          // 压缩域名获取失败
          impressImg = '';
          // ERROR(`${imgCompresDomain}压缩域名获取失败`);
          this.initImgPress();
        }
      } else {
        // 不可以使用压缩服务，显示默认图
        impressImg = imgUrl;
        // this.log('不支持图片压缩:')
        // ERROR(`${canUseImgCompress}不支持压缩服务`);
      }
    }else{
      // console.log('不是宝马平台不压缩:')
      impressImg = imgUrl;
    }



  //  console.log('图片压缩:',impressImg)
    return impressImg;
  },

  
  cutplay: async function (that, type, cutFlag) {
    console.log('-=-=-=--=that:',that)
    console.log('-=-=-=--=type:',type)
    console.log('-=-=-=--=cutFlag:',cutFlag)

    that.setData({percent: 0})
    console.log('1111111111111111111')

    // 判断循环模式
    let allList = wx.getStorageSync('nativeList')
    // 根据循环模式设置数组
    let loopType = wx.getStorageSync('loopType') || 'listLoop'
    console.log('2222222222')

    // 歌曲列表 wx.getStorageSync('allList')
    allList =wx.getStorageSync('allList')
    console.log('allList:',allList)

    // 当前歌曲的索引
    console.log('3333333322223333',this.globalData.songInfo)
    console.log('111111111111111111122222',wx.getStorageSync('songInfo'))

    let no = allList.findIndex(n => (n.id) == (wx.getStorageSync('songInfo').id))
    console.log('333333333333',no)

    let index = this.setIndex(type, no, allList)
    //歌曲切换 停止当前音乐
    this.globalData.playing = false;
    console.log('4444444444')

    let song = allList[index] || allList[0]
    console.log('allList---no----index-----song:',allList, no,index,song)
    // wx.pauseBackgroundAudio();
    // 下一首是vip的情况
    let isfree = song.feeType
    let isvipfree = song.isVipFree
    let isPaid = song.isPaid 
    let authored = song.isAuthorized 
    let mdeiasrc = song.src
    console.log('vip',this.globalData.isVip)
    // !app.globalData.isVip && !isfree && isPaid &&  !item.src || app.globalData.isVip && !isfree && !authored && !isvipfree && !item.src

    if(!this.globalData.isVip && !isfree && isPaid &&  !mdeiasrc || this.globalData.isVip &&!isfree && !authored && !isvipfree&&  !mdeiasrc){
      wx.showToast({
        title: '暂无权限收听,请从喜马拉雅APP购买',
        icon: 'none'
      })


      console.log('---------------------是否免费')
      this.stopmusic()
      return 
    }


    that.setData({
      currentId: Number(song.id),       // 当前播放的歌曲id
      currentIndex: index
    })
    // 获取歌曲的url
    let params = {
      mediaId: song.id,
      contentType: 'story',
      isVipFree:song.isVipFree,
      isfree:song.feeType,
      isPaid:song.isPaid,
      authored:song.isAuthorized,
      mdeiasrc:song.src
    }
    

    console.log('----------------------',params)


    if(!this.globalData.isVip && !params.isfree && params.isPaid && !mdeiasrc|| this.globalData.isVip && !params.isfree && !params.authored && !params.isvipfree && !mdeiasrc){  //收费曲目
  wx.showModal({
    title: '无权限',
    content: '暂无权限收听,请从喜马拉雅APP购买',
    success (res) {
      if (res.confirm) {
        console.log('用户点击确定')
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
    }else if(params.isVipFree && params.isfree ){
      await getMedia(params, that)
     
    }else{
      if(params.mdeiasrc){
        await getMedia(params, that)
      }else{
        await getVipMedia(params, that)

      }
    }
    
    setTimeout(() => {
      loopType === 'singleLoop' ? this.playing(0, that) : this.playing(that)
      this.globalData.playBeginAt = new Date().getTime();
    }, 200)
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
    console.log('stopmusic--------')
    wx.pauseBackgroundAudio();
    this.globalData.playBeginAt = new Date().getTime();
    this.upLoadPlayinfo()
  },
  // 根据歌曲url播放歌曲
  playing: function (seek, that) {
    // wx.setStorageSync('playing', true)

    if (that == undefined) {
      that = seek
    }
    const songInfo = wx.getStorageSync('songInfo')
    console.log('playing--------Song', songInfo)
    // 如果是车载情况
    console.log('percent--------------', this.globalData.percent)
     utils.initAudioManager(this, that, songInfo)
    this.carHandle(songInfo, seek)
    this.globalData.playBeginAt = new Date().getTime();
     this.upLoadPlayinfo()
  },
 

  // 车载情况下的播放
  carHandle(songInfo, seek) {
     console.log('------carHandle--songInfo.src:',songInfo)

    if(songInfo.src){
      this.audioManager.src = songInfo.src
      this.audioManager.title = songInfo.title
      this.audioManager.coverImgUrl = songInfo.coverImgUrl
      if (seek != undefined && typeof (seek) === 'number') {
        // wx.seekBackgroundAudio({
        //   position: seek
        // })
      }
     }else{
  console.log('收费曲目')
     //收费曲目
     wx.showModal({
      title: '无权限',
      content: '暂无权限收听,请从喜马拉雅APP购买',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
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



    // 获得token
  goAuthGetToken() {
   var that = this
     return new Promise(function (resolve, reject) {
      var isLogin = wx.getStorageSync('USERINFO')
      var Token = wx.getStorageSync('TOKEN')
      var currentTime = new Date().getTime()
      //  console.log('-------isLogin',isLogin)
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
          console.log('token没有过期:',Token)
          resolve(Token)
          // that.getToken(resolve, reject)
        } else {
          console.log('已登录token过期重新获取')
          that.getToken(resolve, reject)
        }
      }else{
        // if (currentTime < Token.deadline  ) {
        //   wx.setStorageSync('TOKEN', Token)
        //    console.log('token:',Token)
        //   resolve(Token)
        // } else {
          console.log('没有登录重新获取token')
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
          
           console.log("access_token----success--", res)   
          res.data.deadline = +new Date() + (res.data.expires_in * 1000);
          // that.log("失效时间", res.data.deadline)   
          // canUseToken = res.data
          wx.setStorageSync('TOKEN', res.data)
          resolve(res.data)
          

        },
        fail: err => {
          console.log('err:',err)
          reject(err.data)
          utils.registerNetworkListener()

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
     console.log('上传-----------------------songInfo:',wx.getStorageSync('songInfo'))
    if(!wx.getStorageSync('songInfo').id || wx.getStorageSync('songInfo').id == undefined){
      return
    }
    const playRecords = {
       track_id:wx.getStorageSync('songInfo').id,
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