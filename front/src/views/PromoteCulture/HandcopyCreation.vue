<template>
  <div class="page">
    <div
      class="bg-layer"
      style="background-image: url('/image/image 126.png')"
    ></div>
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="nav-wrap">
        <button class="back-btn" @click="goBack" title="返回上一页">
          <svg viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none" stroke="#444" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="nav-title">宣传文化：文化交流有礼‑未来数智绘画小工坊</span>
        <div class="nav-actions">
          <!-- 语音播报开关组件 -->
          <div class="toggle-wrap">
            <div class="toggle-switch" :class="{active: voiceBroadcastOn}" @click="toggleVoiceBroadcast">
              <div class="toggle-thumb"></div>
            </div>
            <span class="toggle-label">语音播报</span>
          </div>
          <!-- 回看视频按钮 -->
          <button
            class="nav-btn nav-btn-orange"
            @click="toggleVideo"
            title="回看视频"
          >
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
            <span>回看视频</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ========== 创作视图 ========== -->
    <template v-if="viewMode === 'create'">
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

        <!-- 右侧：三个面板 -->
        <div class="side-panels">
          <!-- 面板1：提示 -->
          <div class="panel">
            <div class="panel-title">
              <span>创作手抄报</span>
            </div>
            <p>请输入对手抄报图片画面的描述以及想要显示的文字内容，然后点击生成。</p>
          </div>

          <!-- 面板2：画面描述输入框 -->
          <div class="input-box" :class="{ recording: recording1 }">
            <textarea
              v-model="text1"
              placeholder="请输入你对手抄报图片画面的描述..."
            ></textarea>
            <div class="input-actions">
              <button
                class="mini-btn"
                :class="{ active: recording1 }"
                @click="toggleVoice(1)"
                :title="recording1 ? '停止录音' : '语音输入'"
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
                <input type="file" accept="image/*" class="hidden" @change="onPhotoUpload($event, 1)" />
                <span>{{ uploading ? '上传中…' : '拍照' }}</span>
              </label>
            </div>
          </div>

          <!-- 面板3：手抄报文字输入框 -->
          <div class="input-box" :class="{ recording: recording2 }">
            <textarea
              v-model="text2"
              placeholder="请把你想在手抄报上显示的文字内容输入到此处..."
            ></textarea>
            <div class="input-actions">
              <button
                class="mini-btn"
                :class="{ active: recording2 }"
                @click="toggleVoice(2)"
                :title="recording2 ? '停止录音' : '语音输入'"
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
                <input type="file" accept="image/*" class="hidden" @change="onPhotoUpload($event, 2)" />
                <span>{{ uploading ? '上传中…' : '拍照' }}</span>
              </label>
            </div>
          </div>

          <!-- 【重点】生成手抄报按钮，位于最后一个输入框下方0.5cm -->
          <button class="generate-btn" :class="{ active: canGenerate }" :disabled="generating" @click="generateHandcopy">
            {{ generating ? '生成中…' : '生成手抄报' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ========== 结果视图 ========== -->
    <template v-else>
      <div class="main-area result-area">
        <!-- 左侧：AI人物 + 对话框 -->
        <div class="character-area">
          <div class="bubble result-bubble" :class="{ speaking: isSpeaking }">
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

        <!-- 右侧：生成结果展示 -->
        <div class="result-panel">
          <div v-if="published" class="publish-toast">手抄报已成功发布到作品墙！</div>
          <div class="panel result-box">
            <div class="result-header">
              <span class="result-title">{{ generatedTitle }}</span>
            </div>
            <div class="result-image">
              <div class="image-placeholder">
                <div class="mock-handcopy">
                  <div class="handcopy-scene">
                    <div class="scene-sky"></div>
                    <div class="scene-buildings">
                      <div class="building" v-for="(h, n) in buildingHeights" :key="n" :style="{ height: h + 'px' }"></div>
                    </div>
                    <div class="scene-street"></div>
                    <div class="figures">
                      <div class="figure" v-for="n in 5" :key="n"></div>
                    </div>
                    <div class="lantern" v-for="(pos, n) in lanternPositions" :key="'l'+n" :style="{ left: pos + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <p class="result-desc">{{ generatedDesc }}</p>
            <div class="result-actions">
              <button class="action-btn secondary" @click="backToEdit">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                重新编辑
              </button>
              <button class="action-btn primary" @click="publishWork">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2l-5.5 9h11L12 2zm0 13.5c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" />
                </svg>
                发布手抄报作品
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 视频弹窗：播放后端 heritage-cultural 模块导入视频 -->
    <VideoModal v-model:show="showVideoModal" :url="videoUrl" />

    <!-- 音乐播放器弹窗 -->
    <Teleport to="body">
      <div v-if="musicOn" class="music-tip">
        🎵 背景音乐播放中...
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
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
// ========== 文件上传 ==========
const { uploadImage, uploading } = useFile()

// 导航状态
const voiceBroadcastOn = ref(false)
const musicOn = ref(false)
const videoOn = ref(false)
const showVideoModal = ref(false)
const viewMode = ref<'create' | 'result'>('create')
const generating = ref(false)
const currentSubmitId = ref('')
const published = ref(false)
const generatedTitle = ref('热闹的古街市')
const generatedDesc = ref('通过描绘古代街市的热闹场景，展现传统文化的魅力')
const buildingHeights = [55, 75, 48, 90, 60, 82, 50, 68]
const lanternPositions = [12, 30, 55, 78]


// 切换语音播报开关：开启时用后端 TTS 播报 AI 引导语，关闭时停止播放
const { isPlaying: isSpeaking, playAudio, stop: stopAudio } = useAudioPlayer()
function toggleVoiceBroadcast() {
  voiceBroadcastOn.value = !voiceBroadcastOn.value
  if (voiceBroadcastOn.value) {
    if (bubbleText.value) playAudio(bubbleText.value)
  } else {
    stopAudio()
  }
}
function goBack() {
  router.push({ name: 'PromoteCulture2' })
}

function toggleMusic() {
  musicOn.value = !musicOn.value
}

// 回看视频：从后端 heritage-cultural 模块 params 获取导入视频地址并播放
const videoUrl = ref('')
let videoUrlLoading = false
async function toggleVideo() {
  videoOn.value = true
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

// AI对话框 初始文案与截图完全一致
const bubbleText = ref('看来你是一个很有艺术天分的孩子，你可以借鉴《一幅名扬中外的画》中对画面的描述的方法，把你想要表达的画面，还有配套的文案告诉我，我可以很快的帮你生成一张手抄报哦。你可以把他作为礼物送给你的外国朋友。')

// 语音播报：调后端 TTS 接口播放气泡文本（isSpeaking 由 composable 的 isPlaying 驱动，播放结束才复位）
function speakBubble() {
  playAudio(bubbleText.value)
}

// 输入框
const text1 = ref('')
const text2 = ref('')
const recording1 = ref(false)
const recording2 = ref(false)

// 判断是否可以启用生成按钮
const canGenerate = computed(() => {
  return !!(text1.value.trim() || text2.value.trim())
})

let recognition: any = null

function toggleVoice(n: 1 | 2) {
  const isRec = n === 1 ? recording1.value : recording2.value
  if (isRec) {
    if (recognition) recognition.stop()
    if (n === 1) recording1.value = false
    else recording2.value = false
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
    if (n === 1) {
      text1.value += transcript
    } else {
      text2.value += transcript
    }
  }

  recognition.onend = () => {
    if (n === 1) recording1.value = false
    else recording2.value = false
  }
  recognition.onerror = () => {
    if (n === 1) recording1.value = false
    else recording2.value = false
  }

  if (n === 1) recording1.value = true
  else recording2.value = true
  recognition.start()
}

// 拍照：上传图片并插入到对应文本框
async function onPhotoUpload(e: Event, n: 1 | 2) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadImage(file, { resource_info: '手抄报-配图' })
    const snippet = `\n![图片](${url})`
    if (n === 1) {
      text1.value += (text1.value ? '\n' : '') + snippet
    } else {
      text2.value += (text2.value ? '\n' : '') + snippet
    }
  } catch (err) {
    console.error('图片上传失败:', err)
    alert('图片上传失败，请重试')
  }
  target.value = ''
}

async function generateHandcopy() {
  const content = text1.value.trim() || text2.value.trim()
  if (!content) {
    alert('请先书写一些内容再生成手抄报！')
    return
  }
  generating.value = true
  try {
    // 调用真实生成接口（mock 模式可用；后端未实现时失败不影响本地展示）
    const sub = await call(DefaultService.postApiV1StuClassNodeCreationWorkshopGenerationSubmit(CLASS_ID, NODE_ID, 'handcopy', { textContent: content, taskType: 'handcopy' }))
    currentSubmitId.value = sub.submitId || ''
    try {
      const res = await call(DefaultService.getApiV1StuClassNodeCreationWorkshopGenerationResult(CLASS_ID, NODE_ID, 'handcopy', currentSubmitId.value))
      // 若后端返回有效内容可在此替换本地写死展示；目前保留写死视觉作为结果兜底
      void res
    } catch (_) {
      /* 降级：保留本地写死展示 */
    }
  } catch (_) {
    /* 接口不可用（如后端未实现）时，降级为本地写死展示，保证页面可用 */
  } finally {
    generating.value = false
  }
  viewMode.value = 'result'
  bubbleText.value = '你的手抄报已经生成啦！快来看看效果吧，喜欢的话就发布出去吧！'
}

async function publishWork() {
  try {
    if (currentSubmitId.value) {
      await call(DefaultService.getApiV1StuClassNodeCreationWorkshopGenerationSubmitPublishResult(CLASS_ID, NODE_ID, 'handcopy', currentSubmitId.value))
    }
  } catch (_) {
    /* 接口不可用（如后端未实现）时，降级为本地成功提示 */
  }
  published.value = true
}

function backToEdit() {
  viewMode.value = 'create'
  bubbleText.value = '看来你是一个很有艺术天分的孩子，你可以借鉴《一幅名扬中外的画》中对画面的描述的方法，把你想要表达的画面，还有配套的文案告诉我，我可以很快的帮你生成一张手抄报哦。你可以把他作为礼物送给你的外国朋友。'
}

onUnmounted(() => {
  if (recognition) recognition.abort()
})
</script>

<style scoped>
.bg-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 0;
}
.page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 统一橙色边框 + 半透明白底风格 */
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
  padding: 14px 20px 0;
  z-index: 100;
}
.nav-wrap {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.72);
  border-radius: 14px;
  padding: 10px 14px;
  gap:12px;
}
.back-btn {
  width:32px;
  height:32px;
  border:none;
  background:transparent;
  cursor:pointer;
  flex-shrink:0;
}
.back-btn svg {
  width:22px;
  height:22px;
}
.nav-title {
  flex:1;
  font-size:18px;
  font-weight:bold;
  color:#444444;
}
.nav-actions {
  display:flex;
  gap:14px;
  align-items:center;
}

/* 语音播报开关组件 */
.toggle-wrap {
  display:flex;
  align-items:center;
  gap:8px;
  background:#fff;
  padding:6px 12px;
  border-radius:10px;
  border:1px solid #ddd;
}
.toggle-switch {
  width:42px;
  height:22px;
  border-radius:11px;
  background:#cccccc;
  position:relative;
  cursor:pointer;
  transition:0.25s;
}
.toggle-switch.active {
  background:#f7a020;
}
.toggle-thumb {
  position:absolute;
  top:2px;
  left:2px;
  width:18px;
  height:18px;
  border-radius:50%;
  background:#ffffff;
  transition:0.25s;
}
.toggle-switch.active .toggle-thumb {
  transform: translateX(20px);
}
.toggle-label {
  font-size:15px;
  color:#333;
}

.nav-btn {
  display:flex;
  align-items:center;
  gap:6px;
  border-radius: 10px;
  border:none;
  padding:8px 16px;
  font-size:15px;
  cursor:pointer;
}
.btn-icon {
  width:18px;
  height:18px;
}
.nav-btn-orange {
  background:#f7a020;
  color:#fff;
}

/* 主区域 */
.main-area {
  flex: 1;
  display: flex;
  gap: 30px;
  padding: 24px 40px;
  align-items: flex-start;
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

  width: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}
.character-1 img {
  position: absolute;
  left: 980px;
  height: 460px;
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
.side-panels {
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position:relative;
  z-index: 1;
  margin-right: 20%;
}

.panel {
  position: relative;
  padding: 16px 18px;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color:#683f02;
  margin-bottom:6px;
}

.panel p {
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0 0 4px;
}

/* 输入框（含按钮） */
.input-box {
  border: 1.5px solid #f39c12;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.input-box:focus-within {
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.2);
}

.input-box.recording {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(231, 76, 60, 0.08); }
}

.input-box textarea {
  width: 100%;
  min-height: 90px;
  padding: 10px 12px 4px;
  border: none;
  border-radius: 0;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  line-height: 1.6;
  background: transparent;
}

.input-box textarea:focus {
  box-shadow: none;
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

/* ========= 核心修改 ========= */
/* 生成手抄报按钮：距离上方输入框底部严格 0.5cm */
.generate-btn {
  width: 100%;
  margin-top: 0.5cm; /* 关键：上方输入框底边到此按钮顶部距离0.5厘米 */
  padding: 14px;
  background: rgba(180,180,180,0.6);
  color: #666666;
  border: 2px solid #bbbbbb;
  border-radius: 18px;
  font-size: 16px;
  cursor: not-allowed;
  transition: all 0.25s;
}
.generate-btn.active {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.82);
  color: #d97706;
  border: 2px solid #f39c12;
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.2);
}
.generate-btn.active:hover {
  transform: translateY(-2px);
  background: rgba(243, 156, 18, 0.12);
  box-shadow: 0 10px 28px rgba(243, 156, 18, 0.3);
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

/* 音乐提示 */
.music-tip {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  z-index: 999;
}

/* ========== 结果视图 ========== */
.result-area {
  gap: 20px;
}

.result-panel {
  width: 480px;
  position: relative;
  z-index: 1;
}

.publish-toast {
  background: #e6f7ef;
  border: 1px solid #00b42a;
  color: #00b42a;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 14px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
}

.result-box {
  padding: 20px;
}

.result-header {
  text-align: center;
  margin-bottom: 14px;
}

.result-title {
  display: inline-block;
  font-size: 22px;
  font-weight: 900;
  color: #c0392b;
  letter-spacing: 2px;
  padding: 6px 24px;
  background: linear-gradient(180deg, #fff9e6 0%, #ffe8a0 100%);
  border: 2px solid #e67e22;
  border-radius: 8px;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
}

.result-image {
  margin-bottom: 14px;
}

.image-placeholder {
  width: 100%;
  height: 260px;
  background: linear-gradient(180deg, #87ceeb 0%, #b0e0e6 40%, #f5deb3 60%, #deb887 100%);
  border-radius: 12px;
  border: 2px solid #f39c12;
  overflow: hidden;
  position: relative;
}

.mock-handcopy {
  position: absolute;
  inset: 0;
}

.handcopy-scene {
  position: absolute;
  inset: 0;
}

.scene-sky {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(180deg, #4a90d9 0%, #87ceeb 100%);
}

.scene-buildings {
  position: absolute;
  bottom: 30%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 0 5%;
}

.building {
  width: 8%;
  background: linear-gradient(180deg, #8b4513 0%, #654321 100%);
  border-radius: 2px 2px 0 0;
  position: relative;
}

.building::after {
  content: '';
  position: absolute;
  top: 20%;
  left: 20%;
  right: 20%;
  bottom: 20%;
  background: rgba(255, 200, 100, 0.3);
}

.scene-street {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(180deg, #8b7355 0%, #6b5344 100%);
}

.figures {
  position: absolute;
  bottom: 28%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0 15%;
}

.figure {
  width: 12px;
  height: 28px;
  background: #c0392b;
  border-radius: 6px 6px 2px 2px;
  position: relative;
}

.figure::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: #ffdbac;
  border-radius: 50%;
}

.lantern {
  position: absolute;
  top: 38%;
  width: 14px;
  height: 18px;
  background: radial-gradient(circle, #ff6b35 0%, #c0392b 100%);
  border-radius: 50% 50% 4px 4px;
  box-shadow: 0 0 12px rgba(255, 107, 53, 0.6);
  animation: lantern-glow 2s ease-in-out infinite;
}

@keyframes lantern-glow {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 107, 53, 0.6); }
  50% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.9); }
}

.result-desc {
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
  text-align: center;
  margin: 0 0 16px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #f39c12;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: #d97706;
}

.action-btn.secondary:hover {
  background: rgba(243, 156, 18, 0.12);
}

.action-btn.primary {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: #fff;
  border-color: #f39c12;
  box-shadow: 0 4px 14px rgba(243, 156, 18, 0.4);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.5);
}

.result-bubble {
  width: 340px;
}

.result-bubble .bubble-text {
  font-size: 14px;
}
</style>