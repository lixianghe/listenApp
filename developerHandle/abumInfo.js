/**
 * @name: abumInfo
 * 开发者编写的专辑详情abumInfo,通过专辑id获取播放列表，id在onLoad的options.id取
 * 这里开发者需要提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * 1、在data里定义接口入参的key，因为内部逻辑(如懒加载)会调用这里的函数并传参
 * pageNoName: 'pageNum'        // 分页数
 * pageSizeName: 'pageSize'     // 每页数目
 * idName: 'albumId'            // 这个页面请求的id
 * 2、播放列表：canplay(注：canplay需要存在Storage里面)
 * 3、当前专辑所有列表allList，只需存在Storage缓存里面，主要用于切歌使用
 * 4、此专辑总曲目数：total
 * 5、由于模板内的字段名称可能和后台提供不一样，在获取list后重新给模板内的字段赋值：如下
 * list.map((item, index) => {
      item.title = item.mediaName                               // 歌曲名称
      item.id = item.mediaId                                    // 歌曲Id
      item.dt = item.timeText                                   // 歌曲的时常
      item.coverImgUrl = item.coverUrl                          // 歌曲的封面
    })
 */
// import { albumMedia, isAlbumFavorite, fm, albumFavoriteAdd, albumFavoriteCancel } from '../utils/httpOpt/api'
const { showData } = require('../utils/httpOpt/localData')

module.exports = {
  data: {
    pageNoName: 'pageNum',
    pageSizeName: 'pageSize',
    pageSize: 10,
    idName: 'albumId',
    existed: false,                     // 是否被收藏
    playAllPic: '/images/playAll.png'
  },
  onShow() {

  },
  async onLoad(options) {
    let id = options.id
    this._getList()
    this.getAllList()
  },
  onReady() {

  },
  // 获取分页歌曲列表，假数据
  async _getList(params) {
    let canplay = await this.getData()
    this.setData({canplay})
    wx.setStorageSync('canplay', canplay)
  },
  getData() {
    let canplay = showData.abumInfo.data
    let total = showData.abumInfo.total
    this.setData({total})
    return canplay
  },
  // 获取所有的播放列表
  async getAllList() {
    // 假设allList是canplay，真实情况根据接口来
    let allList = await this.getData()
    wx.setStorageSync('allList', allList)
  }
}