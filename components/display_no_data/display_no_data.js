const app = getApp();

Component({

  properties: {
    code: String, // 0 正常 1 无数据 2 网络异常 3 服务器异常
    hint: {//无数据的提示信息
      type: String,
      value: '暂无美食门店信息返回'
    },
   
    btnShow: {//重新加载按钮是否显示
      type: Boolean,
      value: true
    },
    colorStyle: String, // 页面色彩风格
    backgroundColor: String, // 页面背景色
  },
  data: {
   
  },
  methods: {
    btnClick (e) {
      app.log("----点击了重新加载------"+this.properties.code)
      this.triggerEvent('refresh');
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    app.setTheme(this);
  },
});
