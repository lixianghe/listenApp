/**
 * @name: latelyListen
 * 开发者编写的最近收听latelyListen,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
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
 */
const app = getApp()
import utils from '../utils/util'

module.exports = {
  data: {
    emptyObj: {
      'title': '已经见底啦~~',
      'src': '/images/album_img_default.png'
    },

    showModal: false,
    req: false,
    countPic: '/images/media_num.png',
    likePic: ['/images/info_like.png', '/images/info_like_no.png'],

    // 开发者注入模板标签数据
    labels: {
      show: true,
      // data: [{
      //   name: '专辑',
      //   value: 'album'
      // },
      // {
      //   name: '故事',
      //   value: 'media'
      // }]
    },
    // 开发者注入模板页面数据
    info: [{
        'contentType': 'album',
        'id': '121212',
        'perceent': '3.33223',
        'src': 'sdsdsds',
        'title': '熬婿'
      },
      {
        'contentType': 'album',
        'id': '121212',
        'perceent': '3.33223',
        'src': 'sdsdsds',
        'title': '鬼谷子的智慧谋略'
      },
      {
        'contentType': 'album',
        'id': '121212',
        'perceent': '3.33223',
        'src': 'sdsdsds',
        'title': '总有这样的歌只想一个人听'
      },
      {
        'contentType': 'album',
        'id': '121212',
        'perceent': '3.33223',
        'src': 'sdsdsds',
        'title': '刘亦菲-开席了宋朝饭局'
      }
    ]
  },
  onShow() {
    // app.goAuthGetToken().then((res) => {
      // console.log('-------token',wx.getStorageSync('TOKEN'))
      // console.log('------------res:', res)
      // console.log('=======---------------------res:', res)
      this.getLaterListen()

    // });

  },
  onLoad(options) {
  },
  onReady() {

  },
  // 跳转到播放详情界面
  linkAbumInfo(e) {
    console.log('-------latelylisten:', e)
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    // const routeType = e.currentTarget.dataset.contentype
    if (id) {
      wx.navigateTo({
        url: '../albumInfo/albumInfo?id=' + id + '&title=' + title + '&routeType=album'
      })

    } else {

    }


  },

  //最近收听
  getLaterListen() {
    wx.showLoading({
      title: '加载中...',
    })
    let param = {

    }
    utils.PLAYHISTORYGET(param, utils.historyPlay, res => {
      wx.hideLoading()

      console.log('最近收听:', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {
        // item.title = item.mediaName                               // 歌曲名称
        // item.id = item.mediaId                                    // 歌曲Id
        // item.src = item.coverUrl                                  // 歌曲的封面
        // item.contentType = 'album'                                // 类别（例如专辑或歌曲）
        // item.isVip = true                                         // 是否是会员
        let laterArr = []
        for (let i = 0; i < res.data.items.length; i++) {
          console.log('---------', i)
          if (!res.data.items[i].track || res.data.items[i].track == null || res.data.items[i].track.played_secs == null) {
            res.data.items[i].track = new Object()
            res.data.items[i].track.played_secs = 0
          } else {
            res.data.items[i].track.played_secs = res.data.items[i].track.played_secs
          }

          laterArr.push({
            title: res.data.items[i].album.title,
            id: res.data.items[i].album.id,
            src:app.impressImg(res.data.items[i].album.cover.large.url,280,280) ,
            contentType: 'album',
            isVip: res.data.items[i].album.is_vip_free,

            // isHome: true,
            // isVip:wx.getStorageInfoSync('USERINFO').is_vip,
            perceent: (res.data.items[i].track.played_secs / res.data.items[i].track.duration) * 100

          })
        }
        laterArr.push(this.data.emptyObj)

        this.setData({
          req: true,
          info: laterArr
        })
        console.log('最近播放-------------info:', this.data.info)



      } else {
        this.setData({
          showModal: true,
          req: -1
        })
      }

    })


  },


  close() {
    this.setData({
      showModal: false
    })
    wx.navigateBack({

    })
  }
}