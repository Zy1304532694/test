import App from './App'
import pageTitle from './common/mixins/page-title.js'
import authCheck from './common/mixins/auth-check.js'
import './common/styles/mixins.scss'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.mixin(pageTitle)
Vue.mixin(authCheck)

// 添加全局导航守卫
const whiteList = ['/pages/admin/login'] // 白名单，不需要登录的页面

Vue.prototype.$navigateTo = function(url) {
  const token = uni.getStorageSync('token')
  if (!token && !whiteList.includes(url)) {
    uni.redirectTo({
      url: '/pages/admin/login'
    })
    return
  }
  uni.navigateTo({ url })
}

uni.addInterceptor('navigateTo', {
  invoke(params) {
    const token = uni.getStorageSync('token')
    if (!token && !whiteList.includes(params.url)) {
      uni.redirectTo({
        url: '/pages/admin/login'
      })
      return false
    }
    return params
  }
})

uni.addInterceptor('switchTab', {
  invoke(params) {
    const token = uni.getStorageSync('token')
    if (!token && !whiteList.includes(params.url)) {
      uni.redirectTo({
        url: '/pages/admin/login'
      })
      return false
    }
    return params
  }
})

// 页面启动时检查登录状态
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const token = uni.getStorageSync('token')
if (!token && !whiteList.includes('/' + currentPage?.route)) {
  uni.redirectTo({
    url: '/pages/admin/login'
  })
}

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif