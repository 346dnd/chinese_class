/**
 * 音频播放 composable
 * 统一 TTS 语音播放入口：调用后端 POST /api/utils/tts 生成音频并播放。
 * 后端接口更新（apifox-openapi.json 新增 /api/utils/tts）后，此处由占位实现替换为真实调用。
 */
import { ref } from 'vue'
import { tts, toUserFriendlyError } from '../api/helpers'

export function useAudioPlayer() {
  const isPlaying = ref(false)
  const lastText = ref('')

  // 当前正在播放的 Audio 实例，便于中断上一段
  let currentAudio: HTMLAudioElement | null = null

  /**
   * 播放文本语音（TTS）
   * 1) 调后端 tts(text) 拿到音频绝对地址；2) 用 Audio 播放
   */
  const playAudio = async (text: string) => {
    if (!text) return
    lastText.value = text
    // 中断上一段未播完的音频，避免叠加
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    try {
      const url = await tts(text)
      if (!url) return
      const audio = new Audio(url)
      currentAudio = audio
      isPlaying.value = true
      audio.onended = () => {
        isPlaying.value = false
        if (currentAudio === audio) currentAudio = null
      }
      audio.onerror = () => {
        isPlaying.value = false
        if (currentAudio === audio) currentAudio = null
        // 后端 TTS 文件不存在/加载失败时，原逻辑会静默吞掉，导致"没报错却没声音"。
        // 这里打出可见 warn，方便确认是 404（后端存储未打通）而非前端问题。
        console.warn('[TTS] 音频加载失败（多半是后端 tts 文件不存在/存储未打通），地址：', url)
      }
      try {
        await audio.play()
      } catch (playErr: any) {
        // 浏览器自动播放策略：play() 不在用户手势内（如 setTimeout 自动播报、路由切换后的回调）
        // 会被拒绝（NotAllowedError）。注册一次性手势监听，用户首次交互后自动续播。
        if (playErr && (playErr.name === 'NotAllowedError' || playErr.name === 'AbortError')) {
          const resume = () => {
            audio.play().catch(() => {})
          }
          document.addEventListener('pointerdown', resume, { once: true })
          document.addEventListener('keydown', resume, { once: true })
          document.addEventListener('touchstart', resume, { once: true })
          console.info('[TTS] 浏览器拦截了自动播放，将在你首次点击/触摸页面后继续播放')
          return
        }
        throw playErr
      }
    } catch (e) {
      isPlaying.value = false
      currentAudio = null
      console.error('TTS 播放失败:', toUserFriendlyError(e))
    }
  }

  /** 停止当前播放（用于语音播报开关关闭等场景） */
  const stop = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    isPlaying.value = false
  }

  /** 播放气泡语音（复用最近一次文本） */
  const playBubbleAudio = (text?: string) => {
    const target = text || lastText.value
    if (target) playAudio(target)
  }

  return { isPlaying, lastText, playAudio, playBubbleAudio, stop }
}
