// import { getData } from '../../utils/httpOpt/httpOpt'
const app = getApp()
import utils from '../../utils/util'

Page({
  // mixins: [require('../../developerHandle/index')],
  // 开发者注入模板页面数据
  info: [],
  // 开发者注入模板标签数据

  data: {
    total:0,
    info:[],
    emptyObj:{'title':'已经见底啦~~','src':'/images/album_img_default.png'},
     categoryId:'',
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    mainColor: app.globalData.mainColor,
    confirm: '',
    currentTap: 0,
    pageNub:0,
    scrollLeft: 0,
    isFixed: false,
    reqS: false,
    reqL: false,
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
  
    this.getCategoryAlbums()
  },
  onShow() {


    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  getCategoryAlbums() {
    let param = {
      'limit': 50
    }
    utils.GET(param, utils.categoryFroups, res => {
      console.log('所有分类:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {
        let categoryArr = []
        for (let i = 0; i < res.data.items.length; i++) {
          if(res.data.items[i].id != 95){
            //因为95(播客)类型的没有数据就不要此分类
            let obj = Object()
            obj.id = res.data.items[i].id
            obj.name = res.data.items[i].category_name
  
            categoryArr.push(obj)
          }
         

        }

        this.data.categoryId = categoryArr[0].id
        this.getALLAlbums(categoryArr[0].id)
        this.setData({
          reqS: true,
          'labels.show': true,
          'labels.data': categoryArr,
         

        })
        // wx.pageScrollTo({
        //   scrollTop:0,
        //   duration: 0,
        // })
      

      }

    })

  },
  moredata(){
    console.log('获取更多数据')
    this.data.pageNub+=10
    
     this.getALLAlbums(this.data.categoryId)

  },
  //分类下所有专辑
  getALLAlbums(categoryId) {
    console.log('categoryId:',categoryId)
    var that = this
    wx.showLoading({
      title: '加载中...',
    })
    let params = {
      'metadata_attributes': '',
      'only_paid': false,
      'offset': that.data.pageNub,
      'limit': 10,
      'sort': 'asc',
     
    }
    // let date = Date.parse(new Date())
    // console.log('时间:',date)
    utils.CATEGORYDETAILSGET(params, 'iot/openapi-smart-device-api/v2/album-categories/'+categoryId+'/metadata-albums', res => {
      wx.hideLoading()
      console.log('分类下所有专辑:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {  
        // let mediaArr = []
        that.data.total = res.data.total
        console.log('专辑总数:', that.data.total)
        for (let item of res.data.items) {
          // console.log('----------',item)
          that.data.info.push({
            id: item.id,
            allTitle:item.title,
            title:that.cutStr(item.title) ,
            src:app.impressImg(item.cover.middle.url,100,100) ,
            contentType: item.kind,
            count: utils.calculateCount(item.play_count),
            isVip: item.is_vip_free

          })
        }
        //  console.log('arr',mediaArr)
        if(that.data.total == that.data.info.length){
         that.data.info.push(this.data.emptyObj)

        }
        that.setData({
          reqL: true,
          info: that.data.info,
          // scrollLeft:0
        })
      }else{
       
      }
    })




  },
  //截取字符
  cutStr(str){
    str = str.replace(/\s/g, "")
    // console.log('str',str,str.length)
    var newStr
    if(str.length<18){
      newStr = str

    }else{
      newStr = str.substring(0,18)+'...'
    }
    // console.log('newStr:',newStr)
    return newStr

  },

  //点击类目
  selectTap(e) {
    console.log('切换频道:', e)
    let intervalTime = 500
    let nowTime = new Date().getTime()
    console.log('nowTime:', nowTime)
    console.log('lastTime:', this.data.lastTime)
    if (nowTime - this.data.lastTime > intervalTime || !this.data.lastTime) {
      console.log('大于间隔秒数')
      this.data.lastTime = nowTime;
      console.log('lastTime:', this.data.lastTime)
      this.setData({
        currentTap: e.currentTarget.dataset.index,
        info:[],
      //  scrollLeft:0
      })
     
      this.data.categoryId =e.currentTarget.dataset.groupid

      this.getALLAlbums(e.currentTarget.dataset.groupid)
    } else {
      console.log('小于间隔秒数')
    }


  },

  // 跳转到播放详情界面
  linkAbumInfo(e) {
    console.log('专辑列表:',e)

    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype
    console.log('title:',title)
    let url = `../abumInfo/abumInfo?id=${id}&title=${title}&routeType=${routeType}`

    wx.navigateTo({
      url: url
    })
  },

  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  }
})