// components/story/story.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    className: { 
      type: String,
      value: false
    },
    datasource: {
      type: Object,
      value: {
        src: '',
        title: '',
        isVip: false
      }
    },
    likePic:{
      type: Array,
      value: []
    },
    countpic:{
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // // 系统配色
    // colorStyle: app.sysInfo.colorStyle,
    // // 系统背景色
    // backgroundColor: app.sysInfo.backgroundColor
    mainColor: app.globalData.mainColor,
    src: [],
    flag: 0,
    stopIcon: '../../images/play2.png',
    playingIcon: '../../images/playing.gif'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    aa() {

    },
    playMedia(e){
      // console.log('播放:',e.currentTarget.dataset.typeid)
      let typeid = e.currentTarget.dataset.typeid

      this.triggerEvent('clickHadle', { typeid: typeid});
    },
    likeOne(e) {
       let item = e.currentTarget.dataset.item
      
      let isCollect = e.currentTarget.dataset.iscollect
      this.triggerEvent('clickHadle', { item: item, isCollect: isCollect});
    },
    //加载图片失败
    loadImgError: function (res) {
      this.setData({
        'item.coverUrl': app.sysInfo.defaultImg
      })
    }
  },

  attached: function () {
    if(this.data.likePic && this.data.likePic.length > 1) {
      this.setData({
        src: this.data.likePic[this.data.flag]
      })
    }
    this.setData({
      abumInfoId: wx.getStorageSync('abumInfoId'),
      playing: wx.getStorageSync('playing')
    })
  }
})
