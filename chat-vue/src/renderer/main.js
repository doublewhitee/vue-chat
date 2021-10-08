import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 使用normalize.css
import 'normalize.css/normalize.css'

// vue-socket.io
import VueSocketIO from 'vue-socket.io'
import { BASE_URL } from './config/constant'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.prototype.$store = store

// 事件总线
Vue.prototype.$bus = new Vue()

Vue.use(ElementUI)

// use vue-socket.io
Vue.use(new VueSocketIO({
  debug: true,
  connection: BASE_URL
}))

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
