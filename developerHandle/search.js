/**
 * @name: search
 * 开发者编写的搜索页面,开发者提供需提供：
 * 1、lables:[]，搜索页面的分类label例如：
 * labels: [
 *   {value: 'album', label: '专辑'},
 *   {value: 'media', label: '故事'}
 * ]
 * 2、_getList函数，这里我们给开发者提供keywords和labels对应点击的的值，其余参数开发者自行添加；
 *    _getList函数获取的list最终转换为模板需要的字段，并setData给info。
 * 3、由于模板内的字段名称可能和后台提供不一样，在获取list后重新给模板内的字段赋值：如下
 * list.map((item, index) => {
      item.title = item.mediaName                               // 歌曲名称
      item.id = item.mediaId                                    // 歌曲Id
      item.coverImgUrl = item.coverUrl                          // 歌曲的封面
    })
 */
// import { search } from "../utils/httpOpt/api";
const { showData } = require("../utils/httpOpt/localData");

module.exports = {
  data: {
    // 搜素页面分类的lables
    labels: [
      {value: 'album', label: '专辑'},
      {value: 'media', label: '故事'}
    ]
  },
  onShow() {},
  async onLoad(options) {},
  // 模拟搜索
  async _getList(params) {
    /**
     * 这里我们给开发者提供keywords和labels对应点击的的值，其余参数开发者自行添加
     */
     let opt = {
      pageNum: 1,
      pageSize: 20,
      contentType: params.label,
      keyWord: params.keyWord
    }
    // 模拟返回数据
    let data = await this.searchData(opt)
    data.map(item => {
      item.id = item.id
      item.title = item.title
      item.coverImgUrl = item.coverImgUrl
    })
    this.setData({
      info: data,
    })
  },
  searchData(opt){
    let data = showData.abumInfo.data
    return data
  }
};