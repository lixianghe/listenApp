import { albumFavoriteCancel,albumFavoriteAdd,mediaFavoriteCancel,mediaFavoriteAdd } from '../../utils/httpOpt/api'
const app = getApp()
Page({
  mixins: [require('../../developerHandle/like')],
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    noContent: '/images/nullContent.png',
    info: '',
    currentTap: 0,
    scrollLeft: 0,
    mainColor: app.globalData.mainColor
  },
  screen: app.globalData.screen,
 
  onLoad(options) {
    
  },
  onShow() {
    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  }
})