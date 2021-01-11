// import { getData } from '../../utils/httpOpt/httpOpt'
const app = getApp()
import utils from '../../utils/util'

Page({
  // mixins: [require('../../developerHandle/index')],
     // 开发者注入模板页面数据
     info: [],
     // 开发者注入模板标签数据
   
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    mainColor: app.globalData.mainColor,
    confirm: '',
    currentTap: 0,
    scrollLeft: 0,
    isFixed: false,
    reqS:false,
    reqL:false,
    labels: {
      show: true,
      data: []
    },

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
    setTimeout(() => {
      wx.checkSession({
        success:(res)=> {
          if(JSON.stringify(wx.getStorageSync('username'))) {
            wx.setTabBarItem({
              index: 2, 
              text: wx.getStorageSync('username'),
            })
          }
        },
        fail: (res) => {
          app.userInfo.token = ''
          app.userInfo.vipStatus = '';
          app.userInfo.expireTime = '';
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('username')
        }
      })
      
    }, 800);
    this.getCategoryAlbums()
  },
  onShow() {
   
   
    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  getCategoryAlbums(){
    let param = {
      'limit': 100
    }
    utils.GET(param,utils.categoryFroups,res=>{
      console.log('所有分类:',res)
      if(res.data.items.length >0 && res.statusCode == 200){
        let categoryArr = []
        for (let i = 0; i < res.data.items.length; i++) {
          let obj = Object()
          obj.id =  res.data.items[i].id
          obj.name = res.data.items[i].category_name
         
          categoryArr.push(obj)
          
        }
        this.getALLAlbums(categoryArr[0].id)
        this.setData({
          reqS:true,
          'labels.show':true,
          'labels.data':categoryArr,

        })
      }

    })
    
  },
  //分类下所有专辑
  getALLAlbums(categoryId){
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      'categoryId': categoryId,
      'excludedAlbumIds':'',
      'excludedOffset': 0,
'keywordId': 0,
'pageId': 1,
'pageSize': 100,
    }
    // let date = Date.parse(new Date())
    // console.log('时间:',date)
    utils.MGET(params,utils.allAlbums,res=>{
      wx.hideLoading()
      console.log('分类下所有专辑:',res)
  if(res.data.list.length >0 && res.statusCode == 200){
    let mediaArr = []
    for (let item of res.data.list) {
      mediaArr.push({
        id:item.albumId,
        title:item.title,
        src:item.pic,
        contentType:item.materialType,
        count:utils.calculateCount(item.playsCount),
        
        isVip : item.vipFreeType == 1?true:false

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
  //点击类目
  selectTap(e){
    console.log(e)

    this.setData({
      currentTap:e.currentTarget.dataset.index
    })
    this.getALLAlbums(e.currentTarget.dataset.groupid)

  },

   // 跳转到播放详情界面
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
  },
 
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  }
})