const app = getApp()
import tool from '../../utils/util'
import btnConfig from '../../utils/pageOtpions/pageOtpions'
import { getMedia } from '../../developerHandle/playInfo'
import utils from '../../utils/util'

// 记录上拉拉刷新了多少次
let scrollTopNo = 0

// 选择的选集
let selectedNo = 0
 let abumInfoMixin = require('../../developerHandle/abumInfo')
Page({
   mixins: [abumInfoMixin],
  data: {
    offset:0,
    start:1,
    end:null,
    sort:'asc',
    isVip:false,
    type:null,
    canplay: [],
    percent: 0,
    id: null,
    songpic: null,
    title: null,
    index: null,
    current: null,
    currentId: null,
    zjNo: 0,
    songInfo: {},
    rightWidth: '37vw',
    leftPadding: '0vh 11.25vh  20vh 11.25vh',
    btnsWidth: '167vh',
    imageWidth: '55.36vh',
    total: 0,
    optionId: '',
    palying: false,
    msg: '',
    batchSetRecycleData: true,
    showLoadTop: false,
    showLoadEnd: false,
    scrollTop: 0,
    pageNo: 1,
    pageNub: 0,
    initPageNo: 1,
    pageSize: 15,
    selected: 0,
    startY: 0,
    loadAnimate: null,
    tenHeight: 0,
    mainColor: btnConfig.colorOptions.mainColor,
    selectWordBtn: btnConfig.selectWordBtn,
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    likeIcon1: '../../images/like.png',
    likeIcon2: '../../images/like_none.png',
    abumInfoName: '',
    routeType: null                     // 专辑类型：电台、专辑
  },
  audioManager: null,
  ctx: null,
  onReady() {

  },

  async onLoad(options) {
    console.log('-------------abumInfo---onload:',options)
    var albumid = options.id
    this.data.optionId = albumid
    this.data.type = options.from
    // app.globalData.abumInfoId = this.data.optionId
    this.getAllList( this.data.optionId)
    // const msg = '网络异常，请检查网络！'
    // this.getNetWork(msg)
    // 暂存专辑全部歌曲
    this.setData({
      optionId: options.id,
      abumInfoName: options.title,
      routeType: options.routeType
    })
    wx.setNavigationBarTitle({
      title: options.title,
    })
    // 设置样式
    this.setStyle()
    // 获取十首歌得高度
    setTimeout(() => {
      this.getTenHeight()
    }, 500)
    scrollTopNo = 0
  },

  likeAbum(){ 
    if(wx.getStorageSync('USERINFO')){
      console.log('喜欢专辑',wx.getStorageSync('OPENID'))
      if(this.data.existed){
        console.log('取消收藏')
        this.cancelCollectAlbum()
      }else{
        console.log('添加收藏')
        this.collectAlbum()
      }
      
    }else{
      console.log('喜欢专辑')
      wx.showToast({
        title: '请登录后操作',
        icon:'none'
      })
    }

  },
  showExisted(e){
console.log('existed:',e.detail)
this.setData({
  existed:e.detail
})
  },
  //收藏专辑
  collectAlbum(){
    let param = {
      id:this.data.optionId
    }
    utils.ALBUMSUBCRIBEPOST(param,utils.albumCollect,res=>{
      console.log('收藏专辑:',res)
      if(res.data.status == 200 && res.data.errmsg == 'ok'){
        this.setData({
          existed:true
        })
        
        if(wx.getStorageSync('songInfo').albumId ==  app.globalData.abumInfoId){
          wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
          this.selectComponent('#miniPlayer').setOnShow()
        }
        
        
       

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
      id:this.data.optionId
    }

    utils.ALBUMSUBCRIBEPOST(param,utils.cancelAlbumCollect,res=>{
      console.log('取消收藏专辑:',res)
      if(res.data.status == 200 && res.data.errmsg == 'ok'){
        this.setData({
          existed:false
        })
          if(wx.getStorageSync('songInfo').albumId ==  app.globalData.abumInfoId){
            wx.setStorageSync('ALBUMISCOLLECT', this.data.existed)
            this.selectComponent('#miniPlayer').setOnShow()
          }
          
        

        wx.showToast({
          title: '专辑取消订阅成功',
          icon:'none'
        })
       
      }else{

      }
    } )

  },
  close() {
    this.setData({showModal: false})
    wx.navigateBack({
      
    })
  },
    // 获取所有的播放列表（首页item点击）
    getAllList(albumid, lazy = false) {
      return new Promise((resolve, reject) => {
        // 假设allList是canplay，真实情况根据接口来
        console.log('专辑id:',albumid)
        let param={
          'limit': this.data.pageSize,
          'offset': this.data.offset,
          'sort': this.data.sort
        }
        let _list = []
        utils.GET(param,utils.albumAllmedias+albumid+'/tracks',res=>{
           console.log('专辑列表所有数据:',res)
           if(res.data.items.length > 0 && res.statusCode == 200){
               //非vip
               for (let item of res.data.items) {
                _list.push({
                  title :item.title ,                            // 歌曲名称
                  id : item.id  ,                                  // 歌曲Id
                  dt :this.formatMusicTime(item.duration) ,                                  // 歌曲的时常
                  coverImgUrl :item.album.cover.middle.url ,                         // 歌曲的封面
                  feeType:item.is_free ,
                  src:item.play_info.play_64.url,       
                  mediaType:item.announcer.nickname,
                  mediaAuthor:item.album.title,
                  authorId:item.announcer.id,
                  albumId:item.album_id
                 })
               }
            
             // 上拉和下拉的情况
             if (lazy == 'up'){
              _list = this.data.canplay.concat(_list)
             } else if (lazy == 'down') {
              _list = _list.concat(this.data.canplay)
             }
             this.setData({
              total:res.data.total,
              canplay: _list,
              src:_list[0].coverImgUrl
  
             })
           


           }else{
            // this.setData({
            //   showModal: true,
            //   req:-1
            // })
           }
        })
      })
      // wx.setStorageSync('allList', allList)
    },

    async  getVipMediaUrl(trackid){
      // console.log('-------trackid:',trackid)
      let param = {  
      }   
        var mediaUrl
        return new Promise((resolve, reject) => {
          utils.PLAYINFOGET(param,utils.getMediaInfo+trackid+'/play-info',res=>{
            // console.log('bannees音频-------:',res)
            if(res.data && res.statusCode == 200){
              mediaUrl = res.data.play_32.url
              resolve(mediaUrl)
            }else{
            }
      
          } )


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

    //专辑详情
    getAlbumDetails(albumid){
       console.log('专辑id:',albumid)
      let param={}
      utils.GET(param,utils.albumDetails+albumid,res=>{
         console.log('专辑详情:',res)
         if(res.data && res.statusCode == 200){
           this.setData({
             total:res.data.include_track_count,
             existed:res.data.is_subscribe,
             src:res.data.cover.large.url,
             isVip:res.data.is_vip_free
  
           })          
           
         }else{
          console.log('专辑详情错误:',res)

         }
  
      })
    },
  
  onShow() {
    this.getAlbumDetails( this.data.optionId )

    const currentId = wx.getStorageSync('songInfo').id
    this.setData({
      currentId: Number(currentId),
      existed:wx.getStorageSync('ALBUMISCOLLECT')
    })
    let playing = wx.getStorageSync('playing')
    this.setData({playing})

    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  },
  // 调用子组件的方法，进行通讯,传值true显示选集列表
  changeProp() {
    this.selectWorks = this.selectComponent('#selectWorks')
    let val = {
      hidShow: true,
      sum: this.data.total,
      selected:this.data.pageNum,
      existed:this.data.existed

    }
    this.selectWorks.hideShow(val)
    
  },
  // 接受子组件传值
  async changeWords(e) {
    // console.log('接受子组件传值-----:',e)
    // 请求新的歌曲列表
   
    if(e.detail.sort =='asc'){
      this.setData({
        
        start:e.detail.start,
        end:e.detail.end,
        sort:e.detail.sort,
        offset:e.detail.start
      })
    }else{
      // console.log('------=====:',parseInt( this.data.total/15))
      this.setData({
       
        start:e.detail.start,
        end:e.detail.end,
        sort:e.detail.sort,
        offset:e.detail.end

      })
      //  console.log('------=====:',this.data.pageNo*this.data.pageSize)

    }
    this.getAllList(this.data.optionId).then(()=> {
      this.setData({scrollTop: 0})
    })
    
  },

  // 点击歌曲名称跳转到歌曲详情
  goPlayInfo(e) {
    const msg = '网络异常，无法播放！'
    // console.log('音频点击',e)
    // 点击歌曲的时候把歌曲信息存到globalData里面
    const songInfo = e.currentTarget.dataset.song
    console.log('app.globalData.songInfo----------', app.globalData.songInfo)
    app.globalData.songInfo = songInfo
    wx.setStorageSync('songInfo', songInfo)
    wx.setStorageSync('abumInfoName', songInfo.title)
    wx.setStorageSync('canplay', this.data.canplay)
    wx.setStorageSync('allList', this.data.canplay)
    // console.log('-------------:',wx.getStorageSync('abumInfoName'))

    this.setData({ currentId: songInfo.id })

    this.getNetWork(msg, this.toInfo)
  },
  toInfo() {
    app.globalData.abumInfoId = this.data.optionId
    // console.log('-------------:',wx.getStorageSync('abumInfoName'))

    wx.navigateTo({ url: `../playInfo/playInfo?id=${app.globalData.songInfo.id}&abumInfoName=${wx.getStorageSync('abumInfoName')}&collect=${this.data.existed}` })
  },
  // 改变current
  changeCurrent(currentId) {
    this.setData({ currentId: currentId.detail })
  },
  setCanplay(canplay) {
    this.setData({
      canplay: canplay,
    })
    wx.setStorage({
      key: 'canplay',
      data: canplay,
    })
  },

  
  // 播放全部
  async playAll() {
    wx.setStorageSync('songInfo', this.data.canplay[0])
    wx.setStorageSync('allList', this.data.canplay)
    wx.setStorageSync('canplay', this.data.canplay)
    wx.setStorageSync('nativeList', this.data.canplay)
    wx.setStorageSync('abumInfoName', this.data.abumInfoName)
    // wx.setStorageSync('allList', this.data.canplay)
    // wx.setStorageSync('canplay', this.data.canplay)
    // let allList = wx.getStorageSync('allList') || []
    // wx.setStorageSync('nativeList', allList)
    // const msg = '网络异常，无法播放！'
    app.globalData.canplay = JSON.parse(JSON.stringify(this.data.canplay))
    app.globalData.songInfo = app.globalData.canplay[0]
    app.globalData.abumInfoId = this.data.optionId
    this.setData({
      currentId: app.globalData.songInfo.id,
      songInfo: app.globalData.songInfo,
    })
    app.playing(this)
    // this.getNetWork(msg, app.playing)
  },
  setPlaying(e) {
    this.setData({
      playing: e.detail,
    })
  },
  // 获取网络信息，给出相应操作
  getNetWork(title, cb) {
    const that = this
    // 监听网络状态
    wx.getNetworkType({
      async success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.setData({
            msg: title,
          })
          that.bgConfirm = that.selectComponent('#bgConfirm')
          that.bgConfirm.hideShow(true, 'out', () => {})
        } else {
          setTimeout(() => {
            cb && cb()
          }, 200)
        }
      },
    })
  },
 
  // 列表滚动事件
  listScroll: tool.debounce(async function (res) {
    // console.log()
    // if(this.data.sort == 'asc'){
    //   this.data.offset-=15

    // }else{
    //   this.data.offset+=15

    // }
    // console.log('offset:',this.data.offset)
    // this.getAllList(this.data.optionId, 'down')
    // setTimeout(() => {
    //   this.setData({
    //     showLoadEnd: false,
    //   })
    // }, 800)

  }, 50),
  // 滚到顶部
  listTop: tool.throttle(async function (res) {
     console.log('滚到顶部')
    // if(this.data.sort == 'asc'){
    //   this.data.offset-=15

    // }else{
    //   this.data.offset+=15

    // }
    // console.log('offset:',this.data.offset)
    // this.getAllList(this.data.optionId, 'down')
    // setTimeout(() => {
    //   this.setData({
    //     showLoadEnd: false,
    //   })
    // }, 800)

  }, 2000),
  // 滚到底部
  listBehind: tool.throttle(async function (res) {
    // 滑倒最底下
    // let lastIndex = (this.data.pageNo   - 1) * this.data.pageSize + this.data.canplay.length      // 目前最后一个的索引值
    // if (lastIndex >= this.data.total) {
    //   this.setData({ showLoadEnd: false })
    //   return false
    // } else {
    //   this.setData({ showLoadEnd: true })
    // }
    // scrollTopNo++
    // console.log('scrollTopNo:',scrollTopNo)

   console.log('sort:',this.data.sort)
    if(this.data.sort == 'asc'){
      this.data.offset+=15

    }else{
      this.data.offset-=15

    }
    console.log('offset:',this.data.offset)
    this.getAllList(this.data.optionId, 'up')
    setTimeout(() => {
      this.setData({
        showLoadEnd: false,
      })
    }, 800)
  }, 1000),
  getTenHeight() {
    let query = wx.createSelectorQuery()
    query
      .select('.songList')
      .boundingClientRect((rect) => {
        let listHeight = rect.height
        this.setData({
          tenHeight: listHeight,
        })
        // console.log('songListH:',this.data.tenHeight)
      })
      .exec()
  },
  // 为了实现上拉可以加载更多
  touchStart(e) {
    this.setData({
      startY: e.changedTouches[0].pageY,
    })
  },
  // 触摸移动
  touchMove(e) {
    let endY = e.changedTouches[0].pageY
    let startY = this.data.startY
    let dis = endY - startY
    // 判断是否下拉
    if (dis <= 0 || (this.data.start - 1) / 15 <= 0) {
      return false
    }
   
    if (dis < 60) {
      // 下拉60内随下拉高度增加
      this.move = wx.createAnimation({
        duration: 100,
        timingFunction: 'linear',
      })
      this.move.translate(0, '6vh').step()
      this.setData({
        loadAnimate: this.move.export(),
        showLoadTop: true,
      })
    }
    // 滑动距离大于20开始刷新
    this.showRefresh = dis > 20
    // console.log('this.showRefresh', this.showRefresh)
  },
  // 触摸结束
  touchEnd: tool.throttle(function(e) {
    // console.log((this.data.start - 1) / 15)
    if ((this.data.start - 1) / 15 <= 0 || !this.showRefresh) {
      return false
    }
    //1s后回弹
    setTimeout(() => {
      // 创建动画实例
      this.animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
        delay: 0,
      })
      this.animation.translate(0, 0).step()
      this.setData({
        loadAnimate: this.animation.export(),
        showLoadTop: false,
      })
      this.topHandle()
      this.showRefresh = false
    }, 600)
  }, 1000),
  // touchEnd(e) {
    
  // },
  // 下拉结束后的处理
  async topHandle() {
    console.log('---下拉结束')
    if(this.data.sort == 'asc'){
      this.data.offset-=15
      this.data.start-=15
    }else{
      this.data.offset+=15
      this.data.start-=15
    }    this.getAllList(this.data.optionId, 'down')
    this.setData({
      showLoadTop: false,
      scrollTop: 0,
      start: this.data.start
      
    })
  },
  // 根据分辨率设置样式
  setStyle() {
    // 判断分辨率的比列
    const windowWidth = wx.getSystemInfoSync().screenWidth
    const windowHeight = wx.getSystemInfoSync().screenHeight
    // 如果是小于1/2的情况
    if (windowHeight / windowWidth >= 0.41) {
      this.setData({
        rightWidth: windowWidth * 0.28 + 'px',
        leftPadding: '0vh 3.3vh 20vh 8.3vh',
        btnsWidth: windowWidth * 0.67 + 'px',
        imageWidth: windowWidth * 0.21 + 'px',
      })
    } else {
      this.setData({
        rightWidth: '37vw',
        leftPadding: '0vh 11.25vh 20vh  11.25vh',
        btnsWidth: '167vh',
        imageWidth: '55.36vh',
      })
    }
  }
})