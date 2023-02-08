/**======================================================================================
 * 内容说明： 导入vue和elementui相关
 ======================================================================================*/
import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
/**======================================================================================
 * 内容说明： 导入router路由相关
 ======================================================================================*/
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import routes from './routes'

/**======================================================================================
 * 内容说明： 导入axios相关
 ======================================================================================*/
import axios from 'axios'
/**======================================================================================
 * 内容说明： 使用相关组件
 ======================================================================================*/
Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
/**======================================================================================
 * 内容说明： 配置axios的全局基本路径全局属性配置
 ======================================================================================*/
axios.defaults.baseURL='http://localhost:80/'
Vue.prototype.$http = axios
/**======================================================================================
 * 内容说明： 路由配置
 ======================================================================================*/
const router = new VueRouter({
  routes
})
/**======================================================================================
 * 内容说明： 路由前置拦截器，用作登录检查
 ======================================================================================*/
/*
router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})
*/
/**======================================================================================
 * 内容说明： 创建Vue对象，挂载 #app元素 ， 见Vue.app
 ======================================================================================*/

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')