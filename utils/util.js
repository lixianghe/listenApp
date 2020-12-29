
import Base64 from '../utils/enc-base64';
import CryptoJS from '../utils/crypto-js';
import HmacSHA1 from '../utils/hmac-sha1';
import md5 from '../utils/md5';
import {encrypt} from '../utils/xmSign/utils';

//设置设备diviceId
// const deviceId = util.getDeviceId()



// GET请求
function GET(param,url, callback) {
  console.log('参数', param)
  console.log('请求URL', this.baseUrl + url)
  let publicParams = {
    app_key: this.APP_KEY,
    device_id: this.getDeviceId(),
    client_os_type: 3,
    access_token:  wx.getStorageSync('TOKEN').access_token,
    pack_id:'com.app.wechat',
  };
  let sig = this.calcuSig({...publicParams, ...param}, this.APP_SECRET);
  let params = {...publicParams, ...param, sig}
  console.log('params',   params)
  // let header = {}
  // header['content-type'] = encrypt(Date.now())
  // content-type: application/json
  // console.log('header', header)
//  let header = {
//    'content-type': 'x-www-form-urlencoded',
//    // 'content-type': 'application/json',
//    'app_key':this.APP_KEY,
//    'device_id':  this.getDeviceId(),
//    'pack_id':'com.app.wechat',
//    'access_token':  wx.getStorageSync('TOKEN').access_token,
//    'sig': 'tencent-open',
   
//  }
//  console.log('header', header)
 wx.request({
   url: this.baseUrl + url,
   data: params,
   header: { 
    'content-type': 'application/json' 
  }, 
   method: 'GET',
   dataType: 'json',
   success: res=> {
       console.log('请求成功：', res);
       callback(res)
    
   },
   fail: err => {
    console.log('请求失败：', res);
    callback(res)
     wx.hideLoading()
   }
 })


}
// GET请求
function MGET(param,url, callback) {
  console.log('参数', param)
  console.log('请求URL', this.MbaseUrl + url)
  let header = {}
  header['xm-sign'] = encrypt(Date.now())
  console.log('header', header)
 wx.request({
   url: this.MbaseUrl + url,
   data: param,
   header:header,
   method: 'GET',
   dataType: 'json',
   success: res=> {
       console.log('请求成功：', res);
       callback(res)
    
   },
   fail: err => {
    console.log('请求失败：', res);
    callback(res)
     wx.hideLoading()
   }
 })


}
// POST请求
function POST(param,url, callback) {
  console.log('参数', param)
  console.log('URL',  url)
  console.log('请求URL', this.baseUrl + url)
  let publicParams = {
    app_key: this.APP_KEY,
    device_id: this.getDeviceId(),
    client_os_type: 3,
    access_token:  wx.getStorageSync('TOKEN').access_token,
    pack_id:'com.app.wechat',
  };

  let sig = this.calcuSig({...publicParams, ...param}, this.APP_SECRET);
  let params = {...publicParams, ...param, sig}
  console.log('params',   params)

//  let header = {
//    'content-type': 'x-www-form-urlencoded',
//    // 'content-type': 'application/json',
//    'app_key':this.APP_KEY,
//    'device_id': this.getDeviceId(),
//    'pack_id':'com.app.wechat',
//    'access_token':  wx.getStorageSync('TOKEN').access_token,
//    'sig': 'tencent-open',
   
//  }
let header = {}
 header['xm-sign'] = encrypt(Date.now())
 console.log('header', header)
 wx.request({
   url: this.baseUrl + url,
   data: params,
   header: header,
   method: 'POST',
   dataType: 'json',
   success: res=> {
       console.log( '请求成功:', res);
       callback(res)
    
   },
   fail: err => {
       console.log('请求失败:', err);
     
       callback(res)
     // let retcode = err.errMsg == 'request:fail timeout' ? 408 : 500
     // callback({
     //   retcode: retcode,
     //   retmsg: '',
     //   data: null
     // })
    
     wx.hideLoading()
   }
 })


}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//转换播放时间
function formatduration(duration) {
  duration = new Date(duration);
  return formatNumber(duration.getMinutes()) + ":" + formatNumber(duration.getSeconds());
}

// 时间转秒
function formatToSend(dt) {
  const dtArray = dt.split(':')
  const seconds = Number(dtArray[0]) * 60 + Number(dtArray[1])
  return seconds
}

//音乐播放监听
function playAlrc(that, app) {
  var time = 0, playtime = 0;
  app.audioManager.onTimeUpdate((res) => {
    time = app.audioManager.currentTime / app.audioManager.duration * 100
    playtime = app.audioManager.currentTime
    app.globalData.percent = time
    app.globalData.currentPosition = app.audioManager.currentTime
    app.globalData.playtime = playtime ? formatduration(playtime * 1000) : '00:00'
    if (!that.data.isDrag) {
      that.setData({
        playtime: playtime ? formatduration(playtime * 1000) : '00:00',
        percent: time || 0,
      })
    }
  })
}


function toggleplay(that, app) {
  if (that.data.playing) {
    console.log("暂停播放");
    that.setData({ 
      playing: false 
    });
    app.stopmusic();
  } else {
    console.log("继续播放")
    that.setData({
      playing: true
    });
    app.playing(app.globalData.currentPosition, that);
  }
}


// 初始化 BackgroundAudioManager
function initAudioManager(app, that, songInfo) {
  let list = wx.getStorageSync('nativeList')
  that.audioManager = wx.getBackgroundAudioManager()
  that.audioManager.playInfo = {
    playList: list,
    playState: {
      // curIndex: app.globalData.songIndex,                                      //当前播放列表索引
      // duration: app.globalData.songInfo.trial ? app.globalData.songInfo.trialDuration : app.globalData.songInfo.duration,                                  //总时长
      // currentPosition: app.globalData.currentPosition,             //当前播放时间
      // status: true,                                                   //当前播放状态 0暂停状态 1播放状态 2没有音乐播放
    },
    context: songInfo
  };
  EventListener(that)
}

// 监听播放，上一首，下一首
function EventListener(that){
  //播放事件
  that.audioManager.onPlay(() => {
    console.log('-------------------------------onPlay-----------------------------------', that)
    wx.hideLoading()
    that.setData({ playing: true });
    let miniPlayer = that.selectComponent('#miniPlayer')
    if (miniPlayer) miniPlayer.setData({ playing: true })
    wx.setStorageSync('playing', true)
  })
  //暂停事件
  that.audioManager.onPause(() => {
    console.log('触发播放暂停事件');
    that.setData({ playing: false });
    wx.setStorageSync('playing', false)
  })
  //上一首事件
  that.audioManager.onPrev(() => {
    console.log('触发上一首事件');
    that.pre()
  })
  //下一首事件
  that.audioManager.onNext(() => {
    console.log('触发onNext事件');
    that.next();
  })
  //停止事件
  that.audioManager.onStop(() => {
    console.log('触发停止事件');
    that.setData({ playing: false });
    wx.setStorageSync('playing', false)
  })
  //播放错误事件
  that.audioManager.onError(() => {
    console.log('触发播放错误事件');
    that.setData({ playing: false });
    wx.setStorageSync('playing', false)
  })
  //播放完成事件
  that.audioManager.onEnded(() => {
    console.log('触发播放完成事件');
  })
}

// 函数节流
function throttle(fn, interval) {
  var enterTime = 0;//触发的时间
  var gapTime = interval || 100;//间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = new Date();//第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}

// 函数防抖
function debounce(fn, interval = 300) {
  let canRun = true;
  return function () {
      if (!canRun) return;
      canRun = false;
      setTimeout(() => {
          fn.apply(this, arguments);
          canRun = true;
      }, interval);
  };
}

function generateUUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
}

 function getDeviceId() {
  //设置设备diviceId
  let diviceId = wx.getStorageSync('DEVICE_ID')
  if (!diviceId) {
    diviceId = generateUUID()
    wx.setStorageSync('DEVICE_ID', diviceId)
  }
  return diviceId
}

// 计算sig
 function calcuSig(params, key) {
  const arr = [];
  Object.entries(params).sort().map(item => arr.push(`${item[0]}=${item[1]}`));
  const base64 = Base64.stringify(CryptoJS.enc.Utf8.parse(arr.join('&')));
  const hmac = HmacSHA1(base64, key);
  return md5(hmac).toString();
}

// 生成随机字符串，默认32位
 function generateRandom(n = 32) {

  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let res = ''
  for (let i = 0; i < n; i += 1) {
    const id = Math.ceil(Math.random() * 35)
    res += chars[id]
  }
  return res
}




module.exports = {


 baseUrl : 'https://api.ximalaya.com/',
 MbaseUrl : 'https://m.ximalaya.com/',
   appId : 60023,
  // 开放平台数据
   APP_KEY : 'a42f6121d901e1748eb14e5c0f1ad62a',
   APP_SECRET : '59ad60cf0865c4de37a5ed55336a5671',
   //接口
   //code获取openid
   fromCodegetOpenid:'iot/openapi-smart-device-api/customized/wecar/code2session',
   //首页banners
   indexBanners:'operation/banners',
   //首页音频列表
   indexMediaArr:'iot/openapi-smart-device-api/recommendations-vehicle',
   //类目分裂
   categoryFroups:'iot/openapi-smart-device-api/browse/album-categories',
   //类目详情
   categoryDetails:'discovery-category/keyword/all/',
   //该类目下所有专辑
   allAlbums:'discovery-category/keyword/albums',
   //专辑详情
   albumDetails:'iot/openapi-smart-device-api/albums/',
   //专辑下的所有音频
   albumAllmedias:'iot/openapi-smart-device-api/albums/',

  formatToSend: formatToSend,
  formatduration: formatduration,
  playAlrc: playAlrc,
  toggleplay: toggleplay,
  initAudioManager: initAudioManager,
  EventListener: EventListener,
  throttle: throttle,
  debounce: debounce,
  getDeviceId:getDeviceId,
  generateRandom:generateRandom,
  calcuSig:calcuSig,
  GET:GET,
  POST:POST,
  MGET:MGET
}
