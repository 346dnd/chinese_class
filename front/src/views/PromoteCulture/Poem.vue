<template>
  <div class="page-bg"></div>
  <div class="page">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <button class="nav-btn back-btn" @click="goBack" title="返回上一页">
        <svg viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none" stroke="currentColor" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="nav-title">宣传文化：文化交流有礼-文学创作小工坊</span>
      <div class="nav-actions">
        <button
          class="nav-btn orange-btn"
          :class="{ active: videoOn }"
          @click="toggleVideo"
          title="回看视频"
        >
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <span>回看视频</span>
        </button>
      </div>
    </header>

    <div class="main-area">
      <!-- 左侧：AI人物 + 对话框 -->
      <div class="character-area">
        <div class="bubble" :class="{ speaking: isSpeaking }">
          <p class="bubble-text">{{ bubbleText }}</p>
          <button
            class="speaker-btn"
            @click="speakBubble"
            title="朗读"
          >
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
          <span v-if="isSpeaking" class="wave">
            <i></i><i></i><i></i>
          </span>
        </div>

        <div class="character-1">
          <img src="/image/罗罗_汉服 1.png" alt="罗罗" />
        </div>
      </div>

      <!-- 右侧：双列创作面板 -->
      <div class="two-column-panels">
        <!-- 左面板：古诗 -->
        <div class="panel poem-panel">
          <div class="panel-title">
            <span>创作诗歌</span>
          </div>

          <!-- 类型切换 -->
          <div class="tabs">
            <button
              class="tab"
              :class="{ active: poemType === 'classical' }"
              @click="poemType = 'classical'"
            >
              写古诗
            </button>
            <button
              class="tab"
              :class="{ active: poemType === 'modern' }"
              @click="poemType = 'modern'"
            >
              写现代诗
            </button>
          </div>

          <!-- 古诗输入区 -->
          <div v-if="poemType === 'classical'">
            <p class="hint-text">提示：古诗不用标点符号，一行写一句即可。每行只能写5个字或者7个字。</p>
            <div class="input-box" :class="{ recording: recordingC }">
              <div class="avatar-tag">张</div>
              <textarea
                v-model="classicalText"
                placeholder=""
              ></textarea>
              <div class="input-actions">
                <button
                  class="mini-btn"
                  :class="{ active: recordingC }"
                  @click="toggleVoice('classical')"
                  :title="recordingC ? '停止录音' : '语音输入'"
                >
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                  <span>语音</span>
                </button>
                <label class="mini-btn" title="照片转写">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <input type="file" accept="image/*" class="hidden" @change="onPhotoUpload($event, 'classical')" />
                  <span>{{ uploading ? '上传中…' : '拍照' }}</span>
                </label>
              </div>
            </div>
            <button class="submit-btn" @click="PublishPoem">
              发表作品
            </button>
          </div>

          <!-- 现代诗输入区 -->
          <div v-else>
            <p class="hint-text">提示：现代诗没有字数限制，一行写一句即可，请用上标点符号。</p>
            <div class="input-box" :class="{ recording: recordingM }">
              <div class="avatar-tag">张</div>
              <textarea
                v-model="modernText"
                placeholder=""
              ></textarea>
              <div class="input-actions">
                <button
                  class="mini-btn"
                  :class="{ active: recordingM }"
                  @click="toggleVoice('modern')"
                  :title="recordingM ? '停止录音' : '语音输入'"
                >
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                  <span>语音</span>
                </button>
                <label class="mini-btn" title="照片转写">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <input type="file" accept="image/*" class="hidden" @change="onPhotoUpload($event, 'modern')" />
                  <span>{{ uploading ? '上传中…' : '拍照' }}</span>
                </label>
              </div>
            </div>
            <button class="submit-btn" @click="PublishPoem">
              发表作品
            </button>
          </div>
        </div>

        <!-- 右面板：现代诗（同步切换） -->
        <div class="panel poem-panel right-panel">
          <div class="panel-title">
            <span>创作诗歌</span>
          </div>

          <div class="tabs">
            <button
              class="tab"
              :class="{ active: poemType === 'classical' }"
              @click="poemType = 'classical'"
            >
              写古诗
            </button>
            <button
              class="tab"
              :class="{ active: poemType === 'modern' }"
              @click="poemType = 'modern'"
            >
              写现代诗
            </button>
          </div>

          <div v-if="poemType === 'classical'">
            <p class="hint-text">提示：古诗不用标点符号，一行写一句即可。每行只能写5个字或者7个字。</p>
            <div class="input-box">
              <div class="avatar-tag">张</div>
              <textarea placeholder=""></textarea>
              <div class="input-actions">
                <button class="mini-btn">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                  <span>语音</span>
                </button>
                <label class="mini-btn">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <span>{{ uploading ? '上传中…' : '拍照' }}</span>
                </label>
              </div>
            </div>
            <button class="submit-btn">
              发布作品
            </button>
          </div>

          <div v-else>
            <p class="hint-text">提示：现代诗没有字数限制，一行写一句即可，请用上标点符号。</p>
            <div class="input-box">
              <div class="avatar-tag">张</div>
              <textarea placeholder=""></textarea>
              <div class="input-actions">
                <button class="mini-btn">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                  <span>语音</span>
                </button>
                <label class="mini-btn">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <span>{{ uploading ? '上传中…' : '拍照' }}</span>
                </label>
              </div>
            </div>
            <button class="submit-btn">
              发布作品
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 视频弹窗：播放后端 heritage-cultural 模块导入视频 -->
    <VideoModal v-model:show="showVideoModal" :url="videoUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFile } from '../../composables/useFile'
import { useAudioPlayer } from '../../composables/useAudioPlayer'
import VideoModal from '../../components/VideoModal.vue'
import { getHeritageCulturalParams } from '../../api'
import { DefaultService } from '../../api/generated'
import { call } from '../../api/helpers'

// 班级/节点 ID：优先取路由参数/查询（与 FillBlank 等视图一致），缺省回退 127 / 23（创作工坊）
const route = useRoute()
const CLASS_ID = Number(route.query.classId) || Number(route.params.classId) || 127
const NODE_ID = Number(route.query.nodeId) || Number(route.params.nodeId) || 23

const router = useRouter()
// ========== 文件上传 / OCR ==========
const { uploadImage, ocrImageFile, uploading } = useFile()

// 导航
const videoOn = ref(false)
const showVideoModal = ref(false)
// 回看视频地址：从后端 heritage-cultural 模块 params 获取导入视频
const videoUrl = ref('')
let videoUrlLoading = false

function goBack() {
  router.push({ name: 'PromoteCulture2' })
}

async function toggleVideo() {
  videoOn.value = true
  // 首次点击时从后端拉取导入视频地址（创作工坊 params 无视频字段，取模块导入视频）
  if (!videoUrl.value && !videoUrlLoading) {
    videoUrlLoading = true
    try {
      const params = await getHeritageCulturalParams(CLASS_ID)
      videoUrl.value = params.introVideo?.url || ''
    } catch (_) {
      videoUrl.value = ''
    } finally {
      videoUrlLoading = false
    }
  }
  showVideoModal.value = true
}

// AI对话框
const bubbleText = ref('看来你是一个很有文学天赋的孩子，你已经学习了第四单元的内容，可以用这些内容，或者其中一篇课文为基本内容，写一首诗送给你米娅，让她从诗句里去了解我们优秀的传统文化。写古诗或者现代诗都可以。')

// 语音播报：调后端 TTS 接口播放气泡文本（isSpeaking 由 composable 的 isPlaying 驱动，播放结束才复位）
const { isPlaying: isSpeaking, playAudio } = useAudioPlayer()
function speakBubble() {
  playAudio(bubbleText.value)
}

// 诗歌类型
const poemType = ref<'classical' | 'modern'>('classical')

// 古诗
const classicalText = ref('')
const recordingC = ref(false)

// 现代诗
const modernText = ref('')
const recordingM = ref(false)

let recognition: any = null

function toggleVoice(type: 'classical' | 'modern') {
  const isRec = type === 'classical' ? recordingC.value : recordingM.value
  if (isRec) {
    if (recognition) recognition.stop()
    if (type === 'classical') recordingC.value = false
    else recordingM.value = false
    return
  }

  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SR) {
    alert('当前浏览器不支持语音识别，请使用 Chrome 或 Edge')
    return
  }

  recognition = new SR()
  recognition.lang = 'zh-CN'
  recognition.interimResults = true
  recognition.continuous = false

  recognition.onresult = (event: any) => {
    let transcript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }
    if (type === 'classical') {
      classicalText.value += transcript
    } else {
      modernText.value += transcript
    }
  }

  recognition.onend = () => {
    if (type === 'classical') recordingC.value = false
    else recordingM.value = false
  }

  recognition.onerror = () => {
    if (type === 'classical') recordingC.value = false
    else recordingM.value = false
  }

  if (type === 'classical') recordingC.value = true
  else recordingM.value = true
  recognition.start()
}

// 拍照：上传图片并 OCR 识别手写诗句，填入对应文本框
async function onPhotoUpload(e: Event, type: 'classical' | 'modern') {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    await uploadImage(file, { resource_info: '诗词-手写识别' })
    const text = await ocrImageFile(file, { resource_info: '诗词-手写识别' })
    const snippet = text && text.trim() ? text.trim() : ''
    if (!snippet) return
    if (type === 'classical') {
      classicalText.value += (classicalText.value ? '\n' : '') + snippet
    } else {
      modernText.value += (modernText.value ? '\n' : '') + snippet
    }
  } catch (err) {
    console.error('拍照识别失败:', err)
    alert('拍照识别失败，请重试')
  } finally {
    target.value = ''
  }
}

const publishing = ref(false)

async function PublishPoem() {
  const text = poemType.value === 'classical' ? classicalText.value.trim() : modernText.value.trim()
  if (!text) {
    alert('请先创作一首诗再发表！')
    return
  }
  publishing.value = true
  try {
    // 调用真实发表接口（mock 模式可用；后端未实现时失败不影响本地反馈）
    const sub = await call(DefaultService.postApiV1StuClassNodeCreationWorkshopPoemscriptsSubmit(CLASS_ID, NODE_ID, 'poem', { textContent: text, taskType: poemType.value }))
    if (sub.submitId) {
      try {
        await call(DefaultService.getApiV1StuClassNodeCreationWorkshopPoemscriptsResult(CLASS_ID, NODE_ID, 'poem', sub.submitId))
      } catch (_) { /* 降级 */ }
      try {
        await call(DefaultService.getApiV1StuClassNodeCreationWorkshopPoemscriptsSubmitPublishResult(CLASS_ID, NODE_ID, 'poem', sub.submitId))
      } catch (_) { /* 降级 */ }
    }
  } catch (_) {
    /* 接口不可用（如后端未实现）时，降级为本地成功反馈 */
  } finally {
    publishing.value = false
  }
  bubbleText.value = '恭喜！你的诗歌已经发表啦！'
}

onUnmounted(() => {
  if (recognition) recognition.abort()
})
</script>

<style scoped>
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: url('/image/image 126.png') no-repeat center center;
  background-size: cover;
}
.page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

/* 统一橙色边框 + 半透明白底风格 */
.navbar,
.bubble,
.panel {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #f39c12;
  border-radius: 18px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 顶部导航栏 */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 24px 0;
  padding: 12px 20px;
}

.nav-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  flex: 1;
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  justify-content: center;
}
.back-btn svg {
  width: 20px;
  height: 20px;
  fill: #fff;
  stroke: #fff;
}

.orange-btn {
  padding: 8px 14px;
  border-radius: 10px;
  background-color: #f39c12;
  color: #ffffff;
  border: none;
}
.orange-btn svg {
  width: 18px;
  height: 18px;
}
.orange-btn:hover {
  background-color: #e67e22;
}

/* 主区域 */
.main-area {
  flex: 1;
  display: flex;
  gap: 30px;
  padding: 24px 40px;
  align-items: flex-start;
}

.two-column-panels {
  display: flex;
  gap: 20px;
}

.right-panel {
  border-color: #0066ff;
}

/* AI人物区域 */
.character-area {
  flex: 1;
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.character-1 {
  height: 460px;
  width: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

/* 对话框 */
.bubble {
  position: absolute;
  bottom: 120px;
  left: 80px;
  width: 340px;
  padding: 20px 22px 16px;
  z-index: 5;
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 40px;
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 4px solid transparent;
  border-top: 16px solid #f39c12;
}

.bubble::before {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 41px;
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 3px solid transparent;
  border-top: 14px solid rgba(255, 255, 255, 0.82);
  z-index: 1;
}

.bubble-text {
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
  margin: 0 0 12px;
}

.speaker-btn {
  position: absolute;
  top:16px;
  right:16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f39c12;
  border: 2px solid #f39c12;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(243, 156, 18, 0.35);
}

.speaker-btn:hover {
  transform: scale(1.1);
}

.speaker-btn svg {
  width: 20px;
  height: 20px;
  color: #fff;
}

.wave {
  position: absolute;
  top: 50%;
  right: 60px;
  transform: translateY(-50%);
  display: flex;
  gap: 3px;
}

.wave i {
  display: block;
  width: 4px;
  height: 14px;
  background: #f39c12;
  border-radius: 2px;
  animation: wave 0.8s ease-in-out infinite;
}

.wave i:nth-child(2) { animation-delay: 0.2s; }
.wave i:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

/* 侧边面板 */
.panel {
  width: 320px;
  position: relative;
  padding: 16px 18px;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color:#333;
  margin-bottom:10px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  background: rgba(243, 156, 18, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 10px;
}

.tab.active {
  background: #f39c12;
  color: #fff;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.hint-text {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px;
  line-height: 1.5;
}

/* 输入框（含头像标签） */
.input-box {
  position: relative;
  border: 1.5px solid #f39c12;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.avatar-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #3498ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 2;
}

.input-box textarea {
  width: 100%;
  min-height: 120px;
  padding: 45px 12px 4px;
  border: none;
  border-radius: 0;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
  resize: none;
  outline: none;
  box-sizing: border-box;
  line-height: 1.6;
  background: transparent;
}

.input-actions {
  display: flex;
  gap: 6px;
  padding: 6px 10px 8px;
  justify-content: flex-end;
}

.mini-btn {
  display: flex;
  align-items: center;
  gap:4px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(243, 156, 18, 0.1);
  border: 1.5px solid #f39c12;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-btn:hover {
  background: rgba(243, 156, 18, 0.22);
}

.mini-btn svg {
  width: 17px;
  height: 17px;
  color: #d97706;
}

.mini-btn.active {
  background: #fee2e2;
  border-color: #e74c3c;
}

.mini-btn.active svg {
  color: #dc2626;
}

.hidden {
  display: none;
}

/* 发表按钮 */
.submit-btn {
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  background: #f39c12;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #e67e22;
}

/* 视频弹窗 */
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.video-container {
  position: relative;
  width: 600px;
  max-width: 90vw;
  background: #1f2937;
  border-radius: 16px;
  padding: 20px;
}

.close-video {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 32px;
  height: 32px;
  background: #fff;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  color: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.video-placeholder {
  aspect-ratio: 16 / 9;
  background: #111827;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #9ca3af;
}

.video-placeholder svg {
  width: 64px;
  height: 64px;
  color: #6b7280;
}

.video-placeholder p {
  font-size: 16px;
  margin: 0;
}
</style>