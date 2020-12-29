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
    console.log('onshow-----------')
    wx.checkSession({
      success: (res) => {
      
      },
      fail: (res) => {
        //走退出接口
         console.log("---checkSession--fail---userInfo/exit")
      
      },
    })
    wx.login({
      success: (res) => {
        console.log('res--code:',res)
        this.data.code = res.code
        console.log('code:',this.data.code)
       
      },
      fail: (err) => {
        console.log('获取code失败')
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
  loginIn(event) {
    this.setData({
      showWxLogin: false
    })
  
  },
  getPhoneNumber(e) {
    console.log('--手机号登录---getPhoneNumber', e)
    if (!e.detail.iv) { 
      //用户点击拒绝
      console.vlog('用户未授权')
    
     } else {
        // wx.showLoading({
        //   title: '登录中...',
        // })
      
         console.log('--openId', this.data.openId)
        
         
        if(this.data.openId){
          //userInfo/mobileLoginNew
          //请求接口
          let param = {
            iv: e.detail.iv,
            encryptedData:e.detail.encryptedData
          }
         
               
             
        }else{
          //userInfo/codeLoginNew
           console.log('通过code获取openid')
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
      console.log('授权:',res)

    })
     

    

   
    

  },
//退出登录
  logoutTap(){
    console.log('退出登录')
    
    let obj = {
      nickname: '',
      avatar: ''
    }
    this.setData({
      userInfo: obj,
      isLogin: false
    })

    // utils.POST(param,utils.fromCodegetOpenid,res=>{

    // })


  },

  order() {
    if (!app.userInfo || !app.userInfo.token) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    // wx.navigateTo({ url: '../member/member' })
    console.log('开通续费会员')
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