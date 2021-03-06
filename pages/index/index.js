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
    focusIndex:5,
    allPlayIndex:-1,
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
   
    // 首页数据    
    app.goAuthGetToken().then((res) => {
      // console.log('-------token',wx.getStorageSync('TOKEN'))
      // console.log('=======---------------------res:', res)
      this._swiperData()
      this._mediaArrData()

    });

  },

  //首页轮播图数据
  _swiperData() {
    let param = {
      'banner_content_type': 2,
      'count': 8,
      'is_paid': 1,
      'scope': 0
    }
    utils.GET(param, utils.indexBanners, res => {
        // app.log('首页banners数据:', res)
      if (res.data.banners.length > 0 && res.statusCode == 200) {
        res.data.banners.forEach(item => {
          item.banner_cover_url = app.impressImg(item.banner_cover_url,690,280)
        //  console.log('-----------item.url:',item.banner_cover_url )
          
        });
        this.setData({
          swiperArr: res.data.banners
        })
      }

    })


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

  
//播放全部专辑
  clickHadle(e) {
    console.log('播放全部专辑', e)
    console.log('playing', wx.getStorageSync('playing'))

    let idx = e.target.dataset.no
    if(this.data.allPlayIndex != idx){
        console.log("不相等");
        // if(wx.getStorageSync('playing') && this.data.allPlayIndex != -1){
        //   console.log("555555");
        //   app.stopmusic();

        // }
        this.data.allPlayIndex = idx
        let isVip = e.target.dataset.isvip
        let albumid = e.detail.typeid
        this.getSongifCollect(albumid)
        let albumName = e.target.dataset.title
        wx.setStorageSync('abumInfoName', albumName)
        if (isVip) {
          //Vip专辑
          this.VipAlbumGetAudioId(albumid)
        } else {
          //非Vip专辑
          this.getAllList(albumid)
        }
         // 获取播放卡片
         let abumInfoId = wx.getStorageSync('abumInfoId')
         let oldStory = this.selectComponent(`#story${abumInfoId}`)
         let story = this.selectComponent(`#story${albumid}`)
         console.log('oldStory:',oldStory)
         console.log('story:',story)

         // 清空上一专辑状态
         if (oldStory && oldStory !=null) {
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
     
     
    }else{
      console.log('1111111')

      this.data.allPlayIndex = idx

      if( wx.getStorageSync('playing')){
        console.log("暂停播放");
      
        app.stopmusic();
       }else{
  
        console.log('22222')

      let isVip = e.target.dataset.isvip
      let albumid = e.detail.typeid
      this.getSongifCollect(albumid)
      let albumName = e.target.dataset.title
      wx.setStorageSync('abumInfoName', albumName)
      if (isVip) {
        //Vip专辑
        this.VipAlbumGetAudioId(albumid)
  
      } else {
        //非Vip专辑
        this.getAllList(albumid)
      }
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
        app.globalData.albumLength = res.data.total
        wx.setStorageSync('albumLength', res.data.total)
        for (let item of res.data.items) {
          // console.log(item)
          that.data.canplay.push({
            title: item.title, // 歌曲名称
            id: item.id, // 歌曲Id
            dt: this.formatMusicTime(item.duration), // 歌曲的时常
            coverImgUrl: item.image.url, // 歌曲的封面
             src: item.play_info.play_24_m4a.url,
            feeType: item.is_vip_free,
            mediaType: item.announcer.nickname,
            mediaAuthor: item.album.title,
            authorId: item.announcer.id,
            albumId: item.album_id,
            albumName:item.album.title
          })


        }
        // that.getVipAudioInfo().then((res) => {
        //   console.log('------------------------:', res)
        //   this.data.canplay = res
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
        //  })

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
        })
      }
      resolve(that.data.canplay)

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
    let vipIdArr = [];
    let _list = [];
    utils.GET(param, utils.albumAllmedias + albumid + '/tracks', res => {
       console.log('专辑列表所有数据:', res)
      if (res.data && res.statusCode == 200) {
        app.globalData.albumLength = res.data.total
        wx.setStorageSync('albumLength', res.data.total)

        for (let item of res.data.items) {
          // console.log(item)
          _list.push({
            title: item.title, // 歌曲名称
            id: item.id, // 歌曲Id
            dt: this.formatMusicTime(item.duration), // 歌曲的时常
            coverImgUrl: item.image.url, // 歌曲的封面
            src: item.play_info.play_64.url,
            feeType: item.is_vip_free,
            mediaType: item.announcer.nickname,
            mediaAuthor: item.announcer.nickname,
            authorId: item.announcer.id,
            albumId: item.album_id, 
            albumName:item.album.title

          })
        }
        for (var i = 0; i < _list.length; i++) {
          if (!_list[i].src) {
            vipIdArr.push(_list[i].id);
          }
        }
        if (app.globalData.isVip && vipIdArr.length) {
          that.returnVipMediaUrl(_list, vipIdArr).then((resList) => {
            console.log(resList);
         wx.setStorageSync('canplay', resList)
        wx.setStorageSync('allList', resList)
        wx.setStorageSync('nativeList', resList)
        //minibar  播放
        app.globalData.canplay = JSON.parse(JSON.stringify(resList))
        app.globalData.songInfo = app.globalData.canplay[0]
        // wx.setStorageSync('playing', true)
        wx.setStorageSync('songInfo', app.globalData.canplay[0])
        console.log('是否收藏:',  wx.getStorageSync('ALBUMISCOLLECT'))
       

        app.playing(this)
         this.selectComponent('#miniPlayer').setOnShow()
            resolve();
          });
        } else {
          wx.setStorageSync('canplay', _list)
          wx.setStorageSync('allList', _list)
          wx.setStorageSync('nativeList', _list)
          //minibar  播放
          app.globalData.canplay = JSON.parse(JSON.stringify(_list))
          app.globalData.songInfo = app.globalData.canplay[0]
          // wx.setStorageSync('playing', true)
          wx.setStorageSync('songInfo', app.globalData.canplay[0])
          console.log('是否收藏:',  wx.getStorageSync('ALBUMISCOLLECT'))
         
  
          app.playing(this)
           this.selectComponent('#miniPlayer').setOnShow()
        }

      
      }else{

      }

    })
  },
    //返回vip音频的url
    returnVipMediaUrl(_list, vipIdArr) {
      let promiseArr = vipIdArr.map((item) => {
        return new Promise((reslove, reject) => {
          utils.PLAYINFOGET({}, utils.getMediaInfo + item + "/play-info",
            (res) => {
              if (res.data && res.statusCode == 200) {
                reslove(res.data);
              } else {
                reject(res);
              }
            }
          );
        });
      });
      return new Promise((reslove, reject) => {
        Promise.all(promiseArr).then((res) => {
            _list.forEach((item) => {
              vipIdArr.forEach((i, index) => {
                if (JSON.parse(item.id) == i && !item.src) {
                  item.src = res[index].play_24_aac.url;
                }
              });
            });
            reslove(_list);
          })
          .catch((err) => {
            reject(err);
          });
      });
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
       console.log('首页音频数据:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {

        let mediaArr = []
        for (let item of res.data.items) {
          mediaArr.push({
            id: item.album.id,
            allTitle: item.album.title,
            title: that.cutStr(item.album.title),
          
             src: app.impressImg(item.album.cover.large.url,280,280),
            contentType: item.album.kind,
            count: utils.calculateCount(item.album.play_count),
            isVip: item.album.is_vip_free,
            isHome: true,
            collect:item.album.is_subscribe

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
      url: '../albumInfo/albumInfo?id=' + id + '&routeType=album' + '&title=' + title + '&from=1'
    })

  },


  // 跳转到播放界面
  linkAbumInfo(e) {
    

    let id = e.currentTarget.dataset.id
   console.log('专辑id:', id)
    if(id){
      const src = e.currentTarget.dataset.src
      const title = e.currentTarget.dataset.title
      wx.setStorageSync('img', src)
      const routeType = e.currentTarget.dataset.contentype
  
      if (!app.globalData.latelyListenId.includes(id)) {
        app.globalData.latelyListenId.push(id)
      }
     
      wx.navigateTo({
        url: `../albumInfo/albumInfo?id=${id}&title=${title}&routeType=${routeType}&type=2`
      })
    }else{

    }

    
    // let url
    // if (routeType === 'album' || routeType === 'fm') {
    //   url = `../albumInfo/albumInfo?id=${id}&title=${title}&routeType=${routeType}&type=2`
    // } else if (routeType === 'media') {
    //   url = `../playInfo/playInfo?id=${id}`
    // }

   
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

  // 重新加载
  refresh: function () {
 console.log('重新加载')
   
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

    this.selectComponent('#miniPlayer').setOnShow()
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
  }
})