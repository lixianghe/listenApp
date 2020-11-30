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
    flag: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    likeOne(e) {
      let flag = !this.data.flag
      let num = Number(flag)
      this.setData({
        src: this.data.likePic[num],
        flag: flag
      })
      let typeid = e.currentTarget.dataset.typeid
      let contentType = e.currentTarget.dataset.contenttype
      this.triggerEvent('clickHadle', { typeid: typeid, contentType: contentType, flag: flag});
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
  }
})
