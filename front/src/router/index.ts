import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/preview',
    component: () => import('@/views/index.vue'),
  },
  {
    path: '/preview/write-feel',
    component: () => import('@/views/WriteFeel.vue'),
  },
  {
    path: '/preview/fill-blank',
    component: () => import('@/views/FillBlank.vue'),
  },
  {
    path: '/method/zhaozhouqiao',
    component: () => import('@/views/ZGQExpressMethod.vue'),
  },
  {
    path: '/method/qingming',
    component: () => import('@/views/HUAExpressMethod.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
