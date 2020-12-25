


const util = require('../util.js')
const baseUrl = 'https://www.ximalaya.com'
const appId = 60023
// 开放平台数据
const APP_KEY = 'a42f6121d901e1748eb14e5c0f1ad62a'
const APP_SECRET = '59ad60cf0865c4de37a5ed55336a5671'
const OPEN_DOMAIN = 'https://api.ximalaya.com'
//设置设备diviceId
const deviceId = util.getDeviceId()
// rsa公钥
export const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCVhaR3Or7suUlwHUl2Ly36uVmboZ3+HhovogDjLgRE9CbaUokS2eqGaVFfbxAUxFThNDuXq/fBD+SdUgppmcZrIw4HMMP4AtE2qJJQH/KxPWmbXH7Lv+9CisNtPYOlvWJ/GHRqf9x3TBKjjeJ2CjuVxlPBDX63+Ecil2JR9klVawIDAQAB'

/**
 * 封装微信的的request
 */

export function request(url, data = {}, method = 'GET') {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: base + url,
      data: data,
      method: method,
      dataType: 'json',
      header: {
        'content-type': 'application/json',
        'appId': appId,
        'device': 'wxapp-car',
        'channel': 'wxapp-car',
        'platform': 'tencent-open',
        'deviceId': wx.getStorageSync('deviceId') || '',
        'token':  wx.getStorageSync('token') || ''
      },
      success: function (res) {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else {
            if (res.data.error === '1111') {
              wx.showToast({
                title: '登录信息已过期,请重新登录',
                icon: 'none'
              })
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              })
              reject(res.data.message)
            }
          }
        } else {
          reject(res.data.message)
        }
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
}




export const apiFormat = (str, res) => {
  let reg = /\{(\w+?)\}/gi
  return str.replace(reg, ($0, $1) => {
    return res[$1]
  })
}
module.exports = {
 
}