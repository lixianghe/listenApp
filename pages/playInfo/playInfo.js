const app = getApp()
import tool from '../../utils/util'
import btnConfig from '../../utils/pageOtpions/pageOtpions'
// const { getData } = require('../../utils/https')
import utils from '../../utils/util'

Page({
  mixins: [require('../../developerHandle/playInfo')],
  data: {
    pageSize: 15,
    currentIndex: 0,
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
    abumInfoName: '',
    mainColor: btnConfig.colorOptions.mainColor,
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    start: '',
    canplay: [],
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
    var that = this
    // 根据分辨率设置样式
    that.setStyle()
    console.log('playInfo-------------------onload:', options)
    if (options.type == 3) {
      //续播  
      console.log('--------续播-------')
      const canplay = wx.getStorageSync('allList')
      console.log('续播---canplay:', canplay)
      const songInfo = app.globalData.songInfo ? app.globalData.songInfo : wx.getStorageSync('songInfo')
      that.data.currentIndex = canplay.findIndex(item => item.id === songInfo.id)
      console.log('续播---songInfo:', songInfo)
      if (songInfo.feeType == true) {

        let param = {}
        utils.PLAYINFOGET(param, utils.getMediaInfo + songInfo.id + '/play-info', res => {
          // console.log('res:',res)
          if (res.data && res.statusCode == 200) {
            app.globalData.songInfo.src = res.data.play_24_aac.url
            app.log('app.globalData.songInfo:', app.globalData.songInfo)
            that.setData({
              songInfo: app.globalData.songInfo,
              canplay: canplay,
              existed: false,

              abumInfoName: app.globalData.songInfo.title,
              playing: tr
            })

            wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
            // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
            // const abumInfoName = wx.getStorageSync('abumInfoName')
            wx.setStorageSync('abumInfoName', that.data.abumInfoName)
            wx.setStorageSync('nativeList', canplay)
            app.globalData.songInfo = that.data.songInfo

            app.log('续播---------bannees-vip---音频----300---:')
            wx.setStorageSync('songInfo', that.data.songInfo)
            app.playing(that)


          } else {

          }

        })
      } else {
        console.log('canplay:', canplay)
        that.setData({
          songInfo: songInfo,
          canplay: canplay,
          existed: false,

          abumInfoName: app.globalData.songInfo.title,
          playing: true
        })

        wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
        // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
        wx.setStorageSync('abumInfoName', that.data.abumInfoName)
        wx.setStorageSync('nativeList', canplay)
        app.globalData.songInfo = that.data.songInfo
        wx.setStorageSync('songInfo', that.data.songInfo)
        app.playing(that)
      }
      app.globalData.abumInfoId = that.data.songInfo.albumId

    } else {
      //非续播------ 获取歌曲列表
      const canplay = wx.getStorageSync('allList')
      console.log('非续播----canplay:', canplay.length)
      that.data.start = options.start
      that.data.currentIndex = options.currentNub
      console.log('-------------start:', that.data.start)
      for (let i = 0; i < canplay.length; i++) {
        canplay[i].num = parseInt(that.data.start) + i + 1
      }
      wx.setStorageSync('allList', canplay)
      console.log('---canplay:', canplay)
      const songInfo = app.globalData.songInfo ? app.globalData.songInfo : wx.getStorageSync('songInfo')
      console.log('songInfo:', songInfo)
      console.log('isVip:', app.globalData.isVip)

      // !app.globalData.isVip && !isfree && isPaid || app.globalData.isVip &&!isfree && !authored && !isvipfree
      if (app.globalData.isVip && !songInfo.freeType && songInfo.isPaid && !songInfo.src|| !app.globalData.isVip && !songInfo.freeType && songInfo.isPaid && !songInfo.src|| app.globalData.isVip && !songInfo.freeType && !songInfo.isAuthorized && !songInfo.isVipFree&& !songInfo.src) {

        let param = {}
        utils.PLAYINFOGET(param, utils.getMediaInfo + songInfo.id + '/play-info', res => {
          // console.log('res:',res)
          if (res.data && res.statusCode == 200) {

            app.globalData.songInfo.src = res.data.play_24_aac.url

            // console.log('app.globalData.songInfo:',app.globalData.songInfo)
            that.setData({
              songInfo: app.globalData.songInfo,
              canplay: canplay,
              existed: options.collect == 'false' ? false : true,
              noPlay: options.noPlay || null,
              abumInfoName: options.abumInfoName || '',
              playing: wx.getStorageSync('playing')
            })

            wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
            // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
            const abumInfoName = wx.getStorageSync('abumInfoName')
            wx.setStorageSync('abumInfoName', options.abumInfoName)
            if (options.noPlay !== 'true' || abumInfoName !== options.abumInfoName) wx.setStorageSync('nativeList', canplay)
            if (options.noPlay !== 'true' && options.sameSong != 'true')
              wx.showLoading({
                title: '加载中...',
                mask: true
              })
            console.log('bannees-vip---音频----300---:')
            wx.setStorageSync('songInfo', that.data.songInfo)
            console.log('option----------------', wx,wx.getStorageSync('songInfo'))
            // if (options.noPlay != 'true') app.playing(that)
            app.playing(that)


          } else {

          }
        })
      } else {
        console.log('--------------+++++====canplay:', canplay)
        that.setData({
          songInfo: songInfo,
          canplay: canplay,
          existed: options.collect == 'false' ? false : true,
          noPlay: options.noPlay || null,
          abumInfoName: options.abumInfoName || '',
          playing: wx.getStorageSync('playing')
        })
        let song = wx.getStorageSync('songInfo')
        wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
        // 把abumInfoName存在缓存中，切歌的时候如果不是专辑就播放同一首
        const abumInfoName = wx.getStorageSync('abumInfoName')
        wx.setStorageSync('abumInfoName', that.data.abumInfoName)
        if (options.noPlay !== 'true' || abumInfoName !== options.abumInfoName) wx.setStorageSync('nativeList', canplay)
        if (options.noPlay !== 'true' && options.sameSong != 'true') wx.showLoading({
          title: '加载中...',
          mask: true
        })
        wx.setStorageSync('songInfo', songInfo)
        console.log('option----------------', options)
        if (options.noPlay != 'true') {
          app.playing(that)
        }

      }
      app.globalData.abumInfoId = that.data.songInfo.albumId
    }


  },



  playMedia(songInfo) {
    const that = this
    if (songInfo.feeType == true) {

      let param = {}
      utils.PLAYINFOGET(param, utils.getMediaInfo + songInfo.id + '/play-info', res => {
        console.log('res:', res)
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
          // wx.hideLoading()


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
      // wx.hideLoading()

    }
  },




  vipMediaPlay(mediaId) {
    let param = {}
    utils.PLAYINFOGET(param, utils.getMediaInfo + mediaId + '/play-info', res => {
      console.log('vip音频数据:', res)
      if (res.data && res.statusCode == 200) {
        app.globalData.songInfo.src = res.data.play_24_aac.url
        console.log('app.globalData.songInfo.src:', app.globalData.songInfo.src)
        this.setData({
          songInfo: app.globalData.songInfo,
          canplay: this.data.canplay,
          existed: this.data.existed,
          noPlay: this.data.noPlay,
          abumInfoName: this.data.abumInfoName,
          playing: wx.getStorageSync('playing')
        })
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
        wx.setStorageSync('songInfo', this.data.songInfo)

        app.playing(this)


      } else {

      }
    })
  },

  onShow: function () {
    var that = this
    //先刷新token
    that.refreshToken()
    const playing = wx.getStorageSync('playing')
    console.log('songInfo----', wx.getStorageSync('songInfo'))
    console.log('songInfo--===--', app.globalData.songInfo)
    console.log('playing----', playing)

    if (wx.getStorageSync('songInfo').src || app.globalData.songInfo.src) {
      if (!playing) {
        that.setData({
          playtime: app.globalData.playtime,
          percent: app.globalData.percent || 0,
        })
      }
    } else {

      that.setData({
        playtime: app.globalData.playtime,
        percent: 0,
      })

    }

    utils.EventListener(app, that)

    // 监听歌曲播放状态，比如进度，时间
    tool.playAlrc(that, app);
    that.queryProcessBarWidth()
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
    const title = this.data.abumInfoName

    // console.log('专辑id:',id)
    // const src = e.currentTarget.dataset.song.src
    // wx.setStorageSync('img', src)
    // wx.navigateBack({
    //   delta: 0,
    // })
    wx.navigateTo({
      url: '../albumInfo/albumInfo?id=' + id + '&title=' + title + '&routeType=album'
    })


  },
  // 作者点击
  authorClick(e) {
    // console.log('作者点击:',e)
    let id = e.currentTarget.dataset.song.authorId
    // console.log('作者id:',id)

    wx.navigateTo({
      url: '/pages/author/author?authorId=' + id,
    })

  },
  btnsPlay(e) {
    console.log('e:', e)
    const type = e.currentTarget.dataset.name


    console.log('type:', type)
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
  //刷新token
  refreshToken() {
    let param = {}
    utils.REFRESHTOKENPOST(param, utils.refreshToken, res => {
      console.log('刷新Token:', res)
      if (res.data && res.statusCode == 200) {
        res.data.deadline = +new Date() + (res.data.expires_in * 1000);
        console.log("失效时间", res.data.deadline)
        res.data.isLogin = true
        wx.setStorageSync('TOKEN', res.data)

      }
    })
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
          icon: 'none'
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
    this.data.currentIndex = this.data.canplay.findIndex(n => n.id == app.globalData.songInfo.id)
    console.log('preindex', this.data.currentIndex)
    if (this.data.currentIndex == 0) {
      console.log('第一首了')
      wx.showToast({
        title: '第一首了',
      })

    } else {
      this.data.currentIndex--
      let item = this.data.canplay[this.data.currentIndex]
      let isfree = item.feeType
      let isvipfree = item.isVipFree
      let isPaid = item.isPaid
      let authored = item.isAuthorized
      console.log('item:', item)
      console.log('isfree:', isfree)
      console.log('isvipfree:', isvipfree)
      console.log('isVip:', app.globalData.isVip)

      if (app.globalData.isVip && !isfree && isPaid || !app.globalData.isVip && !isfree && isPaid || app.globalData.isVip && !isfree && !authored && !isvipfree) {
        if (app.globalData.isVip) {

          let mediaId = this.data.canplay[this.data.currentIndex].id
          app.globalData.songInfo = this.data.canplay[this.data.currentIndex]

          this.vipMediaPlay(mediaId)
        } else {
          //收费曲目
          wx.showModal({
            title: '无权限',
            content: '暂无权限收听,请从喜马拉雅APP购买',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }


      } else if (isfree && isvipfree) {
        let mediaId = this.data.canplay[this.data.currentIndex].id
        app.globalData.songInfo = this.data.canplay[this.data.currentIndex]

        // this.vipMediaPlay(mediaId)
        app.cutplay(that, -1)
      } else {
        app.cutplay(that, -1)

      }

    }



  },
  // 下一首
  next() {
    const that = this
    console.log('下一首:', that)
    this.data.currentIndex = this.data.canplay.findIndex(n => n.id == app.globalData.songInfo.id)
     console.log('currentIndex:',this.data.currentIndex)
    if (this.data.currentIndex == this.data.canplay.length) {
      console.log('最后一首了')
      wx.showToast({
        title: '最后一首了',
      })

    } else {
      this.data.currentIndex++
      let item = this.data.canplay[this.data.currentIndex]
      console.log('item', item, this.data.canplay, )
      let isfree = item.feeType
      let isvipfree = item.isVipFree
      let isPaid = item.isPaid
      let authored = item.isAuthorized
      console.log('isfree:', isfree)
      console.log('isvipfree:', isvipfree)
      console.log('isVip:', app.globalData.isVip)

      if (!app.globalData.isVip && !isfree && isPaid &&  !item.src || app.globalData.isVip && !isfree && !authored && !isvipfree && !item.src) {
        // this.data.currentIndex--
        console.log('aaaaaaaaaaaaaaa:')

        //收费曲目
        wx.showModal({
          title: '无权限',
          content: '暂无权限收听,请从喜马拉雅APP购买',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else if ( (isfree && isvipfree) || (app.globalData.isVip && isvipfree) ) {
        let mediaId = this.data.canplay[this.data.currentIndex].id
        app.globalData.songInfo = this.data.canplay[this.data.currentIndex]
        console.log('nextfee--------------', app.globalData.songInfo)

        if (!app.globalData.isVip && !app.globalData.songInfo.feeType && app.globalData.songInfo.isPaid || app.globalData.isVip && !app.globalData.songInfo.feeType && !app.globalData.songInfo.isAuthorized && !app.globalData.songInfo.isVipFree) {
          wx.showToast({
            title: '暂无权限收听,请从喜马拉雅APP购买',
            icon: 'none'
          })
          return false
        }
        // this.vipMediaPlay(mediaId)
        app.cutplay(that, 1)

      } else {
        console.log('下一首')
        app.cutplay(that, 1)

      }

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
    if (wx.getStorageSync('songInfo').src || app.globalData.songInfo.src) {
      tool.toggleplay(that, app)
      app.globalData.playBeginAt = new Date().getTime();
      app.upLoadPlayinfo()
    } else {
      console.log('收费曲目')
      //收费曲目
      wx.showModal({
        title: '无权限',
        content: '暂无权限收听,请从喜马拉雅APP购买',
        success(res) {
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
    // setTimeout(() => {
    //   this.setData({
    //     noTransform: 'noTransform'
    //   })
    // }, 300)
  },
  closeList() {
    this.setData({
      showList: false,
      // noTransform: ''
    })
    // 显示的过度动画
    this.animation.translate('-180vh', 0).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  // 在播放列表里面点击播放歌曲
  async playSong(e) {
    console.log('-=-=-=-=---=：', e)
    let that = this
    const songInfo = e.currentTarget.dataset.song
    let isfree = songInfo.feeType
    let isvipfree = songInfo.isVipFree
    let isPaid = songInfo.isPaid
    let authored = songInfo.isAuthorized


    console.log('isfree:', isfree)
    console.log('isvipfree:', isvipfree)
    if (!app.globalData.isVip && !isfree && isPaid || app.globalData.isVip && !isfree && !authored && !isvipfree) {
      //收费曲目
      wx.showModal({
        title: '无权限',
        content: '暂无权限收听,请从喜马拉雅APP购买',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {

      app.globalData.songInfo = songInfo

      this.playMedia(songInfo)
      that.setData({
        currentId: app.globalData.songInfo.id,
      })
    }






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
     console.log('songInfo-----:',app.globalData.songInfo)
    console.log('songInfo--==---:',wx.getStorageSync('songInfo'))

    let currentTime = process * tool.formatToSend(wx.getStorageSync('songInfo').dt)
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

  // 滚到顶部
  listTop: tool.throttle(async function (res) {

    console.log('滚到顶部')



  }, 2000),
  // 滚到底部
  listBehind: tool.throttle(async function (res) {
    console.log('滚到底部----------sort:', this.data.sort)

    this.getAllList(this.data.songInfo.albumId, 'up')

  }, 1000),

  // 获取所有的播放列表
  getAllList(albumid, lazy = false) {
    var that = this
    return new Promise((resolve, reject) => {

      // console.log('专辑id:',albumid)
      wx.showLoading({
        title: '加载中...',
      })
      let param = {
        'limit': that.data.pageSize,
        'offset': wx.getStorageSync('allList').length,
        'sort': 'asc'
      }
      console.log('param-------------:', param)
      // console.log('start:',this.data.start)
      let _list = []
      utils.GET(param, utils.albumAllmedias + albumid + '/tracks', res => {
        console.log('专辑列表所有数据:', res)
        wx.hideLoading()
        if (res.data.items.length > 0 && res.statusCode == 200) {
          //非vip
          for (let item of res.data.items) {
            _list.push({
              title: item.title, // 歌曲名称
              //  title :that.cutStr(item.title) ,                            // 歌曲名称
              id: item.id, // 歌曲Id
              dt: that.formatMusicTime(item.duration), // 歌曲的时常
              coverImgUrl: app.impressImg(item.album.cover.large.url, 360, 360), // 歌曲的封面
              feeType: item.is_free,
              isVipFree: item.is_vip_free,
              isPaid: item.is_paid,
              isAuthorized: item.is_authorized,
              src: item.play_info.play_64.url,
              mediaType: item.album.kind,
              mediaAuthor: item.announcer.nickname,
              authorId: item.announcer.id,
              albumId: item.album_id
            })
          }
          console.log('lazy-------------:', lazy)
          // 上拉和下拉的情况
          if (lazy == 'up') {
            _list = that.data.canplay.concat(_list)
          } else if (lazy == 'down') {
            _list = _list.concat(that.data.canplay)
          }
          console.log('_list-------------:', _list)

          if (_list.length == res.data.total) {
            wx.showToast({
              title: '到底了',
              icon: 'none'
            })

          }
          for (let i = 0; i < _list.length; i++) {
            _list[i].num = parseInt(that.data.start) + i + 1
          }

          that.setData({
            total: res.data.total,
            canplay: _list,


          })
          wx.setStorageSync('canplay', this.data.canplay)
          wx.setStorageSync('allList', this.data.canplay)
          resolve()

        } else {
          console.log('------length------:', that.data.total)
          console.log('------------:', res.data.total)
          if (that.data.total == res.data.total) {
            wx.showToast({
              title: '到底了',
              icon: 'none'
            })

          }

        }
      })
    })
  },

  // 播放时间格式化
  formatMusicTime(time) {
    let m = parseInt(time / 60);
    let s = parseInt(time % 60);
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return m + ':' + s
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