/**
 * @name: like
 * 开发者编写的最近收听like,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * labels: {
 *     show: true,
 *     data: [{
 *       name: '专辑',
 *       value: 'album'
 *     },
 *     {
 *       name: '故事',
 *       value: 'media'
 *     }],
 *   },
 *  可选内容，当show为false时不显示分类列表
 * 2、_getList函数，这里我们给开发者提供labels对应点击的的值，其余参数开发者自行添加；
 *    _getList函数获取的list最终转换为模板需要的字段，并setData给info。
 * 3、由于模板内的字段名称可能和后台提供不一样，在获取list后重新给模板内的字段赋值：如下以本页列表数据为例
 * list.map((item, index) => {
      item.title = item.mediaName                               // 歌曲名称
      item.id = item.mediaId                                    // 歌曲Id
      item.src = item.coverUrl                                  // 歌曲的封面
      item.contentType = 'album'                                // 类别（例如专辑或歌曲）
      item.isVip = true                                         // 是否是会员
    })
 * 4、likePic: ['/images/info_like.png', '/images/info_like_no.png'],
 * 收藏和取消收藏图片
 */
const app = getApp()
import utils from '../utils/util'

module.exports = {
  data: {
    emptyObj: {
      'title': '已经见底啦~~',
      'src': '/images/album_img_default.png'
    },

    collectId: '',
    info: [],
    showModal: false,
    showNoUserModal: false,
    req: false,
    // likePic: ['/images/info_like.png', '/images/info_like_no.png'],
    // labels: {
    //   show: true,
    //   data: [{
    //     name: '专辑',
    //     value: 'album'
    //   },
    //   {
    //     name: '故事',
    //     value: 'media'
    //   }],
    // },
  },
  onShow() {
    if (!wx.getStorageSync('USERINFO')) {
      this.setData({
        showNoUserModal: true,
        req:-1
       
      })
      return
    }else{
      this.refreshToken()
    }
   
    // app.goAuthGetToken().then((res) => {
    //   console.log('-------token',wx.getStorageSync('TOKEN'))
    //   console.log('------------res:', res)
    //   console.log('=======---------------------res:', res)
    //   this._getLikeList()

    //  });


  },
  //刷新token
  refreshToken() {
    let param = {}
    utils.REFRESHTOKENPOST(param, utils.refreshToken, res => {
      console.log('刷新Token:', res)
      if (res.data && res.statusCode == 200) {
        res.data.deadline = +new Date() + (res.data.expires_in * 1000);
        console.log("失效时间", res.data.deadline)
        res.data.isLogin = true
        wx.setStorageSync('TOKEN', res.data)
        this._getLikeList()
      } else {
        this._getLikeList()

      }
    })
  },
  onLoad(options) {
   
  },
  onReady() {

  },

  // 跳转到列表面
  linkAbumInfo(e) {
    let id = e.currentTarget.dataset.id
    if (id) {
      const src = e.currentTarget.dataset.src
      const title = e.currentTarget.dataset.title.replace(new RegExp('&', "gm"), '')
      wx.setStorageSync('img', src)
      // const routeType = e.currentTarget.dataset.contentype

      wx.navigateTo({
        url: '../albumInfo/albumInfo?id=' + id + '&title=' + title + '&routeType=album'
      })
    } else {

    }


  },




  //获取我喜欢的数据
  _getLikeList() {
    wx.showLoading({
      title: '加载中...',
    })
    let param = {
      offset: 500
    }
    utils.LIKEGET(param, utils.getUserCollectAlbums, res => {
      wx.hideLoading()
      console.log('我的收藏:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {
        // item.title = item.mediaName                               // 歌曲名称
        // item.id = item.mediaId                                    // 歌曲Id
        // item.src = item.coverUrl                                  // 歌曲的封面
        // item.contentType = 'album'                                // 类别（例如专辑或歌曲）
        // item.isVip = true                                         // 是否是会员
        let laterArr = []
        for (let i = 0; i < res.data.items.length; i++) {
          console.log('---------', i)
          laterArr.push({
            title: res.data.items[i].title,
            id: res.data.items[i].id,
            src: app.impressImg(res.data.items[i].cover.large.url, 280, 280),
            // contentType:res.data.items[i].kind,
            contentType: 'album',
            isCollect: true,
            isVip: res.data.items[i].is_vip_free,
            // isVip:wx.getStorageInfoSync('USERINFO').is_vip,
            lastUpdate: res.data.items[i].last_updated_track_id
          })
        }

        var id = wx.getStorageSync('songInfo').albumId

        for (let i = 0; i < laterArr.length; i++) {
          if (laterArr[i].id == id) {

            wx.setStorageSync('ALBUMISCOLLECT', true)
          }

        }

        laterArr.push(this.data.emptyObj)
        this.setData({
          req: true,
          info: laterArr
        })
        console.log('------------我的收藏--info:', this.data.info)



      } else {
        this.setData({
          showModal: true,
          req: -1
        })
      }

    })

  },

  // 添加/取消收藏函数
  likeOne(e) {
    console.log('喜欢', e)
    let idx = e.currentTarget.dataset.no
    this.data.collectId = e.detail.item.id
    let iscollect = e.detail.item.isCollect
    if (iscollect) {
      this.data.info[idx].isCollect = false
      //取消搜藏
      this.cancelCollectAlbum(this.data.collectId)
    } else {
      this.data.info[idx].isCollect = true

      //添加搜藏
      this.collectAlbum(this.data.collectId)
    }

  },

  //收藏专辑
  collectAlbum(id) {
    let param = {
      id: id
    }
    utils.ALBUMSUBCRIBEPOST(param, utils.albumCollect, res => {
      console.log('收藏专辑:', res)
      if (res.data.status == 200 && res.data.errmsg == 'ok') {
        this.setData({
          info: this.data.info
        })
        if (wx.getStorageSync('songInfo').albumId == this.data.collectId) {
          wx.setStorageSync('ALBUMISCOLLECT', true)
          this.selectComponent('#miniPlayer').setOnShow()
        }


        wx.showToast({
          title: '专辑订阅成功',
          icon: 'none'
        })

      } else {
        wx.showToast({
          title: '专辑订阅失败',
          icon: 'none'
        })
      }
    })

  },
  //取消收藏专辑
  cancelCollectAlbum(id) {
    let param = {
      id: id
    }

    utils.ALBUMSUBCRIBEPOST(param, utils.cancelAlbumCollect, res => {
      console.log('取消收藏专辑:', res)
      if (res.data.status == 200 && res.data.errmsg == 'ok') {
        this.setData({
          info: this.data.info
        })

        if (wx.getStorageSync('songInfo').albumId == this.data.collectId) {
          wx.setStorageSync('ALBUMISCOLLECT', false)
          this.selectComponent('#miniPlayer').setOnShow()
        }

        wx.showToast({
          title: '专辑取消订阅成功',
          icon: 'none'
        })

      } else {
        wx.showToast({
          title: '专辑取消订阅失败',
          icon: 'none'
        })
      }
    })

  },
  goLogin() {
    wx.switchTab({
      url: '/pages/personalCenter/personalCenter'
    })

  },
  close() {
    this.setData({
      showModal: false
    })
    wx.navigateBack({

    })
  },
  // 添加/取消收藏函数
  // playMedia(e){
  //   console.log('播放',e)
  // }

}