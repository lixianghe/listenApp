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

module.exports = {
  data: {
    info: [],
    showModal: false,
    req: false,
    likePic: ['/images/info_like.png', '/images/info_like_no.png'],
    labels: {
      show: true,
      data: [{
        name: '专辑',
        value: 'album'
      },
      {
        name: '故事',
        value: 'media'
      }],
    },
  },
  onShow() {

  },
  onLoad(options) {
    this._getList('专辑')
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
    const name = e.currentTarget.dataset.name
    this.setData({
      currentTap: index,
      retcode: 0
    })
    wx.showLoading({
      title: '加载中',
    })
    this._getList(name)
  },
  _getList(name) {
    setTimeout(() => {
      let info = []
      wx.hideLoading()
      let data = [{
          id: 958,
          title: "内容标题1",
          src: "https://cdn.kaishuhezi.com/kstory/ablum/image/389e9f12-0c12-4df3-a06e-62a83fd923ab_info_w=450&h=450.jpg",
          contentType: "album",
          count: 17,
          isVip: true
        },
        {
          id: 959,
          title: "内容标题2",
          src: "https://cdn.kaishuhezi.com/kstory/ablum/image/f20dda35-d945-4ce0-99fb-e59db62ac7c9_info_w=450&h=450.jpg",
          contentType: "album",
          count: 13,
          isVip: true
        },
        {
          id: 962,
          title: "内容标题1",
          src: "https://cdn.kaishuhezi.com/kstory/story/image/2af5072c-8f22-4b5d-acc2-011084c699f8_info_w=750_h=750_s=670433.jpg",
          contentType: "media",
          count: 0,
          isVip: false
        }
      ]
      info = data.map(item => {
        item.title = `${name}-${item.title}`
        return item
      })
      this.setData({
        req: true,
        info: info
      })
      if (info.length === 0) {
        this.setData({
          showModal: true
        })
      }
    }, 500)

  },
  // 添加/取消收藏函数
  like (e) {
    console.log(e.detail.contentType)     //类型
    console.log(e.detail.flag)    		// 状态（添加/取消）
    console.log(e.detail.typeid)    		// 内容id
  },
  close() {
    this.setData({showModal: false})
  },

}