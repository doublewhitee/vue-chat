import Vue from 'vue'
import Router from 'vue-router'

import Layout from '@/layout'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login')
    },
    {
      path: '/chat',
      component: Layout,
      redirect: '/chat/group',
      children: [
        {
          path: 'group',
          component: () => import('@/views/Chat')
        },
        {
          path: 'friend',
          component: () => import('@/views/Friend')
        }
      ]
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
})
