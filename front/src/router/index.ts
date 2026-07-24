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
    name: 'Preview',
    component: () => import('@/views/Preview.vue')
  },
  {
    path: '/warmup',
    name: 'Warmup',
    component: () => import('@/views/Warmup.vue')
  },
  {
    path: '/method',
    name: 'Method',
    component: () => import('@/views/Method.vue')
  },
  {
    path: '/creation',
    name: 'Creation',
    component: () => import('@/views/Creation.vue')
  },
  {
    path: '/chat',
    name: 'ChatRoom',
    component: () => import('@/views/ChatRoom.vue')
  },
  {
    path: '/homework',
    name: 'Homework',
    component: () => import('@/views/Homework.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
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
