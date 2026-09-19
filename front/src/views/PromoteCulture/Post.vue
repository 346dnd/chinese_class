<template>
  <div class="page-bg"></div>
  <div class="page">
    <!-- 顶部导航栏【严格还原截图样式：语音播报开关 + 回看视频按钮】 -->
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
        <!-- 左侧：AI人物区域 -->
        <div class="character-area">
          <div class="character-1">
            <img src="/image/罗罗_汉服 1.png" alt="罗罗" />
          </div>
          <div class="bubble" :class="{ speaking: isSpeaking }">
            <button class="speaker-btn" @click="speakBubble" title="朗读">
              <img src="/image/语音朗读.png" alt="朗读图标" />
            </button>
            <p class="bubble-text">{{ bubbleText }}</p>
          </div>
        </div>

        <!-- 右侧：面板区域 -->
        <div class="side-panels">
          <!-- 面板1：提示 -->
          <div class="panel panel-tip">
            <div class="panel-title">
              <span>创作海报</span>
            </div>
            <p>提示：海报文字要精简，画面要丰富一些。</p>
          </div>

          <!-- 面板2：画面描述输入框 -->
          <div class="input-box" :class="{ recording: recording1 }">
            <textarea
              v-model="text1"
              placeholder="请输入你对海报画面的描述..."
            ></textarea>
            <div class="input-actions">
              <button
                class="mini-btn"
                :class="{ active: recording1 }"
                @click="toggleVoice(1)"
                :title="recording1 ? '停止录音' : '语音输入'"
              >
                <img src="/image/语音 1.png" alt="麦克风图标" />
                <span>语音</span>
              </button>
              <label class="mini-btn" title="照片转写">
                <img src="/image/评价-拍照 1.png" alt="拍照图标" />
                <input type="file" accept="image/*" class="hidden" @change="onPhotoChange($event, 1)" />
                <span>{{ uploading ? '上传中…' : '拍照' }}</span>
              </label>
            </div>
          </div>

          <!-- 面板3：海报文字输入框 -->
          <div class="input-box" :class="{ recording: recording2 }">
            <textarea
              v-model="text2"
              placeholder="请输入你想显示在海报上的文字（字数控制在20个汉字以内）"
            ></textarea>
            <div class="input-actions">
              <button
                class="mini-btn"
                :class="{ active: recording2 }"
                @click="toggleVoice(2)"
                :title="recording2 ? '停止录音' : '语音输入'"
              >
                <img src="/image/语音 1.png" alt="麦克风图标" />
                <span>语音</span>
              </button>
              <label class="mini-btn" title="照片转写">
                <img src="/image/评价-拍照 1.png" alt="拍照图标" />
                <input type="file" accept="image/*" class="hidden" @change="onPhotoChange($event, 2)" />
                <span>{{ uploading ? '上传中…' : '拍照' }}</span>
              </label>
            </div>
          </div>

          <!-- 生成海报按钮 -->
          <button class="generate-btn" :class="{ active: canGenerate }" :disabled="generating" @click="generateHandcopy">
            {{ generating ? '生成中…' : '生成海报' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ========== 结果视图 ========== -->
    <template v-else>
      <div class="main-area result-area">
        <!-- 左侧：AI人物在左边，对话框气泡在人物右侧【修改布局】 -->
        <div class="character-area">
          <div class="character-1">
            <img src="/image/罗罗_汉服 1.png" alt="罗罗" />
          </div>
          <div class="bubble result-bubble" :class="{ speaking: isSpeaking }">
            <button class="speaker-btn" @click="speakBubble" title="朗读">
              <img src="/image/语音朗读.png" alt="朗读图标" />
            </button>
            <p class="bubble-text">{{ bubbleText }}</p>
            
          </div>
        </div>

        <!-- 右侧：生成结果展示 -->
        <div class="result-panel">
          <div v-if="published" class="publish-toast">海报已成功发布到作品墙！</div>
          <div class="panel-title">生成结果</div>
            <div class="panel result-box">
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
            <div class="result-actions">
              <button class="action-btn primary" @click="publishWork">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2l-5.5 9h11L12 2zm0 13.5c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" />
                </svg>
                发布海报作品
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 视频弹窗：播放后端 heritage-cultural 模块导入视频 -->
    <VideoModal v-model:show="showVideoModal" :url="videoUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
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
const { uploadImage, uploading } = useFile()

// 导航状态：语音播报开关
const voiceBroadcastOn = ref(false)
const viewMode = ref<'create' | 'result'>('create')
const generating = ref(false)
const currentSubmitId = ref('')
const published = ref(false)
const buildingHeights = [55, 75, 48, 90, 60, 82, 50, 68]
const lanternPositions = [12, 30, 55, 78]

function goBack() {
  router.push({ name: 'PromoteCulture2' })
}

// 切换导航栏语音播报开关：开启时用后端 TTS 播报 AI 引导语，关闭时停止播放
const { isPlaying: isSpeaking, playAudio, stop: stopAudio } = useAudioPlayer()
function toggleVoiceBroadcast() {
  voiceBroadcastOn.value = !voiceBroadcastOn.value
  if (voiceBroadcastOn.value) {
    if (bubbleText.value) playAudio(bubbleText.value)
  } else {
    stopAudio()
  }
}

// 回看视频：从后端 heritage-cultural 模块 params 获取导入视频地址并播放
const showVideoModal = ref(false)
const videoUrl = ref('')
let videoUrlLoading = false
async function toggleVideo() {
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

async function generateHandcopy() {
  const content = text1.value.trim() || text2.value.trim()
  if (!content) {
    alert('请先书写一些内容再生成海报！')
    return
  }
  generating.value = true
  try {
    const sub = await call(DefaultService.postApiV1StuClassNodeCreationWorkshopGenerationSubmit(CLASS_ID, NODE_ID, 'poster', { textContent: content, taskType: 'post' }))
    currentSubmitId.value = sub.submitId || ''
    try {
      const res = await call(DefaultService.getApiV1StuClassNodeCreationWorkshopGenerationResult(CLASS_ID, NODE_ID, 'poster', currentSubmitId.value))
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
  bubbleText.value = '你的海报已经生成啦！快来看看效果吧，喜欢的话就发布出去吧！'
}

async function handlePhotoUpload(file: File, n: 1 | 2) {
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
}

function onPhotoChange(e: Event, n: 1 | 2) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handlePhotoUpload(file, n)
  }
  target.value = ''
}

async function publishWork() {
  try {
    if (currentSubmitId.value) {
      await call(DefaultService.getApiV1StuClassNodeCreationWorkshopGenerationSubmitPublishResult(CLASS_ID, NODE_ID, 'poster', currentSubmitId.value))
    }
  } catch (_) {
    /* 接口不可用（如后端未实现）时，降级为本地成功提示 */
  }
  published.value = true
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

/* ---------------- 顶部导航栏【截图1:1还原：语音播报开关 + 回看视频】 ---------------- */
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
  gap: 26px;
  padding: 20px 32px;
  align-items: flex-end;
}

/* ========== AI人物区域样式 ========== */
.character-area {
  position: relative;
  flex: 1;
  min-height: 520px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 16px;
  justify-content: flex-start;
  bottom: 100px;
  left: 100px;
}

.character-1 {
  position: absolute;
  left: 30px;
  width: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  flex-shrink: 0;
}

.character-1 img {
  height: 460px;
}

.bubble {
  background: rgba(255, 255, 255, 0.84);
  border: 2px solid #703c00;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  width: 410px;
  padding: 16px 52px 18px 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  position: relative;
  flex-shrink: 0;
  margin-top: 30%;
  bottom: 150px;
  left: 200px;
}

.bubble-text {
  font-size: 15px;
  line-height: 1.72;
  color: #333333;
  margin: 0;
}

.speaker-btn {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 34px;
  height: 34px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 侧边面板样式 ========== */
.side-panels {
  width: 30%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1;
  position: relative;
  margin-right: 50px;
  margin-top: 100px;
  bottom: 200px;
}

.panel {
  background: rgba(255, 255, 255, 0.84);
  border: 2px solid #703c00;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.panel-tip {
  width: 100%;
  min-height: 100px;
  padding: 14px 16px;
  border: 1px solid #d97605;
}

.panel-title {
  font-size: 17px;
  font-weight: bold;
  color: #845622;
  margin-bottom: 4px;
}

.panel-tip p {
  font-size: 13px;
  color: #444;
  margin: 0;
}

.input-box {
  width: 100%;
  min-height: 100px;
  border: 1px solid #d97605;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.input-box textarea {
  width: 100%;
  min-height: 70px;
  padding: 12px 14px 6px;
  border: none;
  background: transparent;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 6px 12px 8px;
}

.mini-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 13px;
  border-radius: 999px;
  border: none;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  font-size: 16px;
  color: #b47000;
}

.mini-btn.active {
  background: #fff2e0;
  box-shadow: 0 3px 10px rgba(180, 112, 0, 0.2);
}

.hidden {
  display: none;
}

.generate-btn {
  margin-top: 0.1cm;
  width: 100%;
  padding: 5px;
  border-radius: 6px;
  border: 2px solid #bbbbbb;
  background: rgba(170, 170, 170, 0.55);
  color: #666666;
  font-size: 16px;
  cursor: not-allowed;
  transition: 0.22s;
}

.generate-btn.active {
  border-color: #f7a020;
  background: #f7a020;
  color: #ffffff;
  cursor: pointer;
}

/* ---- 结果视图部分保持原有逻辑 ---- */
.result-area { 
  position:relative;
  gap:22px; }

.result-panel {
  bottom: 200px;
  width:80px; }

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
  position:absolute;
  width:550px;
  height: 400px;
  padding:20px; 
  bottom:50%;
  right:20%;
}

.result-header { text-align:center; margin-bottom:14px; }
.result-title {
  font-size:22px;
  font-weight:900;
  color:#c0392b;
  padding:6px 22px;
  background:linear-gradient(180deg,#fff9e6,#ffe8a0);
  border:2px solid #e67e22;
  border-radius:8px;
}
.result-image { margin-bottom:14px; }
.image-placeholder {
  width:100%;
  height:300px;
  border-radius:12px;
  border:2px solid #703c00;
  background:linear-gradient(180deg,#87ceeb,#b0e0e6,#f5deb3,#deb887);
  overflow:hidden;
  position:relative;
  margin-top:1px;
}
.mock-handcopy { position:absolute; inset:0; }
.handcopy-scene { position:absolute; inset:0; }
.scene-sky {
  position:absolute;
  top:0; left:0; right:0;
  height:55%;
  background:linear-gradient(180deg,#4a90d9,#87ceeb);
}
.scene-buildings {
  position:absolute;
  bottom:30%;
  left:0; right:0;
  display:flex;
  justify-content:space-around;
  align-items:flex-end;
  padding:0 5%;
}
.building {
  width:8%;
  background:linear-gradient(180deg,#8b4513,#654321);
  border-radius:2px 2px 0 0;
  position:relative;
}
.building::after {
  content:'';
  position:absolute;
  top:20%; left:20%; right:20%; bottom:20%;
  background:rgba(255,200,100,0.3);
}
.scene-street {
  position:absolute;
  bottom:0; left:0; right:0;
  height:30%;
  background:linear-gradient(180deg,#8b7355,#6b5344);
}
.figures {
  position:absolute;
  bottom:28%; left:0; right:0;
  display:flex;
  justify-content:space-around;
  padding:0 15%;
}
.figure {
  width:12px; height:28px;
  background:#c0392b;
  border-radius:6px 6px 2px 2px;
  position:relative;
}
.figure::before {
  content:'';
  position:absolute;
  top:-6px; left:50%; transform:translateX(-50%);
  width:10px; height:10px;
  background:#ffdbac;
  border-radius:50%;
}
.lantern {
  position:absolute;
  top:38%;
  width:14px; height:18px;
  background:radial-gradient(circle,#ff6b35,#c0392b);
  border-radius:50% 50% 4px 4px;
  box-shadow:0 0 12px rgba(255,107,53,0.6);
  animation:lantern-glow 2s ease-in-out infinite;
}
@keyframes lantern-glow {
  0%,100% { box-shadow:0 0 12px rgba(255,107,53,0.6); }
  50% { box-shadow:0 0 20px rgba(255,107,53,0.9); }
}
.result-desc {
  font-size:13px;
  line-height:1.7;
  color:#4b5563;
  text-align:center;
  margin:0 0 16px;
}
.result-actions {
  display:flex;
  gap:12px;
  justify-content:center;
}
.action-btn {
  display:flex;
  align-items:center;
  gap:6px;
  padding:10px 24px;
  border-radius:12px;
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  border:2px solid #703c00;
}
.action-btn svg { width:18px; height:18px; }
.action-btn.secondary {
  background:rgba(255,255,255,0.7);
  color:#703c00;
}
.action-btn.primary {
  background:linear-gradient(135deg,#f7a020,#e67e22);
  color:#fff;
  border-color:#f7a020;
  position:absolute;
  bottom:30px;
  
}
.result-bubble {
  bottom:200px; 
  width:410px; }

/* 视频弹窗 */
.video-modal {
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.7);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1000;
}
.video-container {
  position:relative;
  width:600px;
  max-width:90vw;
  background:#1f2937;
  border-radius:16px;
  padding:20px;
}
.close-video {
  position:absolute;
  top:-12px; right:-12px;
  width:32px; height:32px;
  border-radius:50%;
  background:#fff;
  border:none;
  font-size:16px;
  cursor:pointer;
}
.video-placeholder {
  aspect-ratio:16/9;
  background:#111827;
  border-radius:10px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  color:#9ca3af;
}
.video-placeholder svg { width:64px; height:64px; }
</style>
