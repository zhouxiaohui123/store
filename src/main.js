// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import element from './plugins/element'
import axios  from 'axios'
import ZKTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

import 'element-ui/lib/theme-chalk/index.css'
//导入全局样式表
import './assets/css/global.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//通过axios请求拦截器添加token，保证拥有获取数据的权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //console.log(config);
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table',ZKTable)
//全局注册vue-quill-editor
Vue.use(VueQuillEditor)
//require styles
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme                        
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  element,
  components: { App },
  template: '<App/>' 
})
