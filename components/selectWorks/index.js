const app = getApp()

Component({
  properties: {
    prop: String, // 0 正常 1 无数据 2 网络异常 3 服务器异常 4 请求失败
    selected: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data: {
    data: [],
    selected: 0,
    isSelectWorks: false,
    sum: 0,
    order: true
  },
  methods: {
    selectThis(e) {
      this.setData({
        selected: e.currentTarget.dataset.index
      })
      let pageNo = this.data.order ? e.currentTarget.dataset.index + 1 : (this.data.data.length - e.currentTarget.dataset.index)
      this.triggerEvent('changeWords', {pageNum: pageNo, pageSize: this.data.pageSize})
      this.closeWords()
    },
    closeWords (e) {
      this.animation.translate('-160vh', 0).step()
      this.setData({
        animation: this.animation.export(),
        isSelectWorks: false
      })
    },
    hideShow(val) {
      this.animation.translate(0, 0).step()
      this.setData({
        isSelectWorks: val.hidShow,
        animation: this.animation.export(),
        sum: val.sum
      })
      // 加载选集
      this.loadWorks()
    },
    loadWorksUp () {
      let arr = []
      for (let i = 1; i <= this.data.sum; i++) {
        if (i === this.data.sum && i % this.data.pageSize !== 0) {
          let start =  arr.length ? arr[arr.length - 1].end + 1 : 1
          arr.push({
            start: start,
            end: i
          })
        }

        if (i % this.data.pageSize === 0) {
          arr.push({
            start: i - this.data.pageSize + 1,
            end: i
          })
        }
      }
      return arr
    },
    loadWorksDown() {
      let arr = []
      let endRes = this.data.sum % this.data.pageSize
      for (let i = this.data.sum; i >= 1; i--) {
        let temp = this.data.sum - i
        if (temp % this.data.pageSize === 0 && i > endRes) {
          arr.push({
            start: i,
            end:  i - this.data.pageSize + 1
          })
        }
        if (i < endRes) {
          arr.push({
            start: endRes,
            end:  1
          })
          return arr
        }
      }
      return arr
    },
    loadWorks () {
      let result = this.data.order ? this.loadWorksUp() : this.loadWorksDown()
      this.setData({
        data: result
      })
    },
    changeOrder() { // 改变排序方式
      let currentOrder = !this.data.order
      this.setData({
        order: currentOrder
      })
      this.loadWorks()
    }
  },
  attached(options) {
    this.animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear'
    })
  }
})