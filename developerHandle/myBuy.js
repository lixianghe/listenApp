/**
 * @name: myBuy
 * 开发者编写的我购买的页面,开发者提供需提供：
 * 1、lables:[]，搜索页面的分类label例如：
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
 */
const app = getApp()
const { showData } = require('../utils/httpOpt/localData')
import { bought } from '../utils/httpOpt/api'

module.exports = {
  data: {
    info: [],
    showModal: false,
    labels: [
      {value: 'album', name: '专辑'},
      {value: 'media', name: '故事'}
    ],
    loadReady: false  // 数据请求完毕为true
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
      currentTap: index
    })
    this._getList(this.data.labels[index].value)
  },
  _getList(type) {
    let params = {
      pageNum: 1
    }
    bought(params).then(res => {
      let layoutData = []
      if(type === 'album') {
        res.list.forEach(item => {
          layoutData.push({
            id: item.album.albumId,
            title: item.album.albumName,
            src: item.album.coverUrl, 
            contentType: 'album',
            isVip: item.feeType == '01' && (item.product || item.product && [2, 3].indexOf(item.product.vipLabelType) < 0)
          })
      })
      } else if (type === 'media') {
        res.list.forEach(item => {
          layoutData.push({
            id: item.media.mediaId,
            title: item.media.mediaName,
            src: item.media.coverUrl, 
            contentType: 'media',
            isVip: item.feeType == '01' && (item.product || item.product && [2, 3].indexOf(item.product.vipLabelType) < 0)
          })
        })
      }
      this.setData({
        info: layoutData,
        loadReady: true
      })
      if(layoutData.length === 0) {
        this.setData({
          showModal: true
        })
      }
    }).catch(err => {
      console.log(JSON.stringify(err))
    })
  },
  close() {
    this.setData({showModal: false})
  },
}