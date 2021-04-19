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
    const that = this
    utils.EventListener(app, that)
  },
  detached: function () {

  },
  methods: {
    player(e) {
      console.log(e)
      
      const type = e.currentTarget.dataset.name
      console.log('type:',type)
      switch (type) {
        case 'pre':     
            console.log('上一首')
            if(wx.getStorageSync('songInfo') == ''){
              wx.showToast({
                title: '请添加音频',
                icon:'none'
              })
              return
             }
          this.pre()
          break;
        case 'toggle': 
        if(wx.getStorageSync('songInfo') == ''){
          wx.showToast({
            title: '请添加音频',
            icon:'none'
          })
          return
         }

         this.toggle()        
          break;
          case 'next':         
              console.log('下一首')
              if(wx.getStorageSync('songInfo') == ''){
                wx.showToast({
                  title: '请添加音频',
                  icon:'none'
                })
                return
               }
              this.next()      
            break;
          case 'like':
            console.log('like')
            console.log('USERINFO:',wx.getStorageSync('USERINFO'))
            if(wx.getStorageSync('USERINFO')){
              if(wx.getStorageSync('songInfo') == ''){
                wx.showToast({
                  title: '请添加音频',
                  icon:'none'
                })
                return
               }
               console.log('existed:',this.data.existed)

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
    // console.log('----------------minibar-----收藏专辑:',wx.getStorageSync('songInfo').albumId)
    let param = {
      id:wx.getStorageSync('songInfo').albumId
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
        wx.showToast({
          title: '订阅失败，请重新登录',
          icon:'none'
        })
      }
    } )

  },
  //取消收藏专辑
  cancelCollectAlbum(){
    let param = {
      id:wx.getStorageSync('songInfo').albumId
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
      if (wx.getStorageSync('songInfo')) {
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
      if (wx.getStorageSync('songInfo')) {
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
        url: '../playInfo/playInfo?noPlay=true'+'&collect='+wx.getStorageSync('ALBUMISCOLLECT')+'&abumInfoName='+abumInfoName+'&start=0'
        // url: '../abumInfo/abumInfo?id='+id+'&title='+title+'&routeType=album'
        // url: `../playInfo/playInfo?noPlay=true&collect=${wx.getStorageSync('ALBUMISCOLLECT')}&abumInfoName=${abumInfoName}`
      })
    },
    // 监听音乐播放的状态
    listenPlaey() {
      const that = this;
      // 每次从缓存中拿到当前歌曲的相关信息，还有播放列表
      console.log('listenPlaey--------------songInfo:',app.globalData.songInfo)
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
      const isCollect = wx.getStorageSync('ALBUMISCOLLECT')

      console.log('watchPlay-------------songInfo:',app.globalData.songInfo)
      this.setData({
        songInfo: app.globalData.songInfo ,
        existed:isCollect
      })
    },
    // 因为1.9.2版本无法触发onshow和onHide所以事件由它父元素触发
    setOnShow() {
      let that = this
      const canplay = wx.getStorageSync('canplay')
      that.listenPlaey()
      const playing = wx.getStorageSync('playing')
      const isCollect = wx.getStorageSync('ALBUMISCOLLECT')
      console.log('minibar----songInfo------albumId:',wx.getStorageSync('songInfo').albumId)
      console.log('minibar---- app.globalData------abumInfoId:',app.globalData.abumInfoId)
       console.log('minibar----setonshow------isCollect:',isCollect)
      if(wx.getStorageSync('songInfo') ){
           that.setData({
          existed:isCollect
        })
      }
    
      that.setData({
        playing: playing,
        canplay: canplay,
      })
      
    },
    setOnHide() {

    }
  }
})
