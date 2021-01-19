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
        name: 'like',                                         
        img: {
          noLike: '/images/like_none.png' ,                   
          liked: '/images/like.png'                          
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
  attached: function () {
    
  },
  detached: function () {

  },
  methods: {
    player(e) {
      console.log(e)
      //  if (!this.data.songInfo || !this.data.songInfo.title) {
      //   wx.showToast({
      //     title: '请添加音频播放',
      //     icon:'none'
      //   })
      //   return
      //  }
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
            console.log('like')

            if(wx.getStorageSync('USERINFO')){
              if(this.data.existed){
                console.log('取消收藏')
                this.cancelCollectAlbum()
              }else{
                console.log('添加收藏')
                this.collectAlbum()
              }
            }else{
              wx.showToast({
                title: '请登录后操作',
                icon:'none'
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
  collectAlbum(){
    console.log('----------------minibar-----收藏专辑:',app.globalData.songInfo.albumId)
    let param = {
      id:app.globalData.abumInfoId
    }
    utils.ALBUMSUBCRIBEPOST(param,utils.albumCollect,res=>{
      console.log('收藏专辑:',res)
      if(res.data.status == 200 && res.data.errmsg == 'ok'){
        this.setData({
          existed:true
        })
        wx.setStorageSync('ALBUMISCOLLECT', true)
        this.triggerEvent('showExisted', this.data.existed);

        wx.showToast({
          title: '专辑订阅成功',
          icon:'none'
        })
       
      }else{

      }
    } )

  },
  //取消收藏专辑
  cancelCollectAlbum(){
    let param = {
      id:app.globalData.abumInfoId
    }

    utils.ALBUMSUBCRIBEPOST(param,utils.cancelAlbumCollect,res=>{
      console.log('取消收藏专辑:',res)
      if(res.data.status == 200 && res.data.errmsg == 'ok'){
        this.setData({
          existed:false
        })
        wx.setStorageSync('ALBUMISCOLLECT', false)
        this.triggerEvent('showExisted', this.data.existed);

        wx.showToast({
          title: '专辑取消订阅成功',
          icon:'none'
        })
       
      }else{

      }
    } )

  },
    //收藏音频
    collectAudio(){
      let param = {
        id:wx.getStorageSync('songInfo').id
      }
      utils.PLAYHISTORYGET(param,utils.audioCollect,res=>{
        console.log('收藏音频:',res)
        if(res.data.status == 200 && res.data.errmsg == 'ok'){
          this.setData({
            existed:true
          })

          wx.showToast({
            title: '音频订阅成功',
            icon:'none'
          })
         
        }else{
  
        }
      } )
    },
    //取消音频收藏
    cancelAudioCollect(){
      let param = {
        id:wx.getStorageSync('songInfo').id
      }
      utils.PLAYHISTORYGET(param,utils.audioCancelCollect,res=>{
        console.log('取消音频收藏:',res)
        if(res.data.status == 200 && res.data.errmsg == 'ok'){
          this.setData({
            existed:false
          })
          wx.showToast({
            title: '音频取消订阅成功',
            icon:'none'
          })
         
        }else{
  
        }
      } )
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
      this.triggerEvent('setPlaying', !this.data.playing)
      console.log('-----------------',this.data.playing)
      utils.toggleplay(this, app)
    },
    // 进入播放详情
    playInfo() { 
      if(!wx.getStorageSync('songInfo') || !app.globalData.songInfo){
        wx.showToast({
          title: '暂无播放音频',
          icon:'none'
        })
        return
      }
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
      setTimeout(()=> {
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
      app.globalData.songInfo = wx.getStorageSync('songInfo')
      this.setData({
        songInfo: app.globalData.songInfo 
      })
    },
    // 因为1.9.2版本无法触发onshow和onHide所以事件由它父元素触发
    setOnShow() {
      let that = this
      const canplay = wx.getStorageSync('canplay')
      that.listenPlaey()
      const playing = wx.getStorageSync('playing')
     const isCollect = wx.getStorageSync('ALBUMISCOLLECT')
      that.setData({
        playing: playing,
        canplay: canplay,
        existed:isCollect
      })
      if (playing) app.playing(that)
      // 是否被收藏
      // let songInfo = wx.getStorageSync('songInfo')
      // isFavorite({mediaId: songInfo.id}, that)
    },
    setOnHide() {

    }
  }
})
