const app = getApp()

Component({
  properties: {
    noContent: String 
  },
  data: {
    
  },
  methods: {
  
  },
  attached(options) {
    console.log(this.data.noContent)
  }
})