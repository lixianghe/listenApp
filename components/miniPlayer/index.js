const app = getApp()
import btnConfig from '../../utils/pageOtpions/pageOtpions'
import utils from '../../utils/util'

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
    focusIndex:{
      type:String,
      default:null
    }
  },
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    // mini player按钮配置
    miniBtns: [{
        name: 'pre',
        img: '/images/pre.png',
      },
      {
        name: 'toggle',
        img: {
          stopUrl: '/images/stop.png',
          playUrl: '/images/play.png'
        }
      },
      {
        name: 'next',
        img: '/images/next.png'
      },
      {
        name: 'like',
        img: {
          noLike: '/images/like_none.png',
          liked: '/images/like.png'
        }
      }
    ],
    // 开发者不传的话默认的按钮
    defaultBtns: [{
      name: 'toggle',
      img: {
        stopUrl: '/images/stop.png',
        playUrl: '/images/play.png'
      }
    }],
    playing: false,
    hoverflag: false,
    current: null,
    canplay: [],
    mianColor: btnConfig.colorOptions.mainColor,
    percentBar: btnConfig.percentBar,
    existed: false
  },
  audioManager: null,
  attached: function () {
    const that = this

    utils.EventListener(app, that)

  },
  detached: function () {

  },
  methods: {
    player(e) {
      console.log(e)

      const type = e.currentTarget.dataset.name
      console.log('type:', type)
      switch (type) {
        case 'pre':
          console.log('上一首')
          if (wx.getStorageSync('songInfo') == '') {
            wx.showToast({
              title: '请添加音频',
              icon: 'none'
            })
            return
          }
          this.pre()
          break;
        case 'toggle':
          if (wx.getStorageSync('songInfo') == '') {
            wx.showToast({
              title: '请添加音频',
              icon: 'none'
            })
            return
          }

          this.toggle()
          break;
        case 'next':
          console.log('下一首---songInfo', wx.getStorageSync('songInfo'))

          if (wx.getStorageSync('songInfo') == '') {
            wx.showToast({
              title: '请添加音频',
              icon: 'none'
            })
            return
          }
          this.next()
          break;
        case 'like':
          console.log('like')
          console.log('USERINFO:', wx.getStorageSync('USERINFO'))
          if (wx.getStorageSync('USERINFO')) {
            if (wx.getStorageSync('songInfo') == '') {
              wx.showToast({
                title: '请添加音频',
                icon: 'none'
              })
              return
            }
            console.log('existed:', this.data.existed)

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
            //   url: '/pages/personalCenter/personalCenter'
            // })
          }


          break;

        default:
          break;
      }

    },
    //收藏专辑
    collectAlbum() {
       console.log('----------------minibar-----收藏专辑:',wx.getStorageSync('songInfo').albumId)
       console.log('----------------minibar-----收藏专辑:',app.globalData.songInfo.albumId)

      let param = {
        id: wx.getStorageSync('songInfo').albumId
      }
      utils.ALBUMSUBCRIBEPOST(param, utils.albumCollect, res => {
        console.log('收藏专辑:', res)
        if (res.data.status == 200 && res.data.errmsg == 'ok') {
          this.setData({
            existed: true
          })
          wx.setStorageSync('ALBUMISCOLLECT', true)
          this.triggerEvent('showExisted', this.data.existed);

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
        id: wx.getStorageSync('songInfo').albumId
      }

      utils.ALBUMSUBCRIBEPOST(param, utils.cancelAlbumCollect, res => {
        console.log('取消收藏专辑:', res)
        if (res.data.status == 200 && res.data.errmsg == 'ok') {
          this.setData({
            existed: false
          })
          wx.setStorageSync('ALBUMISCOLLECT', false)
          this.triggerEvent('showExisted', this.data.existed);

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
      if (wx.getStorageSync('songInfo')) {
        setTimeout(() => {
          this.triggerEvent('current', this.data.currentId)
        }, 300)
      }
      // 设置播放图片名字和时长
      const that = this
      app.cutplay(that, -1)
    },
    // 下一首
    next() {
      // 设置播放图片名字和时长
      const that = this
      if (wx.getStorageSync('songInfo')) {
        setTimeout(() => {
          this.triggerEvent('current', this.data.currentId)
        }, 300)
      }
      

      app.cutplay(that, +1)
    },
    // 暂停
    toggle() {

      console.log('=----------', wx.getStorageSync('songInfo'))
      console.log('+---------', app.globalData.songInfo)

      if (wx.getStorageSync('songInfo').src || app.globalData.songInfo.src) {
        this.triggerEvent('setPlaying', !this.data.playing)
        console.log('-----------------', this.data.playing)
        utils.toggleplay(this, app)

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
    // 进入播放详情
    playInfo() {
     console.log('getStorageSync----songInfo:', wx.getStorageSync('songInfo'))
      // console.log('app-----songInfo:', app.globalData.songInfo)
      if (!wx.getStorageSync('songInfo') && !app.globalData.songInfo) {
        wx.showToast({
          title: '暂无播放音频',
          icon: 'none'
        })
        return
      }
      // let abumInfoName = wx.getStorageSync('abumInfoName')
      let abumInfoName =wx.getStorageSync('songInfo').title?wx.getStorageSync('songInfo').title: app.globalData.songInfo.title

      wx.navigateTo({
        url: '../playInfo/playInfo?noPlay=true' + '&collect=' + wx.getStorageSync('ALBUMISCOLLECT') + '&abumInfoName=' + abumInfoName + '&start=0'+'&type=1'
       
      })
    },
    // 监听音乐播放的状态
    listenPlaey() {
      const that = this;
      // 每次从缓存中拿到当前歌曲的相关信息，还有播放列表
      console.log('listenPlaey--------songInfo:', app.globalData.songInfo)
      console.log('listenPlaey----=====----songInfo:', wx.getStorageSync('songInfo'))

      if (app.globalData.songInfo   ||  wx.getStorageSync('songInfo')  ) {
        console.log('listenPlaey-------123')

        that.setData({
          songInfo: app.globalData.songInfo?app.globalData.songInfo: wx.getStorageSync('songInfo')
        })
      }
     
        utils.playAlrc(that, app);
     

    },
    btnstart(e) {
      const index = e.currentTarget.dataset.index
      this.setData({
        hoverflag: true,
        current: index

      })
    },
    btend() {
      setTimeout(() => {
        this.setData({
          hoverflag: false,
          current: null
        })
      }, 150)
    },
    // 收藏和取消
    like() {

      console.log(' 收藏和取消')
    },
     watchPlay() {
    //   var that = this
    //   if (wx.canIUse('getPlayInfoSync')) {
    //     let res = wx.getPlayInfoSync()
    //     console.log('watchPlay-------------res:', res)
    //     if (!res.playState) return
    //     console.log('-----------1:', res.playList.length)
    //     console.log('-----------1:', res.playState.curIndex)

    //     if (res.playList.length > 0 && res.playState.curIndex > -1) {
    //       console.log('-----------2:')
    //       let panelSong = res.playList[res.playState.curIndex]
    //       wx.setStorageSync('songInfo', panelSong)
    //       let playing = res.playState.status == 1 ? true : false
    //       wx.setStorageSync('playing', playing)
    //       let time = res.playState.currentPosition / res.playState.duration * 100
    //       let isCollect = wx.getStorageSync('ALBUMISCOLLECT')
    //       console.log('-----------songInfo:', panelSong)
    //       console.log('-----------percent:', time)
    //       console.log('-----------playing:', playing)
    //       console.log('-----------existed:', isCollect)
    //       app.globalData.playing = playing

    //       app.globalData.percent = time
    //       app.globalData.playing = playing
    //       app.globalData.currentPosition = res.playState.currentPosition
    //       // app.globalData.playtime = playtime ? formatduration(playtime * 1000) : '00:00'

    //       that.setData({
    //         songInfo: panelSong,
    //         percent: time,
    //         playing: playing,
    //         existed: isCollect
    //       })
    //     }

    //   }
    //   // app.globalData.songInfo = wx.getStorageSync('songInfo')
    //   // console.log('watchPlay-------------songInfo:', app.globalData.songInfo)

    },
    // 因为1.9.2版本无法触发onshow和onHide所以事件由它父元素触发
    setOnShow() {
      let that = this
      that.refreshToken()

      const canplay = wx.getStorageSync('canplay')
      that.listenPlaey()
      const playing = wx.getStorageSync('playing')
      const isCollect = wx.getStorageSync('ALBUMISCOLLECT')
      console.log('minibar----songInfo------albumId:', wx.getStorageSync('songInfo').albumId)
      console.log('minibar---- app.globalData------abumInfoId:', app.globalData.abumInfoId)
      console.log('minibar----setonshow------isCollect:', isCollect)
      console.log('minibar----setonshow------canplay:', canplay)
      console.log('minibar----setonshow------playing:', playing)
      if(wx.getStorageSync('USERINFO') && (app.globalData.songInfo || wx.getStorageSync('songInfo'))){
        that.setData({
          existed: isCollect,
        })
      }else{
        that.setData({
          existed: false,
        })
      }

      if (app.globalData.songInfo  ) {
        console.log('listenPlaey-------456')

        that.setData({
          songInfo: app.globalData.songInfo
        })
      }

      that.setData({
        playing: playing,
        canplay: canplay,
        percent:app.globalData.percent
      })

    },
    //刷新token
    refreshToken() {
      let param = {}
      utils.REFRESHTOKENPOST(param, utils.refreshToken, res => {
        console.log('刷新Token:', res)
        if (res.data && res.statusCode == 200) {
          res.data.deadline = +new Date() + (res.data.expires_in * 1000);
          console.log("失效时间", res.data.deadline)
          // res.data.isLogin = true
          wx.setStorageSync('TOKEN', res.data)

        } else {
          console.log('刷新Token失败')
        }
      })
    },
    setOnHide() {

    }
  }
})