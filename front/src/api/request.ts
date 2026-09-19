/**
 * axios 实例 + 请求封装
 * - baseURL 默认走相对路径 /api（由 vite.config.js 代理转发到真实后端 192.168.3.22:8080），可用 VITE_API_BASE_URL 覆盖
 * - 统一处理 { code, msg, data } 返回体
 * - USE_MOCK=true 时跳过网络请求直接返回 mock（后端未启动时保证页面可用）
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '../types'

/** 是否使用 mock 数据（后端未启动时为 true，接入后端后改为 false） */
export const USE_MOCK = false

/**
 * 后端基础地址（不含 /api/v1 前缀，接口路径自带 /v1、/v4）。
 * 默认指向后端默认端口 8080；可用环境变量 VITE_API_BASE_URL 覆盖，
 * 例如本地用 3001 端口时设置 VITE_API_BASE_URL=http://localhost:3001/api
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const request: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：携带 token（后端要求 Bearer 方案）
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：解包 { code, msg, data }
// 注意：axios 要求 fulfilled 处理器返回 AxiosResponse，因此这里把业务 data 写回
// response.data 再返回 response；callApi 最终取 res.data 即解包后的业务数据。
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data as ApiResponse
    if (body.code === 200) {
      response.data = body.data
      return response
    }
    // 401（token 失效 / 未登录）：清除本地会话，路由守卫会在下次导航时退回登录页
    if (body.code === 401) {
      localStorage.removeItem('token')
      // 同步清空内存中的登录态，保证下次导航守卫能正确识别为“未登录”
      import('../stores/user')
        .then(({ useUserStore }) => {
          try {
            useUserStore().logout()
          } catch {
            /* pinia 未初始化时忽略 */
          }
        })
        .catch(() => {})
    }
    // 业务错误（如 400/500）：抛出后端在 body.msg 中给出的真实原因，便于前端直接展示
    return Promise.reject(new Error(body.msg || `接口返回 code=${body.code}`))
  },
  // axios 默认把 4xx/5xx 视为错误，走到这里。把后端响应体里的 msg / message 提取出来，
  // 否则上层只能拿到笼统的 "Request failed with status code 400"，无法定位真实原因。
  (error) => {
    const data = (error as { response?: { data?: { msg?: string; message?: string } } })?.response?.data
    const msg = data?.msg || data?.message || error?.message || '请求失败，请重试'
    return Promise.reject(new Error(msg))
  }
)

/**
 * 将后端 / 网络错误映射为用户友好的中文提示，供各 view 的 catch 块统一展示。
 * 后端全部采用统一信封 { code, msg, data }，业务错误信息在 body.msg 中。
 */
export function toUserFriendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/node content not configured/i.test(msg)) {
    return '该模块的课程内容尚未在后端配置（node content not configured），请联系老师 / 管理员在后端配置内容后重试。'
  }
  if (/missing or invalid authorization/i.test(msg)) {
    return '登录状态已失效，请重新登录。'
  }
  if (/invalid username or password/i.test(msg)) {
    return '账号或密码错误，请重试。'
  }
  if (/network|ECONNREFUSED|timeout|Failed to fetch|Network Error/i.test(msg)) {
    return '网络连接失败，请确认后端服务（192.168.3.22:8080）已启动且可访问。'
  }
  return msg || '操作失败，请重试。'
}

/** 判断是否为「节点内容未配置」（后端尚未配置该模块的课程内容） */
export function isNodeNotConfigured(err: unknown): boolean {
  return err instanceof Error && /node content not configured/i.test(err.message)
}

/**
 * 通用请求方法
 * - USE_MOCK=true 时直接返回 mockData，不发网络请求
 * - USE_MOCK=false 时走真实 axios
 */
export async function callApi<T>(
  config: AxiosRequestConfig,
  mockData: T
): Promise<T> {
  if (USE_MOCK) {
    // 模拟网络延迟，便于后续切换真实接口时观察 loading
    await new Promise((r) => setTimeout(r, 200))
    return mockData
  }
  const res = await request.request(config)
  return res.data as T
}
