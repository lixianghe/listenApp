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
import utils from '../utils/util'


module.exports = {
  data: {
    iv: '',
    encryData: '',
    code: '',
    // 是否登录
    isLogin: null,
    // 开发者注入模板用户信息
    userInfo: {
      avatar: '',
      nickname: '',
    },
    // 开发者注入模板其他入口
    data: [{
      method: 'latelyListen',
      icon: '/images/latelyListen.png',
      title: '最近播放'
    }, {
      method: 'like',
      icon: '/images/mine_like.png',
      title: '我的收藏'
    }, {
      method: 'myBuy',
      icon: '/images/vip.png',
      title: '我的已购'
    }]
  },

  onLoad(options) {
    var that = this
   app.log('user-------------onload-----:')
    // if (app.globalData.isTaiAccountChange) {
    //   if (that.data.openId) {
    //     app.log("---------getUserInfo")
    //     that.getUserInfo()
    //   } else {
    //     app.log("-----fromCodeGetOpenid")
    //     //请求接口
    //     that.fromCodeGetOpenid()
    //   }

    // } else {
    //   app.log("-----exit")
    //   that.logoutTap()
    // }

    if (wx.canIUse('onTaiAccountStatusChange')) {
      wx.onTaiAccountStatusChange(function (res) {
        app.log("---onTaiAccountStatusChange--", res)
        if (res.isLoginUser) { // 有登录，记录数据
          app.log("---dispatch--codeLoginNew")
          if (that.data.openId) {
            that.getUserInfo()
          } else {
            app.log('getPhoneNumber--------------------code:', that.data.code)
            //请求接口
            that.fromCodeGetOpenid()
          }
        } else { // 有登出，清除数据
          app.log("---dispatch--exit")
          that.logoutTap()
        }
      })
    } else {
      app.log('不支持-----------------onTaiAccountStatusChange')
    }




  },
  onShow() {
    var that = this
    that.getCode()
    app.log('personcenter----------onshow')
    that.data.openId = wx.setStorageSync('OPENID')
    let currentTime = new Date().getTime()
    let deadline = wx.getStorageSync('TOKEN').deadline
    if (currentTime < deadline) {
      app.log('未过期----------onshow')
      //未过期
      let userInfo = wx.getStorageSync('USERINFO')
      app.log('未过期----------userInfo', userInfo)
      if (userInfo) {
        that.setData({
          isLogin: true,
          userInfo: userInfo
        })
      } else {
        that.setData({
          isLogin: false
        })
      }

    } else {
      //过期
      app.log('过期----------onshow')
      that.setData({
        isLogin: false
      })

    }





  },
  //获取code
  getCode() {
    // return new Promise((resolve, reject) => {
    app.log('--------------开始获取code')

    wx.login({
      success: (res) => {
        app.log('第一次code:', res)
        this.data.code = res.code
        app.log('第一次code:', this.data.code)

      },
      fail: (err) => {
        app.log('获取code失败：', err)
        wx.login({
          success: (res) => {
            this.data.code = res.code
            app.log('第二次code:', this.data.code)

          },
          fail: (err) => {
            app.log('获取code失败：', err)
          },

        })
      },

    })

    // })


  },

  onReady() {

  },

  //登录
  getPhoneNumber(e) {
    var that = this
    app.log('--手机号登录---getPhoneNumber', e)
    if (!e.detail.iv) {
      //用户点击拒绝
      app.log('用户未授权')
    } else {
      this.data.iv = e.detail.iv
      this.data.encryData = e.detail.encryptedData
      wx.showLoading({
        title: '登录中...',
      })
      app.log('--openId', this.data.openId)
      if (that.data.openId) {
        that.getUserInfo()
      } else {
        app.log('getPhoneNumber--------------------code:', that.data.code)
        //请求接口
        that.fromCodeGetOpenid()
        // })

      }
    }
  },
  //通过code获取openid
  fromCodeGetOpenid: function () {
    app.log('-----------fromCodeGetOpenid---------:')
    let param = {
      code: this.data.code,
      appid: utils.appId
    }
    utils.GET(param, utils.fromCodegetOpenid, res => {
      app.log('通过code获取openid:', res)
      if (res.data.openid && res.statusCode == 200) {
        app.log('授权openid:', res.data.openid)
        app.log('授权session_key:', res.data.session_key)
        this.data.openId = res.data.openid
        wx.setStorageSync('OPENID', res.data.openid)
        wx.setStorageSync('SEEEIONKEY', res.data.session_key)

        if (res.data.access_token && res.data.access_token != null) {
          let token = wx.getStorageSync('TOKEN')
          token.access_token = res.data.access_token
          wx.setStorageSync('TOKEN', token)
        }
        if (res.data.refresh_token && res.data.refresh_token != null) {
          wx.setStorageSync('REFRESHTOKEN', res.data.refresh_token)
          //有记录的老用户直接请求拿数据
          this.refreshToken()
        } else {
          //无token的是新用户，需要把iv,data发给服务端记录下来
          this.postInfoToService()
        }


      } else {}
    })

  },


  //新用户信息发送给服务端
  postInfoToService() {
    app.log('null-----------postInfoToService---------:')
    let param = {
      openid: this.data.openId,
      appid: utils.appId,
      iv: this.data.iv,
      encrypted_data: this.data.encryData
    }
    utils.GET(param, utils.postInfoToService, res => {
      app.log('postInfoToService:', res)
      if (res.data.access_token && res.statusCode == 200) {

        let token = wx.getStorageSync('TOKEN')
        token.access_token = res.data.access_token
        wx.setStorageSync('TOKEN', token)
        //  this.getUserInfo()
        this.refreshToken()


      } else {}
    })
  },


  //刷新token
  refreshToken() {
    let param = {}
    utils.REFRESHTOKENPOST(param, utils.refreshToken, res => {
      app.log('刷新Token:', res)
      if (res.data && res.statusCode == 200) {
        res.data.deadline = +new Date() + (res.data.expires_in * 1000);
        app.log("失效时间", res.data.deadline)
        res.data.isLogin = true
        wx.setStorageSync('TOKEN', res.data)
        this.getUserInfo()
      }
    })
  },
  //获取用户信息
  getUserInfo() {
    let param = {}
    utils.GET(param, utils.getUserInfo, res => {
      app.log('用户信息:', res)

      if (res.data && res.statusCode == 200) {
        wx.hideLoading()
        this.setData({
          isLogin: true,
          userInfo: res.data
        })
        wx.setStorageSync('USERINFO', res.data)
        app.userInfo.islogin = true
        wx.showToast({
          title: '登录成功',
          icon: 'none'
        })

      } else {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })

      }
    })

  },

  //使⽤授权码获取access_token访问令牌
  againGetAccessToken() {
    wx.login({
      success: (res) => {
        app.log('res--code:', res)
        this.data.code = res.code
        app.log('code:', this.data.code)
        let param = {
          code: this.data.code
        }
        utils.POST(param, utils.fromCodeGetAccessToken, res => {
          app.log('授权码重新获取access_token访问令牌:', res)

        })

      },
      fail: (err) => {
        app.log('获取code失败')
      },

    })


  },
  //退出登录
  logoutTap() {
    app.log('退出登录')
    // this.getCode()
    // wx.clearStorageSync()
    // app.goAuthGetToken()

    wx.removeStorageSync('USERINFO')
    wx.removeStorageSync('ACCESSTOKEN')
    // wx.removeStorageSync('TOKEN')
    app.userInfo.islogin = false
    let obj = {
      nickname: '',
      avatar: ''
    }
    this.setData({
      userInfo: obj,
      isLogin: false,
      existed: false
    })
    wx.showToast({
      title: '退出成功',
      icon: 'none'
    })
    wx.setStorageSync('ALBUMISCOLLECT', false)
    this.selectComponent('#miniPlayer').setOnShow()

  },

  // order() {
  //   if (!this.data.isLogin) {
  //     wx.showToast({ icon: 'none', title: '请登录后进行操作' })
  //     return;
  //   }
  //    wx.navigateTo({ url: '../member/member' })
  //   app.log('开通续费会员')
  // },
  like() {
    if (!this.data.isLogin) {
      wx.showToast({
        icon: 'none',
        title: '请登录后进行操作'
      })
      return;
    }
    wx.navigateTo({
      url: '../like/like'
    })
  },
  latelyListen() {
    if (!this.data.isLogin) {
      wx.showToast({
        icon: 'none',
        title: '请登录后进行操作'
      })
      return;
    }
    wx.navigateTo({
      url: '../latelyListen/latelyListen'
    })
  },
  myBuy() {
    if (!this.data.isLogin) {
      wx.showToast({
        icon: 'none',
        title: '请登录后进行操作'
      })
      return;
    }
    wx.navigateTo({
      url: '../myBuy/myBuy'
    })
  },
}