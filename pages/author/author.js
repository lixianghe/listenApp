const app = getApp()
import utils from '../../utils/util'

Page({
  // mixins: [require('../../developerHandle/latelyListen')],
  data: {
    authorId:'',
    showModal: false,
    req: false,
    countPic: '/images/media_num.png',
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
    info: [],
    colorStyle: app.sysInfo.colorStyle,
    backgroundColor: app.sysInfo.backgroundColor,
    screen: app.globalData.screen,
    info: '',
    currentTap: 0,
    scrollLeft: 0,
    
    mainColor: app.globalData.mainColor
  },
  screen: app.globalData.screen,
 
  onLoad(options) {
    console.log('-------author:',options.authorId)
    if(options.authorId){
      this.data.authorId = options.authorId
     this.getAuthorListen( )
    }
    
  },
  onShow() {
    
    //  this._getList()

    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  },

   // 跳转到播放详情界面
   linkAbumInfo(e) {
    // let id = e.currentTarget.dataset.id
    // const src = e.currentTarget.dataset.src
    // const title = e.currentTarget.dataset.title
    // wx.setStorageSync('img', src)
    // const routeType = e.currentTarget.dataset.contentype
 
    // wx.navigateTo({
    //   url: '../abumInfo/abumInfo?id='+id+'&title='+title+'&routeType=album'
    // })
   

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
  clickHadle(e){
    console.log('播放全部专辑id',e.detail.typeid)
    let albumid = e.detail.typeid
    // wx.setStorageSync('playing', true)
  
    // this.getAllList(albumid)
  
  },

   // 获取所有的播放列表
   getAllList(albumid) {
    this.data.canplay = []
    // 假设allList是canplay，真实情况根据接口来
    console.log('专辑id:',albumid)
    let param={
      'limit': 15,
      'offset': 0,
      'sort': "asc"
    }
    utils.GET(param,utils.albumAllmedias+albumid+'/tracks',res=>{
      console.log('专辑列表所有数据:',res)
       if(res.data && res.statusCode == 200){
        
         for (let item of res.data.items) {
           this.data.canplay.push({
            title :item.title ,                            // 歌曲名称
            id : item.id  ,                                  // 歌曲Id
            dt :this.formatMusicTime(item.duration) ,                                  // 歌曲的时常
            coverImgUrl :item.image.url ,                         // 歌曲的封面
            src:item.play_info.play_64.url,
            feeType:item.is_vip_free 
           })
         }
         this.setData({
          canplay:this.data.canplay

         })
         wx.setStorageSync('canplay', this.data.canplay)
         wx.setStorageSync('allList', this.data.canplay)
         //minibar  播放

         app.globalData.canplay = JSON.parse(JSON.stringify(this.data.canplay))
         app.globalData.songInfo = app.globalData.canplay[0]
         this.initAudioManager(this.data.canplay)
         wx.setStorageSync('playing', true)

         console.log('playing:',wx.getStorageSync('playing'))
           
          
         this.selectComponent('#miniPlayer').setOnShow()
         this.selectComponent('#miniPlayer').watchPlay()
         this.selectComponent('#miniPlayer').toggle()
       }

    })
  },
  //最近收听
  getAuthorListen(){
    let param = {
     
    }
    let Url = 'iot/openapi-smart-device-api/announcers/'+this.data.authorId+'/albums'
    utils.PLAYHISTORYGET(param,Url,res=>{
      app.log('作者专辑:',res)
      if(res.data.items.length > 0 && res.statusCode == 200){
        // item.title = item.mediaName                               // 歌曲名称
        // item.id = item.mediaId                                    // 歌曲Id
        // item.src = item.coverUrl                                  // 歌曲的封面
        // item.contentType = 'album'                                // 类别（例如专辑或歌曲）
        // item.isVip = true                                         // 是否是会员
        let laterArr = []
        for(let i = 0;i <res.data.items.length;i++ ){
          console.log('---------',i)
          if( !res.data.items[i].track ||res.data.items[i].track== null ||  res.data.items[i].track.played_secs== null){
            res.data.items[i].track =new Object()
            res.data.items[i].track.played_secs = 0
          }else{
            res.data.items[i].track.played_secs = res.data.items[i].track.played_secs

          }

          laterArr.push({
            title:res.data.items[i].announcer.ptitle,
            id:res.data.items[i].announcer.id,
            src:res.data.items[i].announcer.avatar_url,
            contentType:'album',
            isHome:true,
            
            count:utils.calculateCount( res.data.items[i].play_count),
            isVip:wx.getStorageInfoSync('USERINFO').is_vip,
            // perceent:(res.data.items[i].track.played_secs/res.data.items[i].track.duration)*100

          })
        }
          this.setData({
            req: true,
            info:laterArr
          })
          app.log('info:',this.data.info)
        
       

      }else{
        this.setData({
          showModal: true
        })
      }

    })
    

  },
  _getList() {
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
  close() {
    this.setData({
      showModal: false
    })
  }
})