/**
 * @name: personalCenter
 * 开发者编写的最近收听latelyListen,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * 1、userInfo: {
 *     avatar: '',
 *     nickname: '',
 *  }
 *  用户信息，模板只列出头像和昵称，开发者可自行根据需要新增参数
 * 2、data: [{
 *     method: 'order',
 *     icon: '/images/my_buy.png',
 *     title: '开通/续费会员'
 *   }, {
 *     method: 'like',
 *     icon: '/images/mine_like.png',
 *     title: '我喜欢的' 
 *   }]
 *  其他入口，配置入口点击事件方法名，入口图标，入口名称；入口数量开发者根据项目需要配置
 */
const app = getApp()


module.exports = {
  data: {
    // 是否登录
    isLogin: false,
    showWxLogin: true,
    // 开发者注入模板用户信息
    userInfo: {
      avatar: '',
      nickname: '用户',
    },
    // 开发者注入模板其他入口
    data: [{
      method: 'order',
      icon: '/images/my_buy.png',
      title: '开通/续费会员'
    }, {
      method: 'like',
      icon: '/images/mine_like.png',
      title: '我喜欢的' 
    }, {
      method: 'latelyListen',
      icon: '/images/latelyListen.png',
      title: '最近收听' 
    }, {
      method: 'myBuy',
      icon: '/images/vip.png',
      title: '我购买的'
    }]
  },
  onShow() {

  },
  onLoad(options) {
  },
  onReady() {

  },

  /**
   * 登录
   */
  loginIn(event) {

    wx.login({
      success: (loginRes) => {
        this.setData({
          showWxLogin: false
        })
      },
      fail: (err) => {
        console.log('扫码失败', JSON.stringify(err))
      },
      complete: (res) => {

      }
    })
  },
  getUserInfo() {
    const that = this
    wx.getUserInfo({
      success: res => {
        let obj = {
          nickname: res.userInfo.nickName,
          avatar: res.userInfo.avatarUrl
        }
        console.log(res.userInfo)
        console.log(obj)
        that.setData({
          userInfo: obj,
          isLogin: true
        })
      },
      fail: err => {
        console.log('error !'+err)
      },
      complete: com => {
        console.log('complete!'+com)
      }
    })
  },

  logoutTap(){
    let obj = {
      nickname: '',
      avatar: ''
    }
    this.setData({
      userInfo: obj,
      isLogin: false
    })
  },

  order() {
    if (!app.userInfo || !app.userInfo.token) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    wx.navigateTo({ url: '../member/member' })
  },
  like() {
    wx.navigateTo({ url: '../like/like' })
  },
  latelyListen() {
    wx.navigateTo({ url: '../latelyListen/latelyListen' })
  },
  myBuy() {
    wx.navigateTo({ url: '../myBuy/myBuy' })
  },
}