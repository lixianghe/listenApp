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

  showExisted(e){
   
    var isCollect = e.detail
    var  id = wx.getStorageSync('songInfo').albumId
    console.log('like---existed:',e.detail)
    console.log('like---existed---id:',id)
     console.log('like---existed---songInfo:', wx.getStorageSync('songInfo'))
    console.log('like---existed---info:',this.data.info)
   
    for (let i = 0; i < this.data.info.length; i++) {
      if(this.data.info[i].id == id){
       this.data.info[i].isCollect = isCollect
       
      }
      
    }
    this.setData({
      info:this.data.info
    })



},
 
  onShow() {
    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  }
})