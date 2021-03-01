// import { getData } from '../../utils/httpOpt/httpOpt'
const app = getApp()
import utils from '../../utils/util'

Page({
  mixins: [require('../../developerHandle/index')],
  data: {
    emptyObj: {
      'title': '已经见底啦~~',
      'src': '/images/album_img_default.png'
    },
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    mainColor: app.globalData.mainColor,
    confirm: '',
    currentTap: 0,
    scrollLeft: 0,
    isFixed: false,
    swiperArr: [],
    // 开发者注入快捷入口数据
    lalyLtn: {
      show: true,
      data: [{
          icon: '/images/zjst.png',
          title: "最近收听",
          name: 'latelyListen',
          islogin: false
        },
        {
          icon: '/images/icon_collect.png',
          title: "我喜欢的",
          name: 'like',
          islogin: true
        }
      ],
    },
    // 开发者注入模板页面数据
    info: [],
    // 开发者注入模板标签数据
    labels: {
      show: true,
      // data: [{
      //   "name": "推荐",
      //   "id": 1
      // }, {
      //   "name": "精品",
      //   "id": 2
      // }, {
      //   "name": "潮流",
      //   "id": 3
      // }]
    },
    countPic: '/images/media_num.png',
    // 频道列表，内容列表数据标志变量
    reqS: true,
    reqL: false,
    canplay: [],
    audioManager: null,
    vipAlbumAudioIdArr: [],
  },
  // 页面后台数据(不参与渲染)
  pageData: {
    pageName: 'index',
    pageType: 'tab',
    pageLoaded: false,
    // 各频道列表页码，根据groupId获取
    pageNum: 1,
    hasNext: true,
  },
  scrollhandle(e) {
    if (e.detail.scrollLeft > 230) {
      this.setData({
        isFixed: true
      })
    } else {
      this.setData({
        isFixed: false
      })
    }

  },
  onLoad(options) {
    app.goAuthGetToken().then((res) => {
      // console.log('-------token',wx.getStorageSync('TOKEN'))
      // console.log('------------res:', res)
      // console.log('=======---------------------res:', res)
      this._swiperData()
      this._mediaArrData()

    });
  },

  //首页卡片数据
  _swiperData() {
    let param = {
      'banner_content_type': 2,
      'count': 10,
      'is_paid': 1,
      'scope': 0
    }
    utils.GET(param, utils.indexBanners, res => {
      // console.log('首页banners数据:', res)
      if (res.data.banners.length > 0 && res.statusCode == 200) {
        this.setData({
          swiperArr: res.data.banners
        })
      }

    })


  },

  clickHadle(e) {
    console.log('播放全部专辑', e)
    console.log('播放全部专辑', e.currentTarget.dataset.isvip)

    let isVip = e.currentTarget.dataset.isvip
    let albumid = e.detail.typeid
    let albumName = e.target.dataset.title
    wx.setStorageSync('abumInfoName', albumName)
    if (isVip) {
      //Vip专辑
      this.VipAlbumGetAudioId(albumid)
    } else {
      //非Vip专辑
      this.getAllList(albumid)
      // 获取播放卡片
      let abumInfoId = wx.getStorageSync('abumInfoId')
      let oldStory = this.selectComponent(`#story${abumInfoId}`)
      let story = this.selectComponent(`#story${albumid}`)
      // 清空上一专辑状态
      if (oldStory) {
        oldStory.setData({
          playing: false
        })
      }
      // 设置当前专辑状态
      story.setData({
        abumInfoId: albumid,
        playing: true
      })
      wx.setStorageSync('abumInfoId', albumid)

    }
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
      console.log('专辑列表所有数据:', res)
      if (res.data && res.statusCode == 200) {
        for (let item of res.data.items) {
          // console.log(item)
          that.data.canplay.push({
            title: item.title, // 歌曲名称
            id: item.id, // 歌曲Id
            dt: this.formatMusicTime(item.duration), // 歌曲的时常
            coverImgUrl: item.image.url, // 歌曲的封面
             src: '',
            feeType: item.is_vip_free,
            mediaType: item.announcer.nickname,
            mediaAuthor: item.album.title,
            authorId: item.announcer.id,
            albumId: item.album_id
          })


        }
        that.getVipAudioInfo().then((res) => {
          console.log('------------------------:', res)
          this.data.canplay = res
          wx.setStorageSync('canplay', this.data.canplay)
          wx.setStorageSync('allList', this.data.canplay)
          wx.setStorageSync('nativeList', this.data.canplay)
          //minibar  播放
          app.globalData.canplay = JSON.parse(JSON.stringify(this.data.canplay))
          app.globalData.songInfo = app.globalData.canplay[0]
          wx.setStorageSync('playing', true)
          wx.setStorageSync('songInfo', app.globalData.canplay[0])
          this.selectComponent('#miniPlayer').watchPlay()
          app.playing(this)
        })

      }

    })
  },
  //vip音频数据
  getVipAudioInfo() {
    var that = this
    return new Promise(function (resolve, reject) {
      for (let item of that.data.canplay) {
        let param = {}
        utils.PLAYINFOGET(param, utils.getMediaInfo + item.id + '/play-info', res => {
          console.log('res:', res) 
          item.src = res.data.play_24_aac.url
          resolve(that.data.canplay)
        })
      }
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
      // console.log('专辑列表所有数据:', res)
      if (res.data && res.statusCode == 200) {

        for (let item of res.data.items) {
          // console.log(item)
          this.data.canplay.push({
            title: item.title, // 歌曲名称
            id: item.id, // 歌曲Id
            dt: this.formatMusicTime(item.duration), // 歌曲的时常
            coverImgUrl: item.image.url, // 歌曲的封面
            src: item.play_info.play_64.url,
            feeType: item.is_vip_free,
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
        this.selectComponent('#miniPlayer').watchPlay()
        app.playing(this)
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
  //首页音频列表
  _mediaArrData() {
    var that = this
    let param = {
      'limit': 20
    }
    utils.GET(param, utils.indexMediaArr, res => {
      // console.log('首页音频数据:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {

        let mediaArr = []
        for (let item of res.data.items) {
          mediaArr.push({
            id: item.album.id,
            allTitle: item.album.title,
            title: that.cutStr(item.album.title),
            src: item.album.cover.middle.url,
            contentType: item.album.kind,
            count: utils.calculateCount(item.album.play_count),
            isVip: item.album.is_vip_free,
            isHome: true

          })
        }
        // console.log('arr', mediaArr)
        mediaArr.push(this.data.emptyObj)

        that.setData({
          reqL: true,
          info: mediaArr
        })
        // this.getAllList(this.data.info[0].id)
      }

    })


  },
  //截取字符
  cutStr(str) {
    str = str.replace(/\s/g, "")
    // console.log('str',str,str.length)
    var newStr
    if (str.length < 16) {
      newStr = str

    } else {
      newStr = str.substring(0, 16) + '...'
    }
    // console.log('newStr:',newStr)
    return newStr

  },

  //点击指示点切换 
  chuangEvent: function (e) {
    console.log('点击指示点切换:', e)

    this.setData({
      swiperCurrent: e.currentTarget.id
    })
  },
  bannerClick(e) {
    console.log('banner切换:', e.currentTarget.dataset.item)
    let item = e.currentTarget.dataset.item
    let id = item.banner_content_id
    let title = item.banner_content_title
    wx.navigateTo({
      url: '../abumInfo/abumInfo?id=' + id + '&routeType=album' + '&title=' + title + '&from=1'
    })

  },


  // 跳转到播放界面
  linkAbumInfo(e) {
    // console.log('专辑列表:', e)

    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype

    if (!app.globalData.latelyListenId.includes(id)) {
      app.globalData.latelyListenId.push(id)
    }
    let url
    if (routeType === 'album' || routeType === 'fm') {
      url = `../abumInfo/abumInfo?id=${id}&title=${title}&routeType=${routeType}&type=2`
    } else if (routeType === 'media') {
      url = `../playInfo/playInfo?id=${id}`
    }

    wx.navigateTo({
      url: url
    })
    // 先清除其他story播放状态
    let abumInfoId = wx.getStorageSync('abumInfoId')
    let oldStory = this.selectComponent(`#story${abumInfoId}`)
    // console.log('oldStory---------------------------------------', oldStory.data)
    // 清空上一专辑状态
    if (oldStory) {
      oldStory.setData({
        playing: false
      })
    }
  },
  //轮播图的切换事件 
  swiperChange: function (e) {
    // console.log('轮播图的切换事件:',e.detail.current)
    //   this.setData({
    //   swiperCurrent: e.detail.current
    //   })
    //   if(this.data.swiperCurrent == 2){
    //     this._swiperDatatwo()
    //   }
  },

  //我的收藏
  like() {
    if (!wx.getStorageSync('USERINFO') || app.userInfo.islogin == false) {
      wx.showToast({
        icon: 'none',
        title: '请登录后进行操作'
      })
      return;
    }
    wx.navigateTo({
      url: '../like/like'
    })
  },
  // 最近播放
  tolatelyListen(e) {
    if (!wx.getStorageSync('USERINFO') || app.userInfo.islogin == false) {
      wx.showToast({
        icon: 'none',
        title: '请登录后进行操作'
      })
      return;
    }

    wx.navigateTo({
      url: '../latelyListen/latelyListen'
    })
  },

  selectTap(e) {
    const index = e.currentTarget.dataset.index
    const name = e.currentTarget.dataset.name
    this.setData({
      currentTap: index
    })
    wx.showLoading({
      title: '加载中',
    })
    // 这里可以自定义传值传到_getList中
    this._getList(name)
  },

  onShow() {
    // 首页数据

    // console.log('index---onshow:')
    // console.log('index---onshow:')


    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
    // 获取播放卡片
    let abumInfoId = wx.getStorageSync('abumInfoId')
    let story = this.selectComponent(`#story${abumInfoId}`)
    let playing = wx.getStorageSync('playing')
    // 设置当前专辑状态
    if (story) {
      // console.log('story.data', story.data)
      story.setData({
        abumInfoId: abumInfoId,
        playing: playing
      })
    }




  },


  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  }
})