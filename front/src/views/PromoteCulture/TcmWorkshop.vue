<template>
  <div class="page-bg"></div>
  <div class="page-wrapper">
    <!-- 顶部栏 -->
    <header class="top-bar">
      <div class="top-left">
        <button @click="goHome" class="back-btn" title="返回首页">
          <svg viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <span class="top-title">宣传文化：文化交流有礼‑中医技艺小工坊</span>
      </div>
      <button class="replay-video-btn" @click="toggleVideo">回看视频</button>
    </header>

    <!-- 视频弹窗：播放后端 heritage-cultural 模块导入视频 -->
    <VideoModal v-model:show="showVideoModal" :url="videoUrl" />

    <div class="content-area">
      <!-- 对话气泡 -->
      <div class="chat-bubble">
        <img
          src="/image/语音朗读.png"
          alt="播放"
          class="bubble-icon"
          :class="{ playing: isSpeaking }"
          @click="speakBubble"
          title="朗读"
        />
        <div class="bubble-text">
          {{ bubbleText }}
        </div>
      </div>

      <!-- 中间角色 -->
      <div class="character">
        <img src="/image/罗罗_汉服 1.png" alt="罗罗" />
      </div>

      <!-- 底部输入区 -->
      <div class="input-panel">
        <button class="send-btn">发送</button>
        <div class="input-wrap">
          <input type="text" placeholder="请输入..." class="text-input" />
          <div class="input-actions">
            <button class="action-btn">🎤 语音</button>
            <label class="action-btn">
              📷 {{ uploading ? '上传中…' : '拍照' }}
              <input type="file" accept="image/*" class="hide-input" @change="onPhotoUpload" />
            </label>
            <img v-if="capturedImageUrl" :src="capturedImageUrl" alt="拍照预览" class="photo-preview" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFile } from '../../composables/useFile'
import { useAudioPlayer } from '../../composables/useAudioPlayer'
import VideoModal from '../../components/VideoModal.vue'
import { getHeritageCulturalParams } from '../../api'
const router = useRouter()
const { uploadImage, uploading } = useFile()
const capturedImageUrl = ref('')

// 数字人对话气泡文案
const bubbleText = ref('看来你是一个对中医颇有研究的孩子，你已经学习了第四单元的内容，对中华优秀传统文化又有了更多的了解。我们在医生、老师、家里人的指导下，还了解了一点中医常识，感受到中华优秀传统文化的博大精深。你可以跟米娅说说，区分针灸、拔火罐、推拿治疗的方法。如果她理解了，你就可以领取一个小礼品送给她。')

// 语音播报：调后端 TTS 接口播放气泡文本
const { isPlaying: isSpeaking, playAudio } = useAudioPlayer()
function speakBubble() {
  playAudio(bubbleText.value)
}

function goHome() {
  router.push({ name: 'PromoteCulture2' })
}

// 回看视频：从后端 heritage-cultural 模块 params 获取导入视频地址并播放
const showVideoModal = ref(false)
const videoUrl = ref('')
let videoUrlLoading = false
async function toggleVideo() {
  if (!videoUrl.value && !videoUrlLoading) {
    videoUrlLoading = true
    try {
      const params = await getHeritageCulturalParams()
      videoUrl.value = params.introVideo?.url || ''
    } catch (_) {
      videoUrl.value = ''
    } finally {
      videoUrlLoading = false
    }
  }
  showVideoModal.value = true
}

// 拍照：上传图片并显示预览
async function onPhotoUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const { url } = await uploadImage(file, { resource_info: '中医工坊-拍照' })
    capturedImageUrl.value = url
  } catch (err) {
    console.error('图片上传失败:', err)
  } finally {
    target.value = ''
  }
}
</script>

<style scoped>
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12)), url('/image/image 123.png') no-repeat center center;
  background-size: cover;
}

.page-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  z-index: 1;
}

/* 顶部栏 */
.top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
}

.back-btn svg {
  width: 20px;
  height: 20px;
  color: #333;
  fill: none;
  stroke: currentColor;
}

.replay-video-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

/* 主内容区，铺满屏幕 */
.content-area {
  position: relative;
  z-index: 5;
  width: 100%;
  height: calc(100vh - 85px);
}

/* 对话气泡 */
.chat-bubble {
  position: absolute;
  top: 22%;
  left: 30%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  display: flex;
  gap: 8px;
}
.chat-bubble::after {
  content: "";
  position: absolute;
  right: -10px;
  top: 40%;
  border-width: 10px 0 0 10px;
  border-style: solid;
  border-color: transparent transparent transparent #fff;
}

.bubble-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  cursor: pointer;
  object-fit: contain;
  margin-top: 2px;
}
.bubble-icon.playing {
  animation: speaker-pulse 0.8s ease-in-out infinite;
}

@keyframes speaker-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
.bubble-text {
  font-size: 13px;
  line-height: 1.6;
  color: #222;
}

/* 角色 */
.character {
  position: absolute;
  bottom: 22%;
  left: 50%;
  transform: translateX(-50%);
}
.character img {
  height: 340px;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,0.35));
}

/* 底部输入面板 */
.input-panel {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex‑end;
  gap:10px;
  width: 720px;
}

.send-btn {
  padding:8px 18px;
  background:#ddd;
  border:none;
  border-radius:6px;
  cursor:pointer;
}

.input-wrap {
  flex:1;
  background:#fff;
  border-radius:12px;
  padding:12px;
}

.text-input {
  width:100%;
  border:none;
  outline:none;
  font-size:14px;
  margin-bottom:8px;
}

.input-actions {
  display:flex;
  gap:14px;
  justify-content:flex-end;
}

.action-btn {
  border:none;
  background:transparent;
  cursor:pointer;
  font-size:13px;
  display:flex;
  align-items:center;
  gap:4px;
}

.hide-input {
  display:none;
}
.photo-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid rgba(255,255,255,0.6);
  margin-left: 6px;
}
</style>