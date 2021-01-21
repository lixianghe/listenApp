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
    code:'',
    // 是否登录
    isLogin: false,
    // 开发者注入模板用户信息
    userInfo: {
      avatar: '',
      nickname: '',
    },
    // 开发者注入模板其他入口
    data: [ {
      method: 'latelyListen',
      icon: '/images/latelyListen.png',
      title: '最近播放' 
    },{
      method: 'like',
      icon: '/images/mine_like.png',
      title: '我的收藏' 
    },  {
      method: 'myBuy',
      icon: '/images/vip.png',
      title: '我的已购'
    }]
  },
  onShow() {
    app.log('onshow-----------')
    // wx.checkSession({
    //   success: (res) => {
    //     console.log('checksession:',res)
    //     let userinfo = wx.getStorageInfoSync('USERINFO')
    //     this.setData({
    //       isLogin:true,
    //       userInfo:userinfo
    //     })
      
    //   },
    //   fail: (res) => {
    //     //走退出接口
    //      app.log("---checkSession--fail---userInfo/exit")
    //      wx.removeStorageSync('USERINFO')
    //      wx.removeStorageSync('ACCESSTOKEN')
    //   },
    // })
    wx.login({
      success: (res) => {
        app.log('res--code:',res)
        this.data.code = res.code
        app.log('code:',this.data.code)
       
      },
      fail: (err) => {
        app.log('获取code失败')
      },
     
    })



  },
  onLoad(options) {
  },
  onReady() {

  },

  /**
   * 登录
   */
  getPhoneNumber(e) {
    app.log('--手机号登录---getPhoneNumber', e)
    if (!e.detail.iv) { 
      //用户点击拒绝
      console.vlog('用户未授权')
     } else {
        wx.showLoading({
          title: '登录中...',
        })
         app.log('--openId', this.data.openId)
        if(this.data.openId){
          //userInfo/mobileLoginNew
          //请求接口
          // let param = {
          //   iv: e.detail.iv,
          //   encryptedData:e.detail.encryptedData
          // }    
          this.getUserInfo()     
        }else{
          //userInfo/codeLoginNew
           app.log('通过code获取openid')
           //请求接口
           this.fromCodeGetOpenid()
        }
      }
  },
  fromCodeGetOpenid:function(){
    let param = {
      code:this.data.code,
      appid:utils.appId
    }
    utils.GET(param,utils.fromCodegetOpenid,res=>{
      app.log('授权:',res)
      if(res.data.openid && res.statusCode == 200){
        app.log('授权openid:',res.data.openid)
        app.log('授权session_key:',res.data.session_key)
        this.data.openId = res.data.openid
        wx.setStorageSync('OPENID', res.data.openid)
        wx.setStorageSync('SEEEIONKEY', res.data.session_key)
        wx.setStorageSync('REFRESHTOKEN', res.data.refresh_token)
       
         this.refreshToken()

      }else{
        //  this.againGetAccessToken()
      }
    })

  },

 
  //刷新token
  refreshToken(){
    let param ={
    }
    utils.REFRESHTOKENPOST(param,utils.refreshToken,res=>{
      app.log('刷新Token:',res)
      if(res.data && res.statusCode == 200){
        res.data.deadline = +new Date() + (res.data.expires_in * 1000);
        console.log("失效时间", res.data.deadline)   
        res.data.isLogin = true
        wx.setStorageSync('TOKEN', res.data)
        this.getUserInfo()
      }  
    } )
  },

  getUserInfo(){
    let param ={
    }
    utils.GET(param,utils.getUserInfo,res=>{
      app.log('用户信息:',res)
      
      if(res.data && res.statusCode == 200){
        wx.hideLoading()
        this.setData({
          isLogin:true,
          userInfo:res.data
        })
        wx.setStorageSync('USERINFO', res.data)
        app.userInfo.islogin = true

      }else{
        wx.showToast({
          title: '登录失败',
          icon:'none'
        })

      }
    } )

  },

   //使⽤授权码获取access_token访问令牌
   againGetAccessToken(){
    wx.login({
      success: (res) => {
        app.log('res--code:',res)
        this.data.code = res.code
        app.log('code:',this.data.code)
        let param = {
          code:this.data.code
        }
        utils.POST(param,utils.fromCodeGetAccessToken,res=>{
          app.log('授权码重新获取access_token访问令牌:',res)
    
        })
       
      },
      fail: (err) => {
        app.log('获取code失败')
      },
     
    })

   
  },
//退出登录
  logoutTap(){
    app.log('退出登录')
    wx.removeStorageSync('USERINFO')
    wx.removeStorageSync('ACCESSTOKEN')
    app.userInfo.islogin = false
    let obj = {
      nickname: '',
      avatar: ''
    }
    this.setData({
      userInfo: obj,
      isLogin: false,
      existed:false
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
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    wx.navigateTo({ url: '../like/like' })
  },
  latelyListen() {
    if (!this.data.isLogin) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    wx.navigateTo({ url: '../latelyListen/latelyListen' })
  },
  myBuy() {
    if (!this.data.isLogin) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    wx.navigateTo({ url: '../myBuy/myBuy' })
  },
}