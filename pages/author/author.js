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
    this.selectComponent('#miniPlayer').setOnShow()
    this.selectComponent('#miniPlayer').watchPlay()
  },
  onHide() {
    this.selectComponent('#miniPlayer').setOnHide()
  },

   // 跳转到播放详情界面
   linkAbumInfo(e) {
    let id = e.currentTarget.dataset.id
    const src = e.currentTarget.dataset.src
    const title = e.currentTarget.dataset.title
    wx.setStorageSync('img', src)
    const routeType = e.currentTarget.dataset.contentype
 
    wx.navigateTo({
      url: '../albumInfo/albumInfo?id='+id+'&title='+title+'&routeType=album'
    })
   

  },

  // clickHadle(e){
  //   console.log('播放全部专辑id',e.detail.typeid)
  //   let albumid = e.detail.typeid
  //   wx.setStorageSync('playing', true)
  
  //   this.getAllList(albumid)
  
  // },

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
            coverImgUrl : app.impressImg(item.image.url,280,280),                         // 歌曲的封面
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
      console.log('作者专辑:',res)
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
            title:res.data.items[i].title,
            id:res.data.items[i].id,
            src:res.data.items[i].cover.large.url,
            contentType:'album',
            isHome:false,
            
            count:utils.calculateCount( res.data.items[i].play_count),
            isVip:wx.getStorageInfoSync('USERINFO').is_vip,
            // perceent:(res.data.items[i].track.played_secs/res.data.items[i].track.duration)*100

          })
        }
        wx.setNavigationBarTitle({
          title:res.data.items[0].announcer.nickname ,
        })
       
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
 
  close() {
    wx.navigateBack({
      
    })
    // this.setData({
    //   showModal: false
    // })
  }
})