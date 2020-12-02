
import tool from '../../utils/util'
const app = getApp()
let searchMixin = require('../../developerHandle/search')
Page({
  mixins: [searchMixin],
  data: {
    
    screen: app.globalData.screen,
    noContent: '/images/nullContent.png',
    info: [],
    currentTap: 0,
    scrollLeft: 0,
    picWidth: '33vh',
    showMInibar: true,
    times: 1,
    mainColor: app.globalData.mainColor,
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
  },
  onLoad() {
    this.setData({
      times: ((wx.getSystemInfoSync().screenHeight)/ 100)
    })
  },
  onShow() {
    this.selectComponent('#miniPlayer').setOnShow()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  },
  // 函数节流防止请求过多
  search: tool.throttle(function (e) {
    this.setData({keyWord: e[0].detail.value})
    setTimeout(() => {
      this.getData(this.data.currentTap)
    })
  }, 200),
  cancel() {
    this.setData({
      keyWord: null,
      info: []
    })
  },
  selectTap(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTap: index
    })
    this.getData(index)
  },
  // 跳转到播放详情界面
  linkAbumInfo (e) {
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype
    let url
    if (routeType === 'album') {
      url = `../abumInfo/abumInfo?id=${id}&title=${title}`
    } else if (routeType === 'media') {
      url = `../playInfo/playInfo?id=${id}`
    } 
    wx.navigateTo({
      url: url
    })
  },
  getData(index) {
    this.getSearch(this.data.labels[index].value)
  },
  getSearch(type) {
    let params = {
      label: type,
      keyWord: this.data.keyWord
    }
    this._getList(params)
    
  },
  focus() {
    this.setData({showMInibar: false})
  },
  blur() {
    this.setData({showMInibar: true})
  }
})