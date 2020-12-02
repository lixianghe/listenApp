## 车载小程序听服务模板

听服务类小场景在功能上有很多的交集，使得在开发不同的项目时会写很多相同功能的代码。听服务模板即是将听服务的基本功能抽离出来，对开发这提供一个可配置的，快速开发的车载听服务小场景。

## 代码结构
├─components  ------------------------------------------------------------- // 公共组件文件夹  
|     ├─selectWorks   ------------------------------------------------------- // 选集组件  
|     |      ├─wxml、wxss、js、json  
|     ├─recycle-view  ------------------------------------------------------ // 列表懒加载组件  
|     |      ├─behavior.js  
|     |      ├─index.js  
|     |      ├─README.md  
|     |      ├─utils  
|     |      |   ├─recycle-context.js  
|     |      |   ├─recycle-data.js  
|     |      |   ├─transformRpx.js  
|     |      |   └viewport-change-func.js  
|     |      ├─recycle-view  
|     |      |      ├─wxml、wxss、js、json  
|     |      ├─recycle-item  
|     |      |      ├─wxml、wxss、js、json  
|     ├ ─noData  --------------------------------------------------- // 空数据组  
|     |   ├─wxml、wxss、js、json  
|     ├─miniPlayer  -------------------------------------------------- // 底部播放栏组件  
|     |     ├─wxml、wxss、js、json  
|     ├─bgConfirm ---------------------------------------------------- // 公共提示组件  
|     |     ├─wxml、wxss、js、json  
├─images  -------------------------------------------------- // 图片文件夹  
|   ├─........png  
├─pages   ---------------------------------------------------// 页面文件夹  
|   ├─index    ----------------------------------------------- // 首页  
|   |   ├─index-horizontal.wxss   ---------------------------------------- // 横屏样式  
|   |   ├─index-vertical.wxss   ------------------------------------------ // 竖屏样式  
|   |   ├─index.js  
|   |   ├─index.json  
|   |   ├─index.wxml  
|   |   └index.wxss    --------------------------------------------------- // 组件页面公共样式，加载横竖屏样式  
|   ├─playInfo   ---------------------------------------------- // 播放详情  
|   |    ├─wxml、wxss、js、json  
|   ├─personalCenter   ---------------------------------------- // 个人中心  
|   |       ├─wxml、wxss、js、json  
|   ├─latelyListen   ------------------------------------------ // 最近收听  
|   |      ├─wxml、wxss、js、json  
|   ├─abumInfo   ---------------------------------------------- // 专辑详情  
|   |    ├─wxml、wxss、js、json  
├─server   ---------------------------------------------------- // 模拟服务端代码（可忽略）  
|   ├─index.html  
|   ├─server.js  
|   ├─data  
|   |  ├─abumInfo.json  
|   |  └index.json  
├─utils   ---------------------------------------------------// 工具配置文件夹  
|   ├─config.js  -----------------------------------------------// 公共配置  
|   ├─https.js  ------------------------------------------------// 请求封装  
|   ├─md5.js   -------------------------------------------------// md5工具函数  
|   ├─sha256.js   ----------------------------------------------// sha256工具函数  
|   ├─sign.js  -------------------------------------------------// 签名认证函数  
|   ├─util.js --------------------------------------------------// 工具类  
|   ├─pageOtpions   -------------------------------------------------// 页面基础配置  ##开发者使用##  
|   |      └pageOtpions.js  
|   ├─httpOpt   -----------------------------------------------------// 页面数据及请求相关配置  ##开发者使用##  
|   |    └httpOpt.js  
├─app.js   -----------------------------------------------------// 小程序主函数入口  
├─app.json   ---------------------------------------------------// 小程序基础配置  ##开发者配置tabbar相关##  
├─app.wxss   ---------------------------------------------------// 小程序公共样式  
├─jsconfig.json  
├─project.config.json  
├─sitemap.json  

## 开发者具体使用

开发者在 app.json中配置tabBar相关信息
```json
"tabBar": {
    "color": "#cacbd0",
    "selectedColor": "#fa6500",
    "backgroundColor": "#202020",
    "list": [
    {
      "pagePath": "pages/index/index",
      "iconPath": "images/index.png",
      "selectedIconPath": "images/index-select.png",
      "text": "推荐"
    },
    {
      "pagePath": "pages/personalCenter/personalCenter",
      "iconPath": "images/admin.png",
      "selectedIconPath": "images/admin-select.png",
      "text": "我的"
    }
  ]
  },
```

开发者在 pageOtpions.js中配置mini player相关信息
```json
  // mini player按钮配置
  miniBtns: [
    {
      name: 'pre',                          // 上一首
      img: '/images/pre.png',               // 对应的图标
    },
    {
      name: 'toggle',                       // 暂停
      img: {
        stopUrl: '/images/stop.png' ,      // 播放状态的图标
        playUrl: '/images/play.png'        // 暂停状态的图标
      }
    },
    {
      name: 'next',                        // 下一首
      img: '/images/next.png'              // 下一首对应的图标
    }，
    {
      name: 'like',                        // 收藏
      img: {
        likeNone: '/images/like_none.png' ,// 未收藏时的图标
        like: '/images/like.png'           // 收藏后的图标
      }
    }
  ]
```
对开发者的要求：
btn  1~4个，播放/暂停必选，其他可选；
图标：必须，.png、.jpg、.jpeg 格式；

播放详情相关配置
```json
// 播放详情页面按钮配置
  playInfoBtns: [
    {
      name: 'pre',                                             // 上一首                
      img: '/images/pre2.png',                                 // 上一首对应的图标
    },
    {
      name: 'toggle',                                          // 播放/暂停
      img: {
        stopUrl: '/images/stop2.png' ,                         // 播放状态的图标
        playUrl: '/images/play2.png'                           // 暂停状态的图标
      }
    },
    {
      name: 'next',                                             // 下一首
      img: '/images/next2.png'                                  // 下一首对应的图标
    },
    {
      name: 'loopType',                                         // 循环模式
      img: {
        listLoop: '/images/listLoop.png' ,                      // 列表循环对应的图标
        singleLoop: '/images/singleLoop.png',                   // 单曲循环对应的图标
        shufflePlayback: '/images/shufflePlayback.png'          // 随即循环对应的图标
      }
    },
    {
      name: 'more',                                             // 弹出播放列表
      img: '/images/more2.png'                                  // 弹出播放列表对应的图标
    }
  ]
  ```
  对开发者要求： 同上