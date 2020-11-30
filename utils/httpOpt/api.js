import { request, apiFormat } from './https'
// API域名
const domain = {
  'test':'https://tapi.kaishustory.com', // 测试环境
  'gamma':'https://gapi.kaishustory.com', // 测试环境
  'prod': 'https://api.kaishustory.com' // 生产环境
}
const appId = {
  'test': 268174,
  'gamma': 786474,
  'prod': 786474
}
// 页面初始化
const initApi = '/open/user/initialize'                                    // post
// 校验用户状态信息
const checkStatusApi = '/open/user/check/status'                           // get
// 首页频道列表
const layoutGroupApi = '/open/home/layoutGroup'                            // get
// 频道故事列表
const layoutApi = '/open/home/layout'                                      // get                                 
// 音频搜索
const searchApi = '/open/media/search'                                     // get                                      
// 播放音频
const mediaPlayApi = '/open/media/play'                                    // get                               
// 电台推荐列表
const fmApi = '/open/media/fm/recommend'                                   // get
// 我购买的
const boughtApi = '/open/content/bought'                                   // get
// 历史记录
const historyApi = '/open/play/history'                                    // get  
// 添加历史记录
const saveHistoryApi = '/ubd/open/listenHistory/batch/save'                // post
// 收藏故事
const mediaFavoriteApi = '/open/media/favorites'                           // get
// 收藏专辑
const albumFavoriteApi = '/open/album/favorites'                           // get  
// 添加故事收藏
const mediaFavoriteAddApi = '/open/media/favorite/add'                     // get    
// 取消故事收藏
const mediaFavoriteCancelApi = '/open/media/favorite/cancel'               // get
// 添加专辑收藏
const albumFavoriteAddApi = '/open/album/favorite/add'                     // get
// 取消专辑收藏
const albumFavoriteCancelApi = '/open/album/favorite/cancel'               // get
// 音频是否收藏
const isFavoriteApi = '/open/media/favorite/exist'                         // get
// 专辑是否收藏
const isAlbumFavoriteApi = '/open/album/favorite/exist'                    // get
// 查询专辑故事
const albumMediaApi = '/open/album/medias'                                 // get
// 微信授权
const authApi = '/open/user/auth'                                          // post
// 手机号登录
const loginApi = '/open/user/mobile/login'                                 // post
// 微信登录
const loginWxApi = '/open/user/wechat/login'                               // post
// 刷新token
const refreshTokenApi = '/open/user/refreshToken'                          // post
// 开通会员
const vipListApi = '/open/vip/openPage'                                    // get
// 获取购买签名
const signatureApi = '/open/buy/signature'                                 // post
// 购买下单接口
const buyApi = '/open/buy/create'                                          // post
// 查询支付结果接口
const buyResultApi = '/open/buy/payResult'                                 // get
// 获取用户信息
const userInfoApi = '/open/user/info'                                      // get
// 会员信息
const vipInfoApi = '/open/vip/basicInfo'                                   // get

export const init = (data) => request(initApi, data, 'POST')
export const checkStatus = (params) => request(checkStatusApi, params)
export const layoutGroup = (params) => request(layoutGroupApi, params)
export const layout = (params) => request(layoutApi, params)
export const search = (params) => request(searchApi, params)
export const mediaPlay = (params) => request(mediaPlayApi, params)
export const fm = (params) => request(fmApi, params)
export const bought = (params) => request(boughtApi, params)
export const history = (params) => request(historyApi, params)
export const saveHistory = (data) => request(saveHistoryApi, data, 'POST')
export const mediaFavorite = (params) => request(mediaFavoriteApi, params)
export const albumFavorite = (params) => request(albumFavoriteApi, params)
export const mediaFavoriteAdd = (params) => request(mediaFavoriteAddApi, params)
export const mediaFavoriteCancel = (params) => request(mediaFavoriteCancelApi, params)
export const albumFavoriteAdd = (params) => request(albumFavoriteAddApi, params)
export const albumFavoriteCancel = (params) => request(albumFavoriteCancelApi, params)
export const isFavorite = (params) => request(isFavoriteApi, params)
export const isAlbumFavorite = (params) => request(isAlbumFavoriteApi, params)
export const albumMedia = (params) => request(albumMediaApi, params)
export const auth = (data) => request(authApi, data, 'POST')
export const login = (data) => request(loginApi, data, 'POST')
export const loginWx = (data) => request(loginWxApi, data, 'POST')
export const refreshToken = (data) => request(refreshTokenApi, data, 'POST')
export const vipList = (params) => request(vipListApi, params)
export const signature = (data) => request(signatureApi, data, 'POST')
export const buy = (data) => request(buyApi, data, 'POST')
export const buyResult = (params) => request(buyResultApi, params)
export const userInfo = (params) => request(userInfoApi, params)
export const vipInfo = (params) => request(vipInfoApi, params)

// export const domain = domain
// export const appId = appId