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
  onReady() {},
  async onLoad(options) {
    let albumid = options.id
    this.data.optionId = albumid
    this.getAlbumDetails(albumid)
    this.getAllList(albumid)
    const msg = '网络异常，请检查网络！'
    this.getNetWork(msg)
    // 暂存专辑全部歌曲
    this.setData({
      src: wx.getStorageSync('img'),
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
    // 获取所有的播放列表
    getAllList(albumid) {
      // 假设allList是canplay，真实情况根据接口来
      console.log('专辑id:',albumid)
      let param={
        'limit': this.data.pageSize,
        'offset': this.data.pageNub*15,
        'sort': "asc"
      }
      utils.GET(param,utils.albumAllmedias+albumid+'/tracks',res=>{
        console.log('专辑列表所有数据:',res)
         if(res.data && res.statusCode == 200){
          
           for (let item of res.data.items) {
             this.data.canplay.push({
              title :item.title ,                            // 歌曲名称
              id : item.id  ,                                  // 歌曲Id
              dt :this.formatMusicTime(item.duration) ,                                  // 歌曲的时常
              coverImgUrl :item.image.url ,                         // 歌曲的封面
              src:item.play_info.play_64.url
             })
           }
           this.setData({
            canplay:this.data.canplay
  
           })
           wx.setStorageSync('canplay', this.data.canplay)
           wx.setStorageSync('allList', this.data.canplay)


         }
  
      })
      // wx.setStorageSync('allList', allList)
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
             existed:false,
             src:res.data.announcer.avatar_url
  
           })
        //    wx.setStorageSync('img', res.data.announcer.avatar_url)
     
        //  console.log('src',this.data.src)
        //  console.log('total',this.data.total)

         }
  
      })
    },
  
  onShow() {
    const currentId = wx.getStorageSync('songInfo').id
    this.setData({
      currentId: Number(currentId),
    })
    this.selectComponent('#miniPlayer').setOnShow()
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
      selected:this.data.pageNum

    }
    this.selectWorks.hideShow(val)
    
  },
  // 接受子组件传值
  async changeWords(e) {
    console.log(e)
    // 请求新的歌曲列表
    this.setData({
      pageNub: e.detail.pageNum,
      selected:e.detail.pageNum
    })
    // this.listScroll()
    this.getAllList(this.data.optionId)
    this.setData({
      scrollTop: e.detail.pageNum*this.data.tenHeight,

    })
    this.setCanplay(this.data.canplay)
  },

  // 点击歌曲名称跳转到歌曲详情
  goPlayInfo(e) {
    const msg = '网络异常，无法播放！'
    console.log('音频点击',e)
    // 点击歌曲的时候把歌曲信息存到globalData里面
    const songInfo = e.currentTarget.dataset.song
    app.globalData.songInfo = songInfo
    wx.setStorage({ key: 'songInfo', data: songInfo })
    this.setData({ currentId: songInfo.id })

    this.getNetWork(msg, this.toInfo)
  },
  toInfo() {
    app.globalData.abumInfoId = this.data.optionId
    wx.navigateTo({ url: `../playInfo/playInfo?id=${app.globalData.songInfo.id}&abumInfoName=${app.globalData.songInfo.title}` })
    

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
    let allList = wx.getStorageSync('allList') || []
    wx.setStorageSync('nativeList', allList)
    const msg = '网络异常，无法播放！'
    app.globalData.canplay = JSON.parse(JSON.stringify(this.data.canplay))
    app.globalData.songInfo = app.globalData.canplay[0]
    app.globalData.abumInfoId = this.data.optionId
    this.initAudioManager(this.data.canplay)
    let params = {
      mediaId: app.globalData.songInfo.id,
      contentType: 'story'
    }
    this.setData({
      currentId: app.globalData.songInfo.id,
      songInfo: app.globalData.songInfo,
    })
    let that = this
    if (getMedia) await getMedia(params, that)
    this.getNetWork(msg, app.playing)
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
  // 初始化 BackgroundAudioManager
  initAudioManager(list) {
    this.audioManager = wx.getBackgroundAudioManager()
    this.audioManager.playInfo = { playList: list }
  },
  // 列表滚动事件
  listScroll: tool.debounce(async function (res) {
    console.log(res)
    let top = res.detail.scrollTop
    console.log('top:',top)
    selectedNo = parseInt(top / this.data.tenHeight)
    console.log('selectedNo:',selectedNo)
    this.setData({
      select:selectedNo,

    })

  }, 50),
  // 滚到顶部
  listTop: tool.throttle(async function (res) {

  }, 2000),
  // 滚到底部
  listBehind: tool.throttle(async function (res) {
    // 滑倒最底下
    let lastIndex = (this.data.pageNo   - 1) * this.data.pageSize + this.data.canplay.length      // 目前最后一个的索引值
    if (lastIndex >= this.data.total) {
      this.setData({ showLoadEnd: false })
      return false
    } else {
      this.setData({ showLoadEnd: true })
    }
    scrollTopNo++
    console.log('scrollTopNo:',scrollTopNo)

    let pageNoName = this.data.pageNoName
    let idName = this.data.idName
    let params = { [pageNoName]: this.data.initPageNo + scrollTopNo, [idName]: this.data.optionId }
   this.data.pageNub++

    console.log('pageNub:',this.data.pageNub)
    this.getAllList(this.data.optionId)
    const list = this.data.canplay
    setTimeout(() => {
      this.setData({
        canplay: list,
        showLoadEnd: false,
      })
      wx.setStorage({
        key: 'canplay',
        data: list,
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
          tenHeight: listHeight - 35,
        })
        console.log('songListH:',this.data.tenHeight)
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
    if (dis <= 0 || this.data.pageNo <= 1) {
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
  },
  // 触摸结束
  touchEnd: tool.throttle(function(e) {
    if (this.data.pageNo <= 1 || !this.showRefresh) {
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
  }, 2000),
  // touchEnd(e) {
    
  // },
  // 下拉结束后的处理
  async topHandle() {
    let pageNoName = this.data.pageNoName
    let idName = this.data.idName
    const data = await this.getData({ [pageNoName]: this.data.pageNo - 1, [idName]: this.data.optionId })
    const list = data.concat(this.data.canplay)
    this.setData({
      canplay: list,
      showLoadTop: false,
      scrollTop: 0,
      pageNo: this.data.pageNo - 1,
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