// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import element from './plugins/element'
import axios  from 'axios'

import 'element-ui/lib/theme-chalk/index.css';
//导入全局样式表
import './assets/css/global.css'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  element,
  components: { App },
  template: '<App/>'
})
