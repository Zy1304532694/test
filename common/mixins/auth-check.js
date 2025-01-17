export default {
  onShow() {
    const token = uni.getStorageSync('token')
    const whiteList = ['/pages/admin/login']
    const currentRoute = '/' + this.$scope?.route
    
    if (!token && !whiteList.includes(currentRoute)) {
      uni.redirectTo({
        url: '/pages/admin/login'
      })
      return
    }
  }
} 