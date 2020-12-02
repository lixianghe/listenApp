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
function playAlrc(that, app, percent) {
  // 如果是拖拽的情况
 
  if (percent !== undefined) {
    that.setData({
      playtime: percent ? formatduration(percent * 10 * formatToSend(app.globalData.songInfo.dt)) : '00:00',
      percent: percent
    })
    return
  }
  wx.getBackgroundAudioPlayerState({
    complete: function (res) {
      var time = 0, playing = false, playtime = 0;
      // 1是正常播放，2是异常
      if (res.status != 2) {
        time = res.currentPosition / res.duration * 100;
        playtime = res.currentPosition;
      } if (res.status == 1) {
        playing = true;
      }
      app.globalData.playing = playing;
      app.globalData.percent = time
      that.setData({
        playtime: playtime ? formatduration(playtime * 1000) : '00:00',
        percent: time || 0,
        playing: playing
      })
      wx.setStorage({
        key: "playing",
        data: playing
      })
      // 设置abumInfo页面的播放状态用来控制gif是否展示
      that.triggerEvent('setPlaying', playing)
    }
  });
};


function toggleplay(that) {
  if (that.data.playing) {
    that.setData({ 
      playing: false 
    });
    that.stopmusic();
  } else {
    that.setData({
      playing: true
    });
    that.playing();
  }
}


// 初始化 BackgroundAudioManager
function initAudioManager(that, list) {
  that.audioManager = wx.getBackgroundAudioManager()
  that.audioManager.playInfo = {playList: list};
  EventListener(that)
}

// 监听播放，上一首，下一首
function EventListener(that){
  //播放事件
  that.audioManager.onPlay(() => {
    console.log('onPlay')
    wx.setStorageSync('playing', true)
  })
  //暂停事件
  that.audioManager.onPause(() => {
    console.log('触发播放暂停事件');
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
  })
  //播放错误事件
  that.audioManager.onError(() => {
    console.log('触发播放错误事件');
  })
  //播放完成事件
  that.audioManager.onEnded(() => {
    console.log('触发播放完成事件');
  })
}



module.exports = {
  formatToSend: formatToSend,
  formatduration: formatduration,
  playAlrc: playAlrc,
  toggleplay: toggleplay,
  initAudioManager: initAudioManager,
  EventListener: EventListener
}
