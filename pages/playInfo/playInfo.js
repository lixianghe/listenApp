const app = getApp()
import tool from '../../utils/util'
import btnConfig from '../../utils/pageOtpions/pageOtpions'
// const { getData } = require('../../utils/https')
import utils from '../../utils/util'

Page({
  mixins: [require('../../developerHandle/playInfo')],
  data: {
    isVip:false,
    currentIndex:0,
    existed: false,
    songInfo: {},
    playing: false,
    drapType: false,
    percent: 0,
    drapPercent: 0,
    playtime: '00:00',
    showList: false,
    currentId: null,
    // 开发者不传默认的按钮
    defaultBtns: [{
      name: 'toggle', // 播放/暂停
      img: {
        stopUrl: '/images/stop2.png', // 播放状态的图标
        playUrl: '/images/play2.png' // 暂停状态的图标
      }
    }, ],
    btnCurrent: null,
    noTransform: '',
    typelist: ['listLoop', 'singleLoop', 'shufflePlayback'],
    typeName: {
      "listLoop": '循环播放',
      "singleLoop": '单曲循环',
      "shufflePlayback": '随机播放',
    },
    loopType: 'listLoop', // 默认列表循环
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
    mainColor: btnConfig.colorOptions.mainColor,
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    start:''
  },
  // 播放器实例
  audioManager: null,
  onReady: function () {
    this.animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear'
    })
  },
  onLoad(options) {
    const playing = wx.getStorageSync('playing')
    if (!playing) {
      this.setData({
        playtime: app.globalData.playtime,
        percent: app.globalData.percent || 0,
      })
    }
    const that = this
    utils.EventListener(app, that)
    console.log('playinf-----options:',options)
    // 监听歌曲播放状态，比如进度，时间
    tool.playAlrc(that, app);
    that.queryProcessBarWidth()
    // 根据分辨率设置样式
    that.setStyle()
    // 获取歌曲列表
    const canplay = wx.getStorageSync('allList')
    console.log('canplay:',canplay.length)
    that.data.start = options.start
    that.data.currentIndex = options.currentNub
    console.log('-------------start:',that.data.start)
    for (let i = 0; i < canplay.length; i++) {
      canplay[i].num = parseInt(that.data.start)+i+1
    }
    wx.setStorageSync('allList', canplay)
    // console.log('-------------canplay:',canplay)

    const songInfo = app.globalData.songInfo ? app.globalData.songInfo : wx.getStorageSync('songInfo')
    // utils.initAudioManager(that,songInfo)
    console.log('playInfo-------------------onload:',options)
    if (songInfo.feeType == true && options.sameSong != 'true' && options.noPlay != 'true') {
      that.data.isVip = true
      let param = {}
      utils.PLAYINFOGET(param, utils.getMediaInfo + songInfo.id + '/play-info', res => {
        console.log('res:',res)
        if (res.data && res.statusCode == 200) {
        
          app.globalData.songInfo.src = res.data.play_24_aac.url

          console.log('app.globalData.songInfo:',app.globalData.songInfo)
          that.setData({
            songInfo: app.globalData.songInfo,
            canplay: canplay,
            existed: options.collect == 'false' ? false : true,
            noPlay: options.noPlay || null,
            abumInfoName: options.abumInfoName || null,
            playing: wx.getStorageSync('playing')
          })
          // let song = wx.getStorageSync('songInfo')
          wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
          // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
          const abumInfoName = wx.getStorageSync('abumInfoName')
          wx.setStorageSync('abumInfoName', options.abumInfoName)
          if (options.noPlay !== 'true' || abumInfoName !== options.abumInfoName) wx.setStorageSync('nativeList', canplay)
          if (options.noPlay !== 'true') 
          wx.showLoading({
            title: '加载中...',
            mask: true
          })
           console.log('bannees-vip---音频----300---:')
           wx.setStorageSync('songInfo', songInfo)
          //  wx.setStorage({
          //   key: 'songInfo',
          //   data: songInfo
          // })
          
          console.log('option----------------', options)
          if (options.noPlay != 'true') app.playing(that)
          wx.hideLoading()
        

        } else {

        }
      })
    } else {
      console.log('canplay:',canplay)
      that.setData({
        songInfo: songInfo,
         canplay: canplay,
        existed: options.collect == 'false' ? false : true,
        noPlay: options.noPlay || null,
        abumInfoName: options.abumInfoName || null,
        playing: wx.getStorageSync('playing')
      })
      let song = wx.getStorageSync('songInfo')
        wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
      // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
      const abumInfoName = wx.getStorageSync('abumInfoName')
      wx.setStorageSync('abumInfoName', that.data.abumInfoName)
      if (options.noPlay !== 'true' ||  abumInfoName !== options.abumInfoName) wx.setStorageSync('nativeList', canplay)
      if (options.noPlay !== 'true') wx.showLoading({ title: '加载中...', mask: true })
      wx.setStorageSync('songInfo', songInfo)
      console.log('option----------------', options)
      if (options.noPlay != 'true') app.playing(that)
      wx.hideLoading()

    }

    app.globalData.abumInfoId = that.data.songInfo.albumId

  },



  playMedia(songInfo) {
    const that = this
    if (songInfo.feeType == true) {
      that.data.isVip = true
      let param = {}
      utils.PLAYINFOGET(param, utils.getMediaInfo + songInfo.id + '/play-info', res => {
        console.log('res:',res)
        if (res.data && res.statusCode == 200) {
        
          app.globalData.songInfo.src = res.data.play_24_aac.url

          that.setData({
            songInfo: app.globalData.songInfo
          })
          wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
          // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首

          wx.showLoading({
            title: '加载中...',
            mask: true
          })
           console.log('bannees-vip---音频----300---:')
          wx.setStorageSync('songInfo', songInfo)
          app.playing(that)
          wx.hideLoading()
        

        } else {

        }
      })
    } else {
      that.setData({
        songInfo: songInfo,
      })
      wx.setStorage({
        key: 'songInfo',
        data: songInfo
      })
        wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
      app.playing(that)
      wx.hideLoading()

    }
  },




  vipMediaPlay(mediaId){
    let param = {}
    utils.PLAYINFOGET(param, utils.getMediaInfo + mediaId + '/play-info', res => {
      console.log('vip音频数据:',res)
      if (res.data && res.statusCode == 200) {
        app.globalData.songInfo.src = res.data.play_24_aac.url
        console.log('app.globalData.songInfo.src:',app.globalData.songInfo.src)
        this.setData({
          songInfo: app.globalData.songInfo,
          canplay: this.data.canplay,
          existed: this.data.existed,
          noPlay: this.data.noPlay ,
          abumInfoName: this.data.abumInfoName ,
          playing: wx.getStorageSync('playing')
        })
        let song = wx.getStorageSync('songInfo')
        wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
        // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
         wx.setStorageSync('abumInfoName', this.data.abumInfoName)
        // if (options.noPlay !== 'true' || abumInfoName !== options.abumInfoName) wx.setStorageSync('nativeList', canplay)
        // if (options.noPlay !== 'true') 
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
         console.log('bannees-vip---音频----300---:')
        //  wx.setStorage({
        //   key: 'songInfo',
        //   data: this.data.songInfo
        // })
        wx.setStorageSync('songInfo', this.data.songInfo)
        
        app.playing(this)
      

      } else {

      }
    })
  },
 
  onShow: function () {


  },
 
  play() {
    let that = this
    // 从统一播放界面切回来，根据playing判断播放状态options.noPlay为true代表从minibar过来的
    const playing = wx.getStorageSync('playing')
    if (playing || this.data.noPlay !== 'true') app.playing(that)

  },
  albumClick(e) {
    // console.log('专辑点击:',e)
    let id = e.currentTarget.dataset.song.albumId
    // console.log('专辑id:',id)
    const src = e.currentTarget.dataset.song.src
    const title = e.currentTarget.dataset.song.title
    wx.setStorageSync('img', src)
    wx.navigateBack({
      delta: 0,
    })
    // wx.navigateTo({
    //   url: '../abumInfo/abumInfo?id=' + id + '&title=' + title + '&routeType=album'
    // })


  },
  authorClick(e) {
    // console.log('作者点击:',e)
    let id = e.currentTarget.dataset.song.authorId
    // console.log('作者id:',id)

    wx.navigateTo({
      url: '/pages/author/author?authorId=' + id,
    })

  },
  btnsPlay(e) {
    console.log('e:',e)
    const type = e.currentTarget.dataset.name
    console.log('type:',type)
    switch (type) {
      case 'pre':

        console.log('上一首')
        this.pre()

        break;
      case 'toggle':
        this.toggle()

        break;
      case 'next':

        console.log('下一首')
        this.next()


        break;
      case 'like':
        if (wx.getStorageSync('USERINFO')) {
          if (this.data.existed) {
            console.log('取消收藏')
            this.cancelCollectAlbum()
          } else {
            console.log('添加收藏')
            this.collectAlbum()
          }
        } else {
          wx.showToast({
            title: '请登录后操作',
            icon: 'none'
          })
          // wx.switchTab({
          //   url: 'pages/personalCenter/personalCenter'
          // })
        }
        break;
      case 'more':
        this.more()
        break;

      default:
        break;
    }




  },
  //收藏专辑
  collectAlbum() {
    let param = {
      id: app.globalData.songInfo.albumId
    }
    utils.ALBUMSUBCRIBEPOST(param, utils.albumCollect, res => {
      console.log('收藏专辑:', res)
      if (res.data.status == 200 && res.data.errmsg == 'ok') {
        this.setData({
          existed: true
        })
        if (wx.getStorageSync('songInfo').albumId == app.globalData.abumInfoId) {
          wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
        }

        wx.showToast({
          title: '专辑订阅成功',
          icon: 'none'
        })

      } else {
        wx.showToast({
          title: '订阅失败，请重新登录',
          icon:'none'
        })
      }
    })

  },
  //取消收藏专辑
  cancelCollectAlbum() {
    let param = {
      id: app.globalData.songInfo.albumId
    }

    utils.ALBUMSUBCRIBEPOST(param, utils.cancelAlbumCollect, res => {
      console.log('取消收藏专辑:', res)
      if (res.data.status == 200 && res.data.errmsg == 'ok') {
        this.setData({
          existed: false
        })
        if (wx.getStorageSync('songInfo').albumId == app.globalData.abumInfoId) {
          wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
        }

        wx.showToast({
          title: '专辑取消订阅成功',
          icon: 'none'
        })

      } else {

      }
    })

  },

  //收藏音频
  collectAudio() {
    let param = {
      id: wx.getStorageSync('songInfo').id
    }
    utils.PLAYHISTORYGET(param, utils.audioCollect, res => {
      console.log('收藏音频:', res)
      if (res.data.status == 200 && res.data.errmsg == 'ok') {
        this.setData({
          existed: true
        })
        wx.showToast({
          title: '音频订阅成功',
          icon: 'none'
        })

      } else {

      }
    })
  },
  //取消音频收藏
  cancelAudioCollect() {
    let param = {
      id: wx.getStorageSync('songInfo').id
    }
    utils.PLAYHISTORYGET(param, utils.audioCancelCollect, res => {
      console.log('取消音频收藏:', res)
      if (res.data.status == 200 && res.data.errmsg == 'ok') {
        this.setData({
          existed: false
        })
        wx.showToast({
          title: '音频取消订阅成功',
          icon: 'none'
        })

      } else {

      }
    })
  },
  // 上一首
  pre() {
    
    const that = this
    if(that.data.isVip){
      console.log('currentIndex:',this.data.currentIndex)
      if(this.data.currentIndex == 0){
        console.log('第一首了')

      }else{
        this.data.currentIndex--
        let mediaId = this.data.canplay[this.data.currentIndex].id
        app.globalData.songInfo = this.data.canplay[this.data.currentIndex]

        this.vipMediaPlay(mediaId)
      }

    }else{
      app.cutplay(that, -1)
    }

  },
  // 下一首
  next() {
   
    const that = this
    console.log('下一首:',that)
    if(that.data.isVip){
      console.log('currentIndex:',this.data.currentIndex)
      if(this.data.currentIndex == 14){
      console.log('最后一首了')

      }else{
        this.data.currentIndex++
        let mediaId = this.data.canplay[this.data.currentIndex].id
        app.globalData.songInfo = this.data.canplay[this.data.currentIndex]
        // console.log('nextfee--------------', app.globalData.songInfo)
        if (!app.globalData.songInfo.feeType && app.globalData.songInfo.isVipFree) {
          wx.showToast({
            title: '暂无权限收听,请从喜马拉雅APP购买',
            icon: 'none'
          })
          return false
        }
        this.vipMediaPlay(mediaId)




        
        
      }

    }else{
      app.cutplay(that, 1)
    }
   

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
    wx.showToast({
      title: this.data.typeName[type],
      icon: 'none'
    })
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
    app.globalData.playBeginAt = new Date().getTime();
    app.upLoadPlayinfo()
  },
  // 播放列表
  more() {
    setTimeout(() => {
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
    // console.log('-=-=-=-=---=')
    let that = this
    const songInfo = e.currentTarget.dataset.song
    app.globalData.songInfo = songInfo
    this.playMedia(songInfo)
    that.setData({
      currentId: app.globalData.songInfo.id,
    })
    this.closeList()

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
      this.setData({
        isDrag: ''
      })
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
      } catch (err) {}
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
    setTimeout(() => {
      this.setData({
        btnCurrent: null
      })
    }, 150)
  },
  // ******按钮点击态处理********/

  // 根据分辨率判断显示哪种样式
  setStyle() {
    // 判断分辨率的比列
    const windowWidth = wx.getSystemInfoSync().screenWidth;
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
    query.select('.songList').boundingClientRect(rect => {
      let listHeight = rect.height;
      this.setData({
        scrolltop: index > 2 ? listHeight / this.data.canplay.length * (index - 2) : 0
      })
    }).exec();
  }
})