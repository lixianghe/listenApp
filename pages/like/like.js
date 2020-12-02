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
    retcode: 1,
    mainColor: app.globalData.mainColor
  },
  screen: app.globalData.screen,
  
  like (e) {
    if(e.detail.contentType === 'album') {
      this.likeAbum(e.detail.flag, e.detail.typeid)
    } else if(e.detail.contentType === 'media') {
      this.likeMedia(e.detail.flag, e.detail.typeid)
    }
  },
  likeAbum(flag, id) {
    if (flag) {
      albumFavoriteCancel({albumId: id}).then(res => {
        wx.showToast({ icon: 'none', title: '取消收藏成功' })
        this.setData({
          existed: false
        })
      })
    } else {
      albumFavoriteAdd({albumId: id}).then(res => {
        wx.showToast({ icon: 'none', title: '收藏成功' })
        this.setData({
          existed: true
        })
      })
    }

    
  },
  likeMedia (flag, id) {
    if (flag) {
      mediaFavoriteCancel({mediaId: id}).then(res => {
        wx.showToast({ icon: 'none', title: '取消收藏成功' })
        that.setData({
          existed: false
        })
      })
    } else {
      mediaFavoriteAdd({mediaId: id}).then(res => {
        wx.showToast({ icon: 'none', title: '收藏成功' })
        that.setData({
          existed: true
        })
      })
    }
  },
 
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