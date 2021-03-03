/**
 * @name: index
 * 开发者编写的首页index,配置（labels）的类型，通过切换（selectTap）获取不同类型列表
 * 这里开发者必须提供的字段数据(数据格式见听服务小场景模板开发说明文档)：
 * labels: {
 *     show: false,
 *     data: [{
 *       "name": "推荐",
 *       "id": 1
 *     }, {
 *       "name": "精品",
 *       "id": 2
 *     }, {
 *       "name": "潮流",
 *       "id": 3
 *     }]
 *   },
 * 可选内容，当show为false时不显示分类列表
 * 2、_getList函数，这里我们给开发者提供labels对应点击的的值，其余参数开发者自行添加；
 *    _getList函数获取的list最终转换为模板需要的字段，并setData给info。
 * 3、由于模板内的字段名称可能和后台提供不一样，在获取list后重新给模板内的字段赋值：如下以本页列表数据为例
 * list.map((item, index) => {
 *     item.title = item.mediaName                               // 歌曲名称
 *     item.id = item.mediaId                                    // 歌曲Id
 *     item.src = item.coverUrl                                  // 歌曲的封面
 *     item.contentType = 'album'                                // 类别（例如专辑或歌曲）
 *     item.isVip = true                                         // 是否是会员
 *   })
 * 这里做了下数据字段的转换
 * 
 * 4、配置页面的快捷入口
 * lalyLtn：[
 *     {icon: '/images/zjst.png', title: "最近收听", name: 'latelyListen', islogin:false},
 *   ]
 *  可选内容，当show为false时不显示分类列表,数量 1~2个
 */
const app = getApp()
// import { getMedia } from '../../developerHandle/playInfo'

module.exports = {
  data: {
   

  },

  
  // swiperChange(e){
  //   console.log(e.detail.current)
  //   let idx = e.detail.current
  //   if(idx == 9){

  //   }else{

  //   }

  // },
  onLoad(options) {    
  },
  onReady() {

  },

  
 
 
}