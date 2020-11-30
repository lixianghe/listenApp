/**
 * @name: index
 * 开发者编写的首页index,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * labels: [
 *   {id: 'xxx', name: 'xxx'},  // 必填字段
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
 * 4、配置页面的快捷入口
 * lalyLtn：[
      {icon: '/images/zjst.png', title: "最近收听", name: 'latelyListen', islogin:false},
    ]
 */
const app = getApp()
import { layout, layoutGroup } from '../utils/httpOpt/api'
module.exports = {
  data: {
    // 开发者注入快捷入口数据
    lalyLtn: [
      {icon: '/images/zjst.png', title: "最近收听", name: 'latelyListen', islogin: false},
      {icon: '/images/icon_collect.png', title: "我喜欢的", name:'like', islogin: true}
    ],
    // 开发者注入模板页面数据
    info: [],
    // 开发者注入模板标签数据
    labels: [],

    countPic: '/images/media_num.png',
    reqS: false,
    reqL: false,
  },
  // 页面后台数据(不参与渲染)
  pageData: {
    pageName: 'index',
    pageType: 'tab',
    pageLoaded: false,
    // 各频道列表页码，根据groupId获取
    pageNum: 1,
    hasNext: true,
  },
  onShow() {

  },
  onLoad(options) {
    // 接入凯叔频道数据
    layoutGroup().then(res => {
      const formatData = res.map((item, idx) => {
        let obj = {
          id: item.groupId,
          name: item.groupTitle,
          type: item.groupType,
          groupTitleConfig: item.groupTitleConfig
        }
        return obj
      })
      this.setData({
        labels: formatData,
        reqS: true
      })
      this._getList(formatData[0].id)
    }).catch(err => {
      console.log(JSON.stringify(err))
    })
  },
  onReady() {

  },
  selectTap(e) {
    const index = e.currentTarget.dataset.index
    const id = e.currentTarget.dataset.groupid
    this.setData({
      currentTap: index,
      retcode: 0
    })
    wx.showLoading({
      title: '加载中',
    })
    this._getList(id)
  },
  // 跳转到最近收听页面
  tolatelyListen (e) {
    const index = e.currentTarget.dataset.index
    let page = e.currentTarget.dataset.page
    

    if ((!app.userInfo || !app.userInfo.token) && this.data.lalyLtn[index].islogin) {
      wx.showToast({ icon: 'none', title: '请登录后进行操作' })
      return;
    }
    wx.navigateTo({
      url: `../${page}/${page}`
    })
  },
  // 跳转到播放详情界面
  linkAbumInfo (e) {
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype
    // 静态实现最近收听
    if (!app.globalData.latelyListenId.includes(id)) {
      app.globalData.latelyListenId.push(id)
    }
    let url
    if (routeType === 'album' || routeType === 'fm') {
      url = `../abumInfo/abumInfo?id=${id}&title=${title}&routeType=${routeType}`
    } else if (routeType === 'media') {
      url = `../playInfo/playInfo?id=${id}`
    }
    
    wx.navigateTo({
      url: url
    })
  },
  _getList(id) {
    // 接入凯叔列表数据
    let params = {groupId: id, pageNum: this.pageData.pageNum}
    layout(params).then(res => {
      let layoutData = [{
        id: '00',
        title: '电台',
        src: '/images/fm.jpg',
        contentType: 'fm',
        count: '',
        isVip: false
      }]
      res.list.forEach(v => {
        v.content.forEach(item => {
          layoutData.push({
            id: item.album ? item.album.albumId : item.media.mediaId,
            title: item.album ? item.album.albumName : item.media.mediaName,
            src: item.coverUrl,
            contentType: item.contentType,
            count: item.album ? item.album.mediaCount : '',
            isVip: item[item.contentType].feeType == '01' && (item[item.contentType].product || item[item.contentType].product && [2, 3].indexOf(item[item.contentType].product.vipLabelType) < 0)
          })
        })

      })
      this.setData({
        info: layoutData,
        reqL: true
      })
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      console.log(JSON.stringify(err))
    })
  },
  // 懒加载
  getLayoutData() {

  },
}