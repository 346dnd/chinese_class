import { createRouter, createWebHistory } from 'vue-router'
import { userState, checkLogin } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/preview/write-feel',
    component: () => import('../views/WriteFeel.vue')
  },
  {
    path: '/preview/fill-blank',
    component: () => import('../views/FillBlank.vue')
  },
  {
    path: '/warmup/warmup-game',
    component: () => import('../views/WarmupGame.vue')
  },
  {
    path: '/method/qingming',
    component: () => import('../views/HUAExpressMethod.vue')
  },
  {
    path: '/method/zhaozhouqiao',
    component: () => import('../views/ZGQExpressMethod.vue')
  },
  {
    path: '/creation/talk-culture',
    component: () => import('../views/TalkCulture.vue')
   },
   {
    path: '/moments',
    component: () => import('../views/Moments.vue')
   }
  


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  checkLogin()
  
  if (to.path !== '/login' && !userState.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
