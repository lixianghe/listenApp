// import { getData } from '../../utils/httpOpt/httpOpt'
const app = getApp()

Page({
  mixins: [require('../../developerHandle/index')],
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    mainColor: app.globalData.mainColor,
    confirm: '',
    currentTap: 0,
    scrollLeft: 0,
    isFixed: false,
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
  },
  onShow() {
    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  }
})