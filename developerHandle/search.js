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
import { search } from "../utils/httpOpt/api";
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
  // 凯叔搜索api数据
  _getList(params) {
    /**
     * 这里我们给开发者提供keywords和labels对应点击的的值，其余参数开发者自行添加
     */
     let opt = {
      pageNum: 1,
      pageSize: 20,
      contentType: params.label,
      keyWord: params.keyWord
    }
    search(opt).then((res) => {
      let layoutData = [];
      console.log(res);
      res.list.forEach((item) => {
        if (params.label === "album") {
          layoutData.push({
            id: item.album.albumId,
            title: item.album.albumName,
            src: item.album.coverUrl,
            contentType: item.contentType,
          });
        } else {
          layoutData.push({
            id: item.media.mediaId,
            title: item.media.mediaName,
            src: item.media.coverUrl,
            contentType: item.contentType,
          });
        }
      });
      console.log("layoutData", layoutData);
      this.setData({
        info: layoutData,
      });
    })
    .catch((err) => {
      console.log(JSON.stringify(err) + "73行");
    });
  },
};