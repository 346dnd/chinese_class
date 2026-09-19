/**
 * API 辅助工具集（非接口层，不对 generated/ 做任何修改）
 * - OpenAPI 运行时配置（base / token），只读取环境变量与 localStorage
 * - call(): 解包后端统一信封 { code, msg, data }
 * - 错误/时长格式化、下载地址解析、登录用户字段映射
 *
 * 视图/store/composable 直接 import { DefaultService } from '@/api/generated'
 * 再用本文件的 call() 解包即可，符合"其它文件对齐 generated"的原则。
 */
import { OpenAPI } from './generated/core/OpenAPI'
import { request as __request } from './generated/core/request'
import { DefaultService } from './generated'
import type { AccountUser } from '../types'
import type { UtilsUploadResp, UtilsDownloadResp, PostMomentsReq } from './generated'

// ============ OpenAPI 运行时配置（只读取，不改 generated） ============
const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''
// generated 生成的 URL 已含 /api/v1，所以 BASE 去掉结尾的 /api
OpenAPI.BASE = envBase ? envBase.replace(/\/api$/, '') : ''
OpenAPI.TOKEN = () => Promise.resolve(localStorage.getItem('token') ?? '')
OpenAPI.WITH_CREDENTIALS = false

// ============ 信封解包 ============
// generated 的 DefaultService 返回 CancelablePromise<{ code, msg, data }>，
// 这里统一解包成 data，并处理 401 清 token / 非 200 抛错。
export async function call<T>(
  p: Promise<{ code: number; msg: string | null; data: T }>
): Promise<T> {
  const r = await p
  if (r && typeof r === 'object' && 'code' in r) {
    if (r.code === 200) return (r.data ?? null) as T
    if (r.code === 401) {
      try {
        localStorage.removeItem('token')
      } catch {
        /* ignore */
      }
    }
    throw new Error(r.msg || `接口返回 code=${r.code}`)
  }
  return r as T
}

// ============ 登录用户字段映射（generated 的 GetUserResp 用 name/avatar） ============
export function mapUser(u: any): AccountUser {
  if (!u) return u
  return {
    ...u,
    realName: u.realName ?? u.name,
    avatarUrl: u.avatarUrl ?? u.avatar,
  } as AccountUser
}

// ============ 错误友好化 ============
export function toUserFriendlyError(err: unknown): string {
  if (err instanceof Error) return err.message || '请求失败，请稍后重试'
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message?: unknown }).message || '请求失败，请稍后重试')
  }
  return '操作失败，请稍后重试'
}

// 判断是否为"节点未配置"类错误（用于前端降级提示）
export function isNodeNotConfigured(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  return /node.*not.*config|节点.*未配置|not\.?configured/i.test(msg)
}

// ============ 时长格式化 ============
export function formatDurationZh(sec?: number | null): string {
  if (sec == null || Number.isNaN(sec)) return '0秒'
  const total = Math.max(0, Math.floor(sec))
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m <= 0) return `${s}秒`
  return `${m}分${s}秒`
}

export function formatDurationClock(sec?: number | null): string {
  if (sec == null || Number.isNaN(sec)) return '00:00'
  const total = Math.max(0, Math.floor(sec))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ============ 下载地址解析 ============
// 后端返回的相对路径可能形如 /api/storage/xxx：storage 实际部署在独立服务（端口与 API 不同），
// 需去掉 /api 前缀，并优先用专用 VITE_STORAGE_BASE_URL 拼接；未配置时回退到 API host 根（去掉 /api）。
const STORAGE_BASE = (import.meta.env.VITE_STORAGE_BASE_URL as string) || ''

export function resolveDownloadUrl(url: string): string {
  if (!url) return url
  // 已经是绝对地址（http/https），原样返回
  if (/^https?:\/\//i.test(url)) return url

  // TTS / 存储类文件：后端返回的相对路径形如 /storage/xxx 或 /api/storage/xxx，
  // storage 服务独立部署（端口与 API 不同），需去掉可能的 /api 前缀并用专用 STORAGE_BASE 拼接。
  if (/\/storage\//.test(url)) {
    const path = url.replace(/^\/api/, '') // 去掉可能存在的 /api 前缀 → /storage/xxx
    if (STORAGE_BASE) return STORAGE_BASE.replace(/\/+$/, '') + path
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || ''
    if (apiBase.startsWith('http')) return apiBase.replace(/\/api\/?$/, '') + path
    return path // 相对路径，由部署环境（同域代理）处理
  }

  // 其它相对路径：拼到 API base，避免 base 与 url 前缀重复（如 /api + /api/... 双重 /api）
  const base = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const baseNoSlash = base.replace(/\/+$/, '')
  const basePath = baseNoSlash.replace(/^https?:\/\/[^/]+/, '')
  if (basePath && url.startsWith(basePath)) return url
  return baseNoSlash + (url.startsWith('/') ? url : '/' + url)
}

// ============ 文件上传 / 下载 / OCR（对齐 generated 的 /utils 接口） ============
export interface UploadFileOptions {
  /** 文件类型：image / audio / video 等（generated 必填，缺失时默认 image） */
  media_type?: string
  /** 文件来源（generated 必填，缺失时默认 student） */
  resource_source?: string
  /** 文件简介 */
  resource_info?: string
  /** 压缩图片 */
  image_compress?: boolean
  /** 压缩视频 */
  video_compress?: boolean
  /** 是否上传 OSS */
  upload_oss?: boolean
}

export async function uploadFile(file: File, options?: UploadFileOptions): Promise<UtilsUploadResp> {
  const media_type = options?.media_type ?? 'image'
  const resource_source = options?.resource_source ?? 'student'
  return call(
    DefaultService.postApiUtilsUpload({
      file,
      media_type,
      resource_source,
      resource_info: options?.resource_info,
      image_compress: options?.image_compress,
      video_compress: options?.video_compress,
      upload_oss: options?.upload_oss,
    })
  )
}

export async function getDownloadUrl(resourceId: string, urlExpired?: number): Promise<UtilsDownloadResp> {
  return call(DefaultService.getApiUtilsDownload(resourceId, urlExpired))
}

export async function ocrImage(resourceId: string): Promise<{ text: string }> {
  return call(DefaultService.postApiUtilsOcr({ resourceId }))
}

// ============ TTS 文本转语音（新增接口 POST /api/utils/tts） ============
// 入参 text（query），返回 { data: { url } }；url 为以 / 开头的相对路径，需用 resolveDownloadUrl 解析为可播放的绝对地址
export async function tts(text: string): Promise<string> {
  const data = await call<{ url: string }>(DefaultService.postApiUtilsTts(text))
  return resolveDownloadUrl(data.url)
}

// ============ 登录 / 状态（generated 形状缺口的少量适配） ============
// 登录：后端返回 { token, user: GetUserResp(name/avatar) }，统一映射为前端 AccountUser(realName/avatarUrl)
export async function login(
  username: string,
  password: string
): Promise<{ token: string; user: AccountUser }> {
  const data = await call(DefaultService.postApiV1AccountsLogin({ username, password }))
  return { token: data.token, user: mapUser(data.user) }
}

// 获取登录状态：GetUserResp 没有 loggedIn 字段，能拿到用户即视为已登录
export async function getAccountStatus(): Promise<{ loggedIn: boolean; user: AccountUser | null }> {
  try {
    const data = await call(DefaultService.getApiV1AccountsStatus())
    if (!data || !data.id) return { loggedIn: false, user: null }
    return { loggedIn: true, user: mapUser(data) }
  } catch {
    return { loggedIn: false, user: null }
  }
}

// ============ 发布朋友圈动态（generated 形状缺口补丁） ============
// 注意：openapi 把 POST /api/stu/class/{classId}/moments 的请求体 PostMomentsReq
// 错标成了「响应类型」，openapi-typescript-codegen 因此生成的
// DefaultService.postApiStuClassMoments(classId) 不带 requestBody 参数，
// 无法直接传 content。这里用 generated 的底层 __request 直接发带 body 的 POST，
// 绕开该缺陷；字段结构严格对齐 PostMomentsReq（content 必填，source/images 可选）。
export async function createMoment(
  classId: number,
  payload: PostMomentsReq
): Promise<PostMomentsReq | null> {
  const resp = await __request(OpenAPI, {
    method: 'POST',
    url: '/api/stu/class/{classId}/moments',
    path: { classId },
    body: payload,
    mediaType: 'application/json',
  })
  return call<PostMomentsReq>(resp as any)
}
