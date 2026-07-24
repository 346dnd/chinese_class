import axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { Response } from '@/types'

const instance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use((config) => {
  const studentId = localStorage.getItem('studentId')
  if (studentId) {
    config.headers['X-Student-Id'] = studentId
  }
  return config
})

const errorMessages: Record<number, string> = {
  40001: '请填写完整信息哦~',
  40002: '输入格式不正确，请检查后重试',
  40101: '请先登录哦~',
  40102: '登录已过期，请重新登录',
  40401: '环节不存在，请联系老师',
  42201: '请先输入内容哦~',
  42220: '请输入文明用语哦~',
  42901: '操作太频繁啦，请休息一下~',
  50001: '服务器开小差了，请稍后再试'
}

instance.interceptors.response.use(
  (response: AxiosResponse<Response>) => {
    const data = response.data
    if (data.code !== 0) {
      const message = errorMessages[data.code] || data.msg || '发生错误，请稍后再试'
      console.error(message)
      return Promise.reject(new Error(message))
    }
    return response
  },
  (error) => {
    const message = error.response?.data?.msg || '网络错误，请稍后再试'
    console.error(message)
    return Promise.reject(new Error(message))
  }
)

export const get = async <T>(url: string, params?: Record<string, any>): Promise<Response<T>> => {
  const response = await instance.get(url, { params })
  return response.data as Response<T>
}

export const post = async <T>(url: string, data?: any): Promise<Response<T>> => {
  const response = await instance.post(url, data)
  return response.data as Response<T>
}

export const upload = async <T>(url: string, formData: FormData): Promise<Response<T>> => {
  const response = await instance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data as Response<T>
}

export { instance as axiosInstance }
