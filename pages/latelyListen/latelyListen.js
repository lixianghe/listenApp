const app = getApp()
import utils from '../../utils/util'
Page({
  mixins: [require('../../developerHandle/latelyListen')],
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    info: '',
    currentTap: 0,
    scrollLeft: 0,
    
    mainColor: app.globalData.mainColor,
    emptyObj: {
      'title': '已经见底啦~~',
      'src': '/images/album_img_default.png'
    },
    canplay:[],
    //是否自动播放
    autoPlay:false,
    showModal: false,
    req: false,
    countPic: '/images/media_num.png',
    likePic: ['/images/info_like.png', '/images/info_like_no.png'],

    // 开发者注入模板标签数据
    labels: {
      show: true,
      // data: [{
      //   name: '专辑',
      //   value: 'album'
      // },
      // {
      //   name: '故事',
      //   value: 'media'
      // }]
    },
    // 开发者注入模板页面数据
    info: []
  },
  screen: app.globalData.screen,
 

  onLoad(options) {
    app.log('latelyListen------------options:',options)
    if(options.playing){
      //语音直达，自动播放
      this.data.autoPlay = true
      app.log('latelyListen------------autoPlay:',this.data.autoPlay)

    }
    this.getLaterListen()
  },
  onShow() {
  
    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  },
 
  onReady() {

  },
    //刷新token
    refreshToken() {
      let param = {}
      utils.REFRESHTOKENPOST(param, utils.refreshToken, res => {
        app.log('刷新Token:', res)
        if (res.data && res.statusCode == 200) {
          res.data.deadline = +new Date() + (res.data.expires_in * 1000);
          app.log("失效时间", res.data.deadline)
          res.data.isLogin = true
          wx.setStorageSync('TOKEN', res.data)
          this.getLaterListen()
        }
      })
    },
    
  // 跳转到播放详情界面
  linkAbumInfo(e) {
    console.log('-------latelylisten:', e)
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    // const routeType = e.currentTarget.dataset.contentype
    if (id) {
      wx.navigateTo({
        url: '../albumInfo/albumInfo?id=' + id + '&title=' + title + '&routeType=album'
      })

    } else {

    }


  },

  //最近收听
  getLaterListen() {
    wx.showLoading({
      title: '加载中...',
    })
    let param = {

    }
    utils.PLAYHISTORYGET(param, utils.historyPlay, res => {
      wx.hideLoading()

      app.log('最近播放:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {
        // item.title = item.mediaName                               // 歌曲名称
        // item.id = item.mediaId                                    // 歌曲Id
        // item.src = item.coverUrl                                  // 歌曲的封面
        // item.contentType = 'album'                                // 类别（例如专辑或歌曲）
        // item.isVip = true                                         // 是否是会员
        let laterArr = []
        for (let i = 0; i < res.data.items.length; i++) {
          app.log('---------', i)
          if (!res.data.items[i].track || res.data.items[i].track == null || res.data.items[i].track.played_secs == null) {
            res.data.items[i].track = new Object()
            res.data.items[i].track.played_secs = 0
          } else {
            res.data.items[i].track.played_secs = res.data.items[i].track.played_secs
          }
         if(res.data.items[i].album && res.data.items[i].album != null){
          laterArr.push({
            title: res.data.items[i].album.title,
            id: res.data.items[i].album.id,
            src:app.impressImg(res.data.items[i].album.cover.large.url,280,280) ,
            contentType: 'album',
            isVip: res.data.items[i].album.is_vip_free,
            feeType:res.data.items[i].album.is_free ,
            isVipFree:res.data.items[i].album.is_vip_free,
            // isHome: true,
            // isVip:wx.getStorageInfoSync('USERINFO').is_vip,
            perceent: (res.data.items[i].track.played_secs / res.data.items[i].track.duration) * 100

          })
         }
    
        }
        laterArr.push(this.data.emptyObj)

        this.setData({
          req: true,
          info: laterArr
        })
        app.log('最近播放-------------info:', this.data.info)
        if(this.data.autoPlay){
          this.beginAutoPlay(this.data.info[0])

        }



      } else {
        this.setData({
          showModal: true,
          req: -1
        })
      }

    })


  },
  //语音自动播放
  beginAutoPlay(playItem){
    app.log('自动播放专辑数据:',playItem)
    let albunId = playItem.id
    this.getSongifCollect(albunId)

    let isVip = playItem.isVip
    if (isVip) {
      //Vip专辑
      this.VipAlbumGetAudioId(albunId)
    } else {
      //非Vip专辑
      this.getAllList(albunId)
    }

  },

//专辑是否收藏
getSongifCollect(albumid){
  let param={}
  utils.GET(param,utils.albumDetails+albumid,res=>{
    console.log('专辑是否收藏:',res)
    if(res.data && res.statusCode == 200){
      wx.setStorageSync('ALBUMISCOLLECT',res.data.is_subscribe)
      
    }else{
     console.log('专辑是否收藏错误:',res)

    }

 })

},



  VipAlbumGetAudioId(albumid) {
    var that = this
    console.log('vip-----albumid:', albumid)
    that.data.canplay = []

    let param = {
      'limit': 15,
      'offset': 0,
      'sort': "asc"
    }
    utils.GET(param, utils.albumAllmedias + albumid + '/tracks', res => {
      app.log('vip---------专辑列表所有数据:', res)
      if (res.data && res.statusCode == 200) {
        for (let item of res.data.items) {
          // console.log(item)
          that.data.canplay.push({
            title: item.title, // 歌曲名称
            id: item.id, // 歌曲Id
            dt: this.formatMusicTime(item.duration), // 歌曲的时常
            coverImgUrl: item.image.url, // 歌曲的封面
             src: '',
             feeType:item.is_free ,
             isVipFree:item.is_vip_free,
             isPaid:item.is_paid,
             isAuthorized:item.is_authorized,
            mediaType: item.announcer.nickname,
            mediaAuthor: item.album.title,
            authorId: item.announcer.id,
            albumId: item.album_id
          })


        }
    
        Promise.all(that.getVipAudioInfo()).then(res=>{
          let {canplay} = this.data
          canplay.forEach((item,index )=> {
            item.src = res[index].play_24_aac.url
          });
          app.log('canplay',this.data.canplay)
          wx.setStorageSync('canplay', this.data.canplay)
          wx.setStorageSync('allList', this.data.canplay)
          wx.setStorageSync('nativeList', this.data.canplay)
          //minibar  播放
          app.globalData.canplay = JSON.parse(JSON.stringify(this.data.canplay))
          app.globalData.songInfo = app.globalData.canplay[0]
          wx.setStorageSync('playing', true)
          wx.setStorageSync('songInfo', app.globalData.canplay[0])
          app.playing(this)
          this.selectComponent('#miniPlayer').setOnShow()
          this.selectComponent('#miniPlayer').watchPlay()
        }).catch(err=>{
            console.log('err------------------------:', err)

        })
       
      

      }

    })
  },
  //vip音频数据
  getVipAudioInfo() {
    // var that = this
    // return new Promise(function (resolve, reject) {
    //   for (let item of that.data.canplay) {
    //     let param = {}
    //     utils.PLAYINFOGET(param, utils.getMediaInfo + item.id + '/play-info', res => {
    //       console.log('res:', res) 
    //       item.src = res.data.play_24_aac.url
    //       resolve(that.data.canplay)
    //     })
    //   }
    //   // resolve(that.data.canplay)
    // })
    let {canplay} = this.data 
    return [...canplay].map(item=>{
      return this.AudioInfo(item.id)
    })
  },
  AudioInfo(id){
    return new Promise( (resolve, reject)=> {
      utils.PLAYINFOGET({}, utils.getMediaInfo + id + '/play-info', res => {
        resolve(res.data)
        })
      })
  },

  // 获取所有的播放列表
  getAllList(albumid) {
    this.data.canplay = []
    // 假设allList是canplay，真实情况根据接口来
    // console.log('专辑id:', albumid)
    let param = {
      'limit': 15,
      'offset': 0,
      'sort': "asc"
    }
    utils.GET(param, utils.albumAllmedias + albumid + '/tracks', res => {
       app.log('getAllList---专辑列表所有数据:', res)
      if (res.data && res.statusCode == 200) {
     

        for (let item of res.data.items) {
          // console.log(item)
          this.data.canplay.push({
            title: item.title, // 歌曲名称
            id: item.id, // 歌曲Id
            dt: this.formatMusicTime(item.duration), // 歌曲的时常
            coverImgUrl: item.image.url, // 歌曲的封面
            src: item.play_info.play_64.url,
            feeType:item.is_free ,
            isVipFree:item.is_vip_free,
            isPaid:item.is_paid,
            isAuthorized:item.is_authorized,
            mediaType: item.announcer.nickname,
            mediaAuthor: item.album.title,
            authorId: item.announcer.id,
            albumId: item.album_id
          })
        }

        wx.setStorageSync('canplay', this.data.canplay)
        wx.setStorageSync('allList', this.data.canplay)
        wx.setStorageSync('nativeList', this.data.canplay)
        //minibar  播放
        app.globalData.canplay = JSON.parse(JSON.stringify(this.data.canplay))
        app.globalData.songInfo = app.globalData.canplay[0]
        wx.setStorageSync('playing', true)
        wx.setStorageSync('songInfo', app.globalData.canplay[0])
        console.log('是否收藏:',  wx.getStorageSync('ALBUMISCOLLECT'))
       

        app.playing(this)
        this.selectComponent('#miniPlayer').setOnShow()
        this.selectComponent('#miniPlayer').watchPlay()
      }

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

  close() {
    this.setData({
      showModal: false
    })
    wx.navigateBack({

    })
  }
})