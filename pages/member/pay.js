// pages/mine/pay.js
//获取应用实例
const app = getApp()
import { signature, buy, buyResult } from '../../utils/httpOpt/api'

var payTimer = null
Page({
  data: {
    // 系统配色
    colorStyle: '#ffac2d',
    // 系统背景色
    backgroundColor: '#151515',
    productId: null,
    // 支付金额
    totalPrice: '',
    // 支付状态
    payStatus: 'pre',
    signature: '',
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productId: options.id
    })
  },
  onShow: function () {
    app.checkStatus()
    this.createOrder()
  },
  onHide: function () {
    this.setData({
      productId: null
    })
  },
  onUnload: function () {
    this.setData({
      productId: null
    })
  },
  backTap(){
    wx.navigateBack()
  },

  async createOrder(){
    let res = await signature()
    let postData = {
      productType: 1,
      productId: this.data.productId,
      payType: '1',
      paySubType: 'h5-wechat-native',
      signature: res.signature,
      orderSource: 'car-app',
      orderChannel: 'car-app-tencent'
    }
    this.setData({signature: res.signature})
    buy(postData).then(res => {
      let { totalPrice, payResult } = res
      this.setData({
        totalPrice,
        codeUrl: payResult.codeUrl
      })
      this.getPayResult()
    })
  },

  getPayResult(){
    if (payTimer) {
      clearTimeout(payTimer)
    }
    payTimer = setTimeout(()=>{
      let params = { signature: this.data.signature }
      buyResult(params).then(res => {
        console.log('注册轮询查询支付结果事件', res)
        let { payResult } = res
        let payStatus = ''
        switch (payResult) {
          case 1:
            payStatus = 'success';
            break;
          case 3:
            payStatus = 'fail';
            break;
          default:
            if (this.data.productId){
              this.getPayResult()
            }
            break;
        }
        if (payStatus){
          this.setData({
            payStatus
          })
        }
      }).catch(error => {
        this.createOrder()
      })
    },500)
  }
})