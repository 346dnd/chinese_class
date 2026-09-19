/**
 * 文件上传 / 下载 / OCR 统一 composable
 * 底层调用 api/index.ts：
 *   uploadFile（POST /utils/upload）、getDownloadUrl（GET /utils/download/{id}）、
 *   ocrImage（POST /utils/ocr）、resolveDownloadUrl（解析相对/绝对地址）
 * 封装前端常见流程：上传图片、上传音频、上传后 OCR 识别、录音并上传。
 *
 * 来源(权威): openapi/默认模块.openapi.json → /api/utils/upload | /download/{id} | /ocr
 */
import { ref, type Ref } from 'vue'
import { uploadFile, getDownloadUrl, ocrImage, resolveDownloadUrl } from '../api/helpers'
import type { UploadFileOptions } from '../api/helpers'
import type { UtilsOcrResp } from '../types'
import type { UtilsUploadResp } from '../api/generated'

/** 上传后的资源：原始响应 + 可直接用于 <img>/<audio>/<video> src 的完整地址 */
export interface UploadedResource {
  resp: UtilsUploadResp
  url: string
}

/**
 * 浏览器 MediaRecorder 默认产出 audio/webm;codecs=opus（或 mp4/AAC），
 * 而服务端 ASR（百度短语音识别）仅支持 pcm/wav/amr/m4a 的 16k 单声道音频，
 * 直接上传 webm 会被后端拒绝（"不支持的音频格式"）。
 * 这里统一在浏览器侧把录音转码为 16k 单声道 PCM WAV，保证后端可识别。
 */

/** 多声道混为单声道 */
const downmixToMono = (audioBuffer: AudioBuffer): Float32Array => {
  const ch = audioBuffer.numberOfChannels
  if (ch === 1) return audioBuffer.getChannelData(0)
  const len = audioBuffer.length
  const out = new Float32Array(len)
  for (let c = 0; c < ch; c++) {
    const data = audioBuffer.getChannelData(c)
    for (let i = 0; i < len; i++) out[i] += data[i] / ch
  }
  return out
}

/** 线性插值重采样到目标采样率 */
const resample = (input: Float32Array, fromRate: number, toRate: number): Float32Array => {
  if (fromRate === toRate) return input
  const ratio = fromRate / toRate
  const newLen = Math.max(1, Math.round(input.length / ratio))
  const out = new Float32Array(newLen)
  for (let i = 0; i < newLen; i++) {
    const pos = i * ratio
    const i0 = Math.floor(pos)
    const i1 = Math.min(i0 + 1, input.length - 1)
    const frac = pos - i0
    out[i] = input[i0] * (1 - frac) + input[i1] * frac
  }
  return out
}

/** 将 [-1,1] 浮点采样编码为 16bit PCM WAV Blob */
const encodeWav = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // 单声道
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]))
    s = s < 0 ? s * 0x8000 : s * 0x7fff
    view.setInt16(offset, s, true)
    offset += 2
  }
  return new Blob([view], { type: 'audio/wav' })
}

/** 将任意录音 blob 解码 → 重采样至 16k 单声道 → 编码为 WAV File */
const blobToWav = async (blob: Blob, targetRate = 16000): Promise<File> => {
  const arrayBuffer = await blob.arrayBuffer()
  const Ctx: typeof AudioContext =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const audioCtx = new Ctx()
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const mono = downmixToMono(audioBuffer)
    const resampled = resample(mono, audioBuffer.sampleRate, targetRate)
    const wavBlob = encodeWav(resampled, targetRate)
    return new File([wavBlob], `voice-${Date.now()}.wav`, { type: 'audio/wav' })
  } finally {
    audioCtx.close().catch(() => {})
  }
}

export function useFile() {
  const uploading: Ref<boolean> = ref(false)
  const error: Ref<string> = ref('')
  const isRecording: Ref<boolean> = ref(false)

  let mediaRecorder: MediaRecorder | null = null
  let recordChunks: BlobPart[] = []

  /** 根据已上传的 resourceId 拉取下载链接并解析为可预览地址 */
  const fetchDownloadUrl = async (resourceId: string): Promise<string> => {
    const { url } = await getDownloadUrl(resourceId)
    return resolveDownloadUrl(url)
  }

  /** 上传任意文件，返回资源信息与可预览地址 */
  const upload = async (file: File, options?: UploadFileOptions): Promise<UploadedResource> => {
    uploading.value = true
    error.value = ''
    try {
      const resp: UtilsUploadResp = await uploadFile(file, options)
      // 注意：下载接口 GET /utils/download/{id} 要的是数字 id，不是 resource_id（rs...）
      const url = await fetchDownloadUrl(String(resp.id ?? ''))
      return { resp, url }
    } catch (e: any) {
      error.value = e?.message || '上传失败'
      throw e
    } finally {
      uploading.value = false
    }
  }

  /** 上传图片（media_type=image），返回资源信息与可预览地址 */
  const uploadImage = (file: File, options?: Omit<UploadFileOptions, 'media_type'>) =>
    upload(file, { ...options, media_type: 'image' })

  /** 上传音频（media_type=audio），返回资源信息与可预览地址 */
  const uploadAudio = (file: File, options?: Omit<UploadFileOptions, 'media_type'>) =>
    upload(file, { ...options, media_type: 'audio' })

  /**
   * 上传图片并 OCR 识别手写/印刷文字，返回识别出的文本。
   * 流程：uploadImage → ocrImage(resourceId)
   */
  const ocrImageFile = async (file: File, options?: Omit<UploadFileOptions, 'media_type'>): Promise<string> => {
    const { resp } = await uploadImage(file, options)
    const result: UtilsOcrResp = await ocrImage(resp.resource_id ?? '')
    return result.text
  }

  /** 开始录音（需用户手势触发；浏览器需授予麦克风权限） */
  const startRecording = async () => {
    if (isRecording.value) return
    // 麦克风 API 仅在安全上下文可用（https 或 http://localhost / 127.0.0.1）。
    // 通过局域网 IP（如 http://192.168.x.x:5174）或非 https 地址访问时 navigator.mediaDevices 为 undefined。
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('当前页面环境不支持麦克风录音，请通过 localhost 或 https 地址访问本页面')
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    recordChunks = []
    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) recordChunks.push(e.data)
    }
    mediaRecorder.start()
    isRecording.value = true
  }

  /** 停止录音并上传，返回音频资源信息与可预览地址 */
  const stopRecordingAndUpload = (options?: Omit<UploadFileOptions, 'media_type'>): Promise<UploadedResource> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        reject(new Error('尚未开始录音'))
        return
      }
      mediaRecorder.onstop = async () => {
        isRecording.value = false
        mediaRecorder?.stream.getTracks().forEach((t) => t.stop())
        const rawBlob = new Blob(recordChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
        // 转码为 16k 单声道 PCM WAV（百度 ASR 仅支持 pcm/wav/amr/m4a 16k 单声道）
        let file: File
        try {
          file = await blobToWav(rawBlob, 16000)
        } catch (e) {
          // 转码失败（极少数浏览器不支持 decodeAudioData）时，退化为原始 blob，
          // 但这种情况本就无法被后端识别，故抛出明确错误便于排查
          reject(new Error('语音转码失败：当前浏览器不支持音频解码，请更换 Chrome/Edge 最新版'))
          return
        }
        try {
          resolve(await uploadAudio(file, options))
        } catch (e) {
          reject(e)
        } finally {
          recordChunks = []
        }
      }
      mediaRecorder.stop()
    })
  }

  /** 取消录音并释放麦克风（不上传） */
  const stopRecording = () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return
    mediaRecorder.onstop = () => {
      isRecording.value = false
      mediaRecorder?.stream.getTracks().forEach((t) => t.stop())
      recordChunks = []
    }
    mediaRecorder.stop()
  }

  return {
    uploading,
    error,
    isRecording,
    upload,
    uploadImage,
    uploadAudio,
    ocrImageFile,
    fetchDownloadUrl,
    resolveDownloadUrl,
    startRecording,
    stopRecordingAndUpload,
    stopRecording
  }
}
