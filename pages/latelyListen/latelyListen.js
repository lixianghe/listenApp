const app = getApp()
Page({
  mixins: [require('../../developerHandle/latelyListen')],
  data: {
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    info: '',
    currentTap: 0,
    scrollLeft: 0,
    
    mainColor: app.globalData.mainColor,
    // info: [{'contentType':'album','id':'121212','perceent':'3.33223','src':'sdsdsds','title':'熬婿'},
    // {'contentType':'album','id':'121212','perceent':'3.33223','src':'sdsdsds','title':'鬼谷子的智慧谋略'},
    // {'contentType':'album','id':'121212','perceent':'3.33223','src':'sdsdsds','title':'总有这样的歌只想一个人听'},
    // {'contentType':'album','id':'121212','perceent':'3.33223','src':'sdsdsds','title':'刘亦菲-开席了宋朝饭局'}]
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