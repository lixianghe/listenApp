import tool from '../../utils/util'
const app = getApp()
const {
  showData
} = require("../../utils/httpOpt/localData");
import utils from '../../utils/util'

//  let searchMixin = require('../../developerHandle/search')
Page({
  //  mixins: [searchMixin],
  data: {
    pageState:1,
    keyWord: '',
    screen: app.globalData.screen,
    noContent: '/images/nullContent.png',
    info: [],
    currentTap: 0,
    picWidth: '33vh',
    showMInibar: true,
    times: 1,
    mainColor: app.globalData.mainColor,
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    remindArr: [],
    albumNub: 0,
    peopleNub: 0,
    audioNub: 0,
    recentSearch: ['进击的巨人', '鬼灭之刃', '火影忍者', '死神', '海贼王', '幽灵公主'],
    labels: [{
        value: 'album',
        label: '专辑'
      },
      {
        value: 'people',
        label: '主播'
      },
      {
        value: 'audio',
        label: '声音'
      }
    ]
  },
  deletaClick() {
    console.log('删除')
    wx.removeStorageSync('SEARCHWORD')
    this.setData({
      recentSearch: []
    })

  },
  latersearchItemClick(e) {
    console.log('searchItem点击', e.currentTarget.dataset.idx)
    let idx = e.currentTarget.dataset.idx
    console.log('Item', this.data.recentSearch[idx])
    this.setData({
      keyWord: this.data.recentSearch[idx]
    })

    this.searchClick()

  },
  searchItemClick(e) {
    console.log('searchItem点击', e.currentTarget.dataset.idx)
    let idx = e.currentTarget.dataset.idx
    console.log('Item', this.data.remindArr[idx].text)
    this.setData({
      keyWord: this.data.remindArr[idx].text
    })

    this.searchClick()
  },
  //获取热搜词
  getHotWords() {
    this.data.remindArr = []
    let param = {
      limit: '9'
    }
    wx.showLoading({
      title: '加载中...',
    })
    utils.GET(param, utils.hot, res => {
      console.log('----------热搜词', res)
      wx.hideLoading()
      if (res.data.items.length > 0 && res.statusCode == 200) {
        for (let i = 0; i < res.data.items.length; i++) {
          this.data.remindArr.push({
            num: i + 1,
            text: res.data.items[i].hot_word
          })

        }
        this.setData({
          remindArr: this.data.remindArr
        })
        console.log('remindArr:', this.data.remindArr)

      }


    })

  },

  onLoad() {
    this.getLaterSearchWord()
    this.getHotWords()
    this.setData({
      times: ((wx.getSystemInfoSync().screenHeight) / 100)
    })

  },
  onShow() {
    console.log('----------------------------:',this.data.times)
    this.setData({
      existed: wx.getStorageSync('ALBUMISCOLLECT')
    })
    this.selectComponent('#miniPlayer').setOnShow()

  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  },
  // 函数节流防止请求过多
  search: tool.throttle(function (e) {
    this.setData({
      keyWord: e[0].detail.value
    })
    setTimeout(() => {
      // this.getData(this.data.currentTap)
    })
  }, 200),

  clear() {
    console.log('清除')
    this.setData({
      keyWord: '',
      info: [],
      currentTap: 0,
      pageState:1
    })
    
    this.getLaterSearchWord()
  },
  search(e) {
    this.setData({
      keyWord: e.detail.value
    })

    console.log('搜索：', this.data.keyWord)

  },
  searchClick() {
    console.log('------------搜索')
    this.data.recentSearch.unshift(this.data.keyWord)
   
    this.data.info = []
    switch (this.data.currentTap) {
      case 0:
        this.albumsSearch()

        break;
        case 1:
          this.peopleSearch()

        break;
        case 2:
          this.audioSearch()

        break;
    
     
    }
  },
  //搜索词存进缓存
  searchWordToCash(word) {
    console.log('------------搜索词存进缓存', word)

    if (!word) {
      return
    } else {
      if (wx.getStorageSync('SEARCHWORD')) {
        let historyWord = wx.getStorageSync('SEARCHWORD')
        let newWord = word + '|' + historyWord
        wx.setStorageSync('SEARCHWORD', newWord)

      } else {
        wx.setStorageSync('SEARCHWORD', word)
      }

    }

  },
  //获取最近搜索词
  getLaterSearchWord() {
    if (wx.getStorageSync('SEARCHWORD')) {
      let word = wx.getStorageSync('SEARCHWORD')
      let originarr = word.split('|')
      let arr = this.unique1(originarr)
      if (arr.length > 6) {
        this.setData({
          recentSearch: arr.slice(0, 6)
        })
      } else {
        this.setData({
          recentSearch: arr
        })
      }
      console.log('获取最近搜索词-----recentSearch', this.data.recentSearch)


    } else {
      this.setData({
        recentSearch: []
      })
    }



  },
  //数组去重
  unique1(arr) {
    var hash = [];
    for (var i = 0; i < arr.length; i++) {
      if (hash.indexOf(arr[i]) == -1) {
        hash.push(arr[i]);
      }
    }
    return hash;
  },
  selectTap(e) {
    console.log('搜索：', e)

    const index = e.currentTarget.dataset.index
    if (this.data.currentTap == index) {
      return
    } else {
      this.setData({
        currentTap: index
      })
      this.data.info = []
      switch (this.data.currentTap) {
        case 0:

          this.albumsSearch()

          break;
        case 1:
          this.peopleSearch()

          break;
        case 2:
          this.audioSearch()

          break;
        default:
          break;
      }
    }

  },
  //专辑搜索
  albumsSearch() {
    wx.showLoading({
      title: '搜索中...',
    })
    let param = {
      'limit': 20,
      'offset': this.data.albumNub * 20,
      'q': this.data.keyWord,
      'sort': "hottest"
    }
    utils.GET(param, utils.albumSearch, res => {
      wx.hideLoading()
      console.log('专辑搜索', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {
        this.searchWordToCash(this.data.keyWord)
        for (let item of res.data.items) {
          this.data.info.push({
            // item.title = item.mediaName                               // 歌曲名称
            // item.id = item.mediaId                                    // 歌曲Id
            // item.coverImgUrl = item.coverUrl                          // 歌曲的封面
            title: item.title,
            id: item.id,
            coverImgUrl: item.cover.middle.url

          })
        }


        this.setData({
          info: this.data.info,
          pageState:2
        })
        console.log('info:', this.data.info)

      }else{
        wx.showToast({
          title: '暂无搜索结果',
          icon:'none'
        })
          this.setData({
            pageState:3
          })
        

      }


    })

  },
  //主播搜索
  peopleSearch() {
    wx.showLoading({
      title: '搜索中...',
    })
    let param = {
      'limit': 20,
      'offset': this.data.peopleNub * 20,
      'q': this.data.keyWord,
      'sort': "hottest"
    }
    utils.GET(param, utils.peopleSearch, res => {
      console.log('主播搜索', res)
      wx.hideLoading()

      if (res.data.items.length > 0 && res.statusCode == 200) {

        for (let item of res.data.items) {
          this.data.info.push({

            title: item.nickname,
            id: item.uid,
            coverImgUrl: item.small_pic

          })
        }


        this.setData({
          info: this.data.info,
          pageState:2
        })
        console.log('info:', this.data.info)

      }else{
        wx.showToast({
          title: '暂无搜索结果',
          icon:'none'
        })
          this.setData({
            pageState:3
          })
        
      }


    })


  },
  //声音搜索
  audioSearch() {
    wx.showLoading({
      title: '搜索中...',
    })
    let param = {
      'limit': 20,
      'offset': this.data.audioNub * 20,
      'q': this.data.keyWord,
      'sort': "hottest"
    }
    utils.GET(param, utils.audioSearch, res => {
      wx.hideLoading()

      console.log('声音搜索', res)
      if (res.data.items.length > 0 && res.statusCode == 200) {
        for (let item of res.data.items) {
          this.data.info.push({
            title: item.title,
            id: item.album_id,
            coverImgUrl: item.image.url
          })
        }
        this.setData({
          info: this.data.info,
          pageState:2
        })
        console.log('info:', this.data.info)

      }else{
        wx.showToast({
          title: '暂无搜索结果',
          icon:'none'
        })
          this.setData({
            pageState:3
          })
        
      }



    })

  },
  // 跳转到播放详情界面
  linkAbumInfo(e) {
    console.log('跳转:', e)
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    if (this.data.currentTap == 0 || this.data.currentTap == 2) {
      wx.navigateTo({
        url: '../abumInfo/abumInfo?id=' + id + '&title=' + title + '&routeType=album'
      })
    } else {
      //进主播页面
      wx.navigateTo({
        url: '../author/author?authorId=' + id
      })
    }

    // const routeType = e.currentTarget.dataset.contentype
    // let url
    // if (routeType === 'album') {
    //   url = `../abumInfo/abumInfo?id=${id}&title=${title}`
    // } else if (routeType === 'media') {
    //   url = `../playInfo/playInfo?id=${id}`
    // } 
    // wx.navigateTo({
    //   url: url
    // })
  },


  getLayoutData() {
    console.log('加载更多')

  },

  // focus() {
  //   this.setData({
  //     showMInibar: false
  //   })
  // },
  // blur() {
  //   this.setData({
  //     showMInibar: true
  //   })
  // }
})