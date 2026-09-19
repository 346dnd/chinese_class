import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getAccountStatus } from '../api/helpers'

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
    component: () => import('../views/ZZQExpressMethod.vue')
  },
   {
    path: '/creation/talk-culture',
    component: () => import('../views/TalkCulture.vue')
   },
  {
    path: '/moments',
    component: () => import('../views/Moments.vue')
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('../views/report.vue')
  },

  // ========== 文化交流有礼（宣传文化）模块 ==========
  {
    path: '/promote/culture',
    name: 'PromoteCulture2',
    component: () => import('../views/PromoteCulture/PromoteCulture.vue')
  },
  {
    path: '/promote/handcopy-creation',
    name: 'HandcopyCreation',
    component: () => import('../views/PromoteCulture/HandcopyCreation.vue')
  },
  {
    path: '/promote/post',
    name: 'Post',
    component: () => import('../views/PromoteCulture/Post.vue')
  },
  {
    path: '/promote/poem',
    name: 'Poem',
    component: () => import('../views/PromoteCulture/Poem.vue')
  },
  {
    path: '/promote/create-play',
    name: 'CreatePlay',
    component: () => import('../views/PromoteCulture/CreatePlay.vue')
  },
  {
    path: '/promote/tcm-workshop',
    name: 'TcmWorkshop',
    component: () => import('../views/PromoteCulture/TcmWorkshop.vue')
  },
  {
    path: '/promote/create-idea',
    name: 'CreateIdea',
    component: () => import('../views/PromoteCulture/CreateIdea.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 防止此前 mock 模式遗留的假 token / 过期 token 让所有业务接口静默 401，
// 表现为“已登录但页面全空 / 像没连上后端”。
// 注意：tokenValidated 是模块级变量，整页刷新会重新置为 false，
// 因此“仅校验一次”只针对单次 SPA 会话，刷新后仍会再校验一次。
let tokenValidated = false

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  // 每次导航都从 localStorage 恢复会话（刷新后内存态丢失，必须靠它）
  userStore.checkLogin()

  // 本地存在 token 时，向后端校验一次有效性，并用返回的用户信息刷新本地状态。
  // 关键改动：校验失败【不再】直接 logout()，避免“刷新即登出”的死循环——
  // 只要 localStorage 里的会话仍然有效就信任它用于渲染；真正的登出交由
  // 业务接口 401 时由响应拦截器统一处理（见 api/request.ts）。
  if (userStore.token && !tokenValidated) {
    tokenValidated = true
    try {
      const status = await getAccountStatus()
      if (status && status.loggedIn && status.user) {
        userStore.setUser(status.user)
      }
    } catch {
      // 网络抖动等：保留本地会话，不强制登出
    }
  }

  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
