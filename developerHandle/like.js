/**
 * @name: like
 * 开发者编写的最近收听like,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * labels: [
 *   {value: 'album', label: '专辑'},
 *   {value: 'media', label: '故事'}
 * ]
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
const { showData } = require('../utils/httpOpt/localData')
import { albumFavorite, mediaFavorite } from '../utils/httpOpt/api'

module.exports = {
  data: {
    info: [],
    showModal: false,
    req: false,
    likePic: ['/images/info_like.png', '/images/info_like_no.png'],
    labels: [
      {value: 'album', name: '专辑'},
      {value: 'media', name: '故事'}
    ],
  },
  onShow() {
    console.log('Log from mixin!')
  },
  onLoad(options) {
    this._getList(this.data.labels[0].value)
  },
  onReady() {

  },
  // 跳转到播放详情界面
  linkAbumInfo (e) {
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype

    console.log(app.globalData.latelyListenId, routeType)
    let url
    if (routeType === 'album') {
      url = `../abumInfo/abumInfo?id=${id}&title=${title}`
    } else if (routeType === 'media') {
      url = `../playInfo/playInfo?id=${id}`
    }
    
    wx.navigateTo({
      url: url
    })
  },
  selectTap(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTap: index,
      retcode: 0
    })
    wx.showLoading({
      title: '加载中',
    })
    this._getList(this.data.labels[index].value)
  },
  _getList(value) {
    console.log(value)
    if (value == 'album'){
      this.getAlbum()
    } else if (value == 'media'){
      this.getMedia()
    }
  },
  getAlbum() {
    let params = {
      pageNum: 1,
      pageSize: 20
    }
    albumFavorite(params).then(res => {
      let layoutData = []
      res.albumList.forEach(item => {
          layoutData.push({
            id: item.albumId,
            title: item.albumName,
            src: item.coverUrl, 
            contentType: 'album',
            // isVip: true
            isVip: item.feeType == '01' && (item.product || item.product && [2, 3].indexOf(item.product.vipLabelType) < 0)
          })
      })
      this.setData({
        info: layoutData,
        // info: [{id: 'qd223',title: '哈哈',src: "https://cdn.kaishuhezi.com/kstory/ablum/image/389e9f12-0c12-4df3-a06e-62a83fd923ab_info_w=450&h=450.jpg",contentType: 'album',isVip:true}],
        req: true
      })
      if(layoutData.length === 0) {
        this.setData({
          showModal: true
        })
      }
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      console.log(JSON.stringify(err)+'73行')
    })
  },
  getMedia() {
    let params = {
      pageNum: 1,
      pageSize: 20
    }
    mediaFavorite(params).then(res => {
      let layoutData = []
      res.list.forEach(item => {
          console.log(`${item}89行`)
          // console.log(item.feeType == '01' && (item.product || item.product && [2, 3].indexOf(item.product.vipLabelType) < 0)+'57行')
          layoutData.push({
            id: item.mediaId,
            title: item.mediaName,
            src: item.coverUrl, 
            contentType: 'media'
            // isVip: true
          })

      })
      console.log(`${layoutData}67行`)
      this.setData({
        info: layoutData,
        // info: [{id: 'qd223',title: '哈哈',src: "https://cdn.kaishuhezi.com/kstory/ablum/image/389e9f12-0c12-4df3-a06e-62a83fd923ab_info_w=450&h=450.jpg",contentType: 'album',isVip:true}],
        req: true
      })
      if(layoutData.length === 0) {
        this.setData({
          showModal: true
        })
      }
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      console.log(JSON.stringify(err)+'73行')
    })
  },
  close() {
    this.setData({showModal: false})
  },
  // 懒加载
  getLayoutData() {

  },
}