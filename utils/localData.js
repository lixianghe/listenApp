// 静态展示数据，展示界面时应用，不会请求后台服务
const showData = {
  index: [{
      id: "1",
      src: "http://p1.music.126.net/pq6wgGmqiseGTVlNrP0Mkw==/109951164948535052.jpg",
      title: "超好听的翻唱合集"
    },
    {
      id: "2",
      src: "http://p3.music.126.net/M-Are2JONsEGnOWOtNGomg==/109951164906980396.jpg",
      title: "睡前轻快音乐"
    },
    {
      id: "3",
      src: "http://p3.music.126.net/UOhYjUFS7V-_RgXxQmrRKw==/109951165088874864.jpg",
      title: "甜甜夏日"
    },
    {
      id: "1",
      src: "http://p1.music.126.net/pq6wgGmqiseGTVlNrP0Mkw==/109951164948535052.jpg",
      title: "超好听的翻唱合集"
    },
    {
      id: "2",
      src: "http://p3.music.126.net/M-Are2JONsEGnOWOtNGomg==/109951164906980396.jpg",
      title: "睡前轻快音乐"
    },
    {
      id: "3",
      src: "http://p3.music.126.net/UOhYjUFS7V-_RgXxQmrRKw==/109951165088874864.jpg",
      title: "甜甜夏日"
    }
  ],
  // 专辑-歌曲列表
  abumInfo: {
    id: 1,
    total: 5,
    pageNo: 1,
    pageSize: 10,
    data: [
      {
        title: "示例歌曲一",
        id: 1481657185,
        src: "https://music.163.com/song/media/outer/url?id=1481657185.mp3",
        // singer: "傲七爷",
        coverImgUrl: "http://p4.music.126.net/cIR63lyPGgQ4mAyuOTg8lA==/109951165109878587.jpg",
        dt: '02:39'
      },
      {
        title: "示例歌曲二",
        id: 1443838552,
        src: "https://music.163.com/song/media/outer/url?id=1443838552.mp3",
        // singer: "Felix Bennett",
        coverImgUrl: "http://p4.music.126.net/wUog39IHoJb76pL0AVCFNQ==/109951165348116023.jpg",
        dt: '03:35'
      },
      {
        title: "示例歌曲三",
        id: 1397679310,
        src: "http://music.163.com/song/media/outer/url?id=1397679310.mp3",
        // singer: "徐秉龙",
        coverImgUrl: "http://p3.music.126.net/c2yS6qm0ukZTkgdSKlsNZA==/109951164528154947.jpg",
        dt: '03:34'
      },
      {
        title: "示例歌曲四",
        id: 1474342935,
        src: "https://music.163.com/song/media/outer/url?id=1474342935.mp3",
        // singer: "黑猫警长Giao哥",
        coverImgUrl: "http://p3.music.126.net/MuhJIkUIN2_j7Cg38t3ogQ==/109951165273552799.jpg",
        dt: '01:37'
      },
      {
        title: "示例歌曲五",
        id: 1348896822,
        src: "https://music.163.com/song/media/outer/url?id=1348896822.mp3",
        // singer: "CMJ",
        coverImgUrl: "http://p3.music.126.net/MOmuZfdM4aUBgleLUDevoA==/109951164269620044.jpg",
        dt: '01:53'
      }
    ]
  }
}

module.exports = {
  showData
}