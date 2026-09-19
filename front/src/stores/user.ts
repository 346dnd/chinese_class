/**
 * 用户状态 Pinia store
 * 替代原 stores/user.js，login 接入 OpenAPI /api/v1/accounts:login
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '../api/helpers'
import type { AccountUser } from '../types'

export const useUserStore = defineStore('user', () => {
  // ===== state =====
  const token = ref<string>('')
  const userInfo = ref<AccountUser | null>(null)

  // ===== getters =====
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const nickname = computed(() => userInfo.value?.realName || userInfo.value?.username || '')
  const avatar = computed(() => userInfo.value?.avatarUrl ?? '')

  // ===== actions =====

  /** 登录（接入 OpenAPI /api/v1/accounts:login）。失败（如密码错误 401）直接抛出，由调用方展示后端真实错误信息 */
  async function login(username: string, password: string): Promise<boolean> {
    const data = await apiLogin(username, password)
    token.value = data.token
    userInfo.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data.user))
    return true
  }

  /** 用后端返回的用户信息刷新本地状态（供路由守卫校验通过后回写） */
  function setUser(u: AccountUser) {
    userInfo.value = u
    localStorage.setItem('userInfo', JSON.stringify(u))
  }

  /** 退出登录 */
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  /** 检查登录状态（从本地存储恢复 / 调用 /api/v1/accounts:status） */
  function checkLogin() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('userInfo')
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        userInfo.value = JSON.parse(savedUser)
      } catch {
        logout()
      }
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    nickname,
    avatar,
    login,
    logout,
    checkLogin,
    setUser
  }
})
