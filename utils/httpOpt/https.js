const base = 'https://api.kaishustory.com'
// const base = 'https://tapi.kaishustory.com'
const appId = 786474
/**
 * 封封微信的的request
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
