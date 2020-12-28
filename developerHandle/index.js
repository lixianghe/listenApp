/**
 * @name: index
 * 开发者编写的首页index,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * labels: {
 *     show: false,
 *     data: [{
 *       "name": "推荐",
 *       "id": 1
 *     }, {
 *       "name": "精品",
 *       "id": 2
 *     }, {
 *       "name": "潮流",
 *       "id": 3
 *     }]
 *   },
 * 可选内容，当show为false时不显示分类列表
 * 2、_getList函数，这里我们给开发者提供labels对应点击的的值，其余参数开发者自行添加；
 *    _getList函数获取的list最终转换为模板需要的字段，并setData给info。
 * 3、由于模板内的字段名称可能和后台提供不一样，在获取list后重新给模板内的字段赋值：如下以本页列表数据为例
 * list.map((item, index) => {
 *     item.title = item.mediaName                               // 歌曲名称
 *     item.id = item.mediaId                                    // 歌曲Id
 *     item.src = item.coverUrl                                  // 歌曲的封面
 *     item.contentType = 'album'                                // 类别（例如专辑或歌曲）
 *     item.isVip = true                                         // 是否是会员
 *   })
 * 这里做了下数据字段的转换
 * 
 * 4、配置页面的快捷入口
 * lalyLtn：[
 *     {icon: '/images/zjst.png', title: "最近收听", name: 'latelyListen', islogin:false},
 *   ]
 *  可选内容，当show为false时不显示分类列表,数量 1~2个
 */
const app = getApp()
import utils from '../utils/util'

module.exports = {
  data: {
    swiperArr:[],
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
      }],
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
  onShow() {

  },
  onLoad(options) {
    // 首页数据
     this._swiperData()
     this._mediaArrData()
    //  this._getList()
  },
  onReady() {

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
  //首页卡片数据
  _swiperData(){
    let param = {
      'banner_content_type':2,
      'count':10,
      'is_paid':1,
      'scope':0
    }
    utils.GET(param,utils.indexBanners,res=>{
      console.log('首页banners数据:',res)
      if(res.data.banners.length >0 && res.statusCode == 200){
        this.setData({
          swiperArr:res.data.banners
        })
      }

    })
     

  },
  //首页音频列表
  _mediaArrData(){
    let param = {
      'limit': 20
    }
    utils.GET(param,utils.indexMediaArr,res=>{
      console.log('首页音频数据:',res)
      if(res.data.items.length >0 && res.statusCode == 200){
        // id: 962,
        // title: "内容标题1",
        // src: "https://cdn.kaishuhezi.com/kstory/story/image/2af5072c-8f22-4b5d-acc2-011084c699f8_info_w=750_h=750_s=670433.jpg",
        // contentType: "media",
        // count: 0,
        // isVip: false
        let mediaArr = []
        for (let item of res.data.items) {
          mediaArr.push({
            id:item.album.id,
            title:item.album.title,
            src:item.album.cover.middle.url,
            contentType:item.album.kind,
            count:item.album.play_count,
             isVip:item.album.is_vip_free

          })
        }  
        // console.log('arr',mediaArr)
        this.setData({
          reqL: true,
          info: mediaArr
        })
      }

    })
    

  },
  _getList(name) {
    setTimeout(() => {
      wx.hideLoading()
      let data = [{
        id: 958,
        title: "内容标题1",
        src: "https://cdn.kaishuhezi.com/kstory/ablum/image/389e9f12-0c12-4df3-a06e-62a83fd923ab_info_w=450&h=450.jpg",
        contentType: "album",
        count: 17,
        isVip: true
      },
      {
        id: 959,
        title: "内容标题2",
        src: "https://cdn.kaishuhezi.com/kstory/ablum/image/f20dda35-d945-4ce0-99fb-e59db62ac7c9_info_w=450&h=450.jpg",
        contentType: "album",
        count: 13,
        isVip: true
      },
      {
        id: 960,
        title: "内容标题3",
        src:  "https://cdn.kaishuhezi.com/kstory/ablum/image/7b0fe07a-e036-4d93-a8ab-bf6ad2b5a390_info_w=450&h=450.jpg",
        contentType: "album",
        count: 10,
        isVip: true
      },
      {
        id: 961,
        title: "内容标题4",
        src: "https://cdn.kaishuhezi.com/kstory/ablum/image/0816edeb-f8b0-4894-91ad-ab64e1b72549_info_w=450&h=450.jpg",
        contentType: "album",
        count: 19,
        isVip: false

      },
    
      {
        id: 962,
        title: "内容标题1",
        src: "https://cdn.kaishuhezi.com/kstory/story/image/2af5072c-8f22-4b5d-acc2-011084c699f8_info_w=750_h=750_s=670433.jpg",
        contentType: "media",
        count: 0,
        isVip: false
      }]
      let info = data.map(item => {
        //  item.title = `${name}-${item.title}`
        // item.title = item.title

        return item
      })
      this.setData({
        reqL: true,
        info: info
      })
    }, 500)
  },

   //轮播图的切换事件 
//  swiperChange: function (e) {
// console.log('轮播图的切换事件:',e.detail.current)
//   this.setData({
//   swiperCurrent: e.detail.current
//   })
//   },
  //点击指示点切换 
  chuangEvent: function (e) {
    console.log('点击指示点切换:',e)

  this.setData({
  swiperCurrent: e.currentTarget.id
  })
  },
  bannerClick(e){
    console.log('banner切换:',e.currentTarget.dataset.item)
    let item = e.currentTarget.dataset.item
    let id = item.banner_content_id
    wx.navigateTo({
       url :'../abumInfo/abumInfo?id='+id+'&routeType=album'
    })

  },
 
  // 跳转到快捷入口页面
  tolatelyListen(e) {
    let page = e.currentTarget.dataset.page
    wx.navigateTo({
      url: `../${page}/${page}`
    })
  },
  // 跳转到播放界面
  linkAbumInfo(e) {
    console.log('专辑列表')

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
      url = `../abumInfo/abumInfo?id=${id}&title=${title}&routeType=${routeType}`
    } else if (routeType === 'media') {
      url = `../playInfo/playInfo?id=${id}`
    }

    wx.navigateTo({
      url: url
    })
  }
}