<template>
  <ScaleCanvas background="/image/image 125.png">
    <PageHeader
      title="宣传文化：讲解优秀文化"
      @back="goBack"
      voice-broadcast
      :voice-on="voiceBroadcastOn"
      @toggle-voice="playVoiceBroadcast"
      @video="openVideoModal"
    />

    <!-- 场景人物区域：完成状态提升整体层级 -->
    <div
      class="scene-characters-wrap"
      v-if="!isAllCompleted"
      :class="{ 'scene-high-z': isAllCompleted }"
    >
      <!-- 中间屏幕：外国女孩 -->
      <div class="foreign-girl-area">
        <div class="foreign-bubble">
          <span class="bubble-text">{{ foreignGirlTalk }}</span>
          <img
            src="/image/语音朗读.png"
            alt="播放"
            class="bubble-voice-icon-right"
            @click="playForeignBubbleAudio"
          />
          <span class="bubble-arrow-bottom"></span>
        </div>
        <img
          src="/image/外国女孩 1.png"
          alt="外国女孩"
          class="foreign-girl-img"
        />
      </div>

      <!-- 右侧：罗罗汉服数字人（完成页也保留，对齐写写感想） -->
      <div class="digital-human-area" :class="{ 'completed-above-overlay': isAllCompleted }">
        <!-- 数字人图片 始终显示 -->
        <img
          src="/image/罗罗_汉服 1.png"
          alt="罗罗汉服数字人"
          class="digital-human-img"
          :class="{ 'complete-human-size': isAllCompleted }"
        />
        <!-- 气泡+操作按钮容器（完成页也保留，对齐写写感想结构） -->
        <div class="bubble-action-wrap" v-if="talkText || isAllCompleted">
          <!-- 普通对话气泡 -->
          <div
            class="human-talk-bubble"
            :class="{ expanded: isBubbleExpanded }"
            v-if="!isAllCompleted"
          >
            <img
              src="/image/语音朗读.png"
              alt="播放"
              class="bubble-voice-icon-left"
              @click="playBubbleAudio"
            />
            <span class="bubble-text">{{ talkText }}</span>
            <!-- 气泡箭头在右侧，指向数字人 -->
            <span class="bubble-arrow-right"></span>
          </div>

          <CompletionFeedback
            :show="isAllCompleted"
            :message="completionMessage"
            @go-report="goToReport"
            @go-home="goHome"
            @play-audio="playBubbleAudio"
          />
        </div>
      </div>
    </div>

    <!-- 左下角答题区域 -->
    <div class="bottom-input-area" ref="rightContainerRef" :class="{ 'complete-mode': isAllCompleted }">
      <!-- 历史作答记录 -->
      <div class="history-answer-list" v-if="historyAnswerList.length > 0">
        <div
          v-for="(record, qIdx) in historyAnswerList"
          :key="'history-' + qIdx"
          class="history-item-block"
        >
          <!-- 你的作品：标签同色无边框，卡片加深色边框 -->
          <div class="stu-answer-card" :class="record.isFinalPass ? 'card-correct' : 'card-wrong'">
            <div class="card-tag">你的作品</div>
            <div class="stu-content-text">{{ record.stuContent }}</div>
          </div>

          <!-- 参考范文：标签同色无边框，卡片加深色边框 -->
          <div v-if="record.showOptContent" class="ai-ref-card">
            <div class="ai-ref-label">参考范文</div>
            <div class="ai-ref-text">{{ record.aiOptContent }}</div>
          </div>
        </div>
      </div>

      <!-- 输入交互区：未完成时显示 -->
        <div class="input-operation-wrap" v-if="!isAllCompleted">
          <div class="submit-btn-wrap">
            <button
              class="submit-btn"
              :class="{ 'submit-disabled': isInputEmpty }"
              :disabled="isInputEmpty"
              @click="handleSubmit"
            >
              {{ currentAttempts >= 2 ? '结束任务' : '发送' }}
            </button>
          </div>
          <div class="feel-input-box">
            <textarea
              class="feel-input"
              v-model="userInput"
              :class="{
                'input-invalid': currentSubmitStatus === 'wrong',
                'has-content': !isInputEmpty,
                'text-red': currentSubmitStatus === 'wrong'
              }"
              placeholder="输入你的文化宣传文案..."
            ></textarea>
            <div class="func-btn-group">
              <button class="func-btn" :class="{ 'is-recording': isRecording }" @click="handleVoice">
                <img src="/image/矢量 62.png" alt="语音" class="func-icon-img" />
                <span class="func-text">{{ isTranscribing ? '识别中…' : isRecording ? '停止录音' : '语音' }}</span>
              </button>
              <button class="func-btn" @click="handlePhoto">
                <img src="/image/矢量 65.png" alt="拍照" class="func-icon-img" />
                <span class="func-text">{{ uploading ? '上传中…' : '拍照' }}</span>
              </button>
              <input
                ref="photoInputRef"
                type="file"
                accept="image/*"
                capture="environment"
                style="display: none"
                @change="onPhotoCapture"
              />
            </div>
            <div class="capture-preview" v-if="capturedImageUrl">
              <img :src="capturedImageUrl" alt="拍照作答" class="capture-img" />
              <span class="capture-tip">已识别并填入输入框</span>
            </div>
          </div>
        </div>
    </div>
  </ScaleCanvas>

  <!-- 完成全屏遮罩：移出 ScaleCanvas 默认插槽（置于视口级），确保 fixed 真正相对视口、z-index 盖住整页含 header -->
  <CompletionOverlay :show="isAllCompleted">
      <div class="scene-characters-wrap">
        <div class="foreign-girl-area">
          <div class="foreign-bubble">
            <span class="bubble-text">{{ foreignGirlTalk }}</span>
            <img
              src="/image/语音朗读.png"
              alt="播放"
              class="bubble-voice-icon-right"
              @click="playForeignBubbleAudio"
            />
            <span class="bubble-arrow-bottom"></span>
          </div>
          <img
            src="/image/外国女孩 1.png"
            alt="外国女孩"
            class="foreign-girl-img"
          />
        </div>
        <div class="digital-human-area">
          <img
            src="/image/罗罗_汉服 1.png"
            alt="罗罗汉服数字人"
            class="digital-human-img"
            :class="{ 'complete-human-size': isAllCompleted }"
          />
          <div class="bubble-action-wrap" v-if="talkText || isAllCompleted">
            <CompletionFeedback
              :show="isAllCompleted"
              :message="completionMessage"
              @go-report="goToReport"
              @go-home="goHome"
            />
          </div>
        </div>
      </div>
    </CompletionOverlay>

  <!-- 回看视频弹窗 -->
  <VideoModal v-model:show="showVideoModal" :url="apiParams?.introVideo?.url || ''" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import ScaleCanvas from '../components/ScaleCanvas.vue'
import PageHeader from '../components/PageHeader.vue'
import CompletionOverlay from '../components/CompletionOverlay.vue'
import CompletionFeedback from '../components/completion/CompletionFeedback.vue'
import VideoModal from '../components/VideoModal.vue'
import { useCompletionNav } from '../components/completion/useCompletionNav'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { useFile } from '../composables/useFile'
import { getHeritageCulturalParams, getHeritageCulturalState, submitHeritageCultural, getHeritageCulturalSubmitResult, getHeritageCulturalEnding , toUserFriendlyError, getTranscription } from '../api'
import { useCompletionPersistence } from '../composables/useCompletionPersistence'
import type { HeritageCulturalParams, HeritageCulturalState } from '../types'

const router = useRouter()
const photoInputRef = ref<HTMLInputElement | null>(null)
const rightContainerRef = ref<HTMLElement | null>(null)

// ========== API 状态 ==========
const apiParams = ref<HeritageCulturalParams | null>(null)
const apiState = ref<HeritageCulturalState | null>(null)

// ========== 页面文案 ==========
const foreignGirlTalk = ref('')
const talkText = ref('')
const isBubbleExpanded = ref(true)

// ========== 答题核心数据 ==========
const userInput = ref('')
const isInputEmpty = computed(() => userInput.value.trim() === '')

const currentAttempts = ref(0)
const currentSubmitStatus = ref('')
const historyAnswerList = reactive<Array<{
  stuContent: string
  aiOptContent: string
  isFinalPass: boolean
  showOptContent: boolean
}>>([])

// 完成标记：答对 或 提交满3次强制结束
const isAllCompleted = computed(() => {
  return historyAnswerList.some(item => item.isFinalPass) || currentAttempts.value >= 3
})

// ========== 本地答题缓存（跨刷新持久化）==========
const {
  markCompleted: markTalkCultureCompleted,
  loadProgress: loadTalkCultureProgress,
  saveProgress: saveTalkCultureProgress,
  isCompleted: isTalkCultureCompleted,
} = useCompletionPersistence('talk-culture')

interface TalkCultureSnapshot {
  historyAnswerList: Array<{ stuContent: string; aiOptContent: string; isFinalPass: boolean; showOptContent: boolean }>
  currentAttempts: number
}

const buildTalkCultureSnapshot = (): TalkCultureSnapshot => ({
  historyAnswerList: historyAnswerList.map(r => ({ ...r })),
  currentAttempts: currentAttempts.value
})

const applyTalkCultureSnapshot = (snap: TalkCultureSnapshot | null): boolean => {
  if (!snap) return false
  historyAnswerList.splice(0, historyAnswerList.length, ...(snap.historyAnswerList || []).map(r => ({ ...r })))
  currentAttempts.value = snap.currentAttempts || 0
  return true
}

// 答题记录变化即存（含 AI 反馈更新），刷新后原样恢复
watch([historyAnswerList, currentAttempts], () => {
  saveTalkCultureProgress(buildTalkCultureSnapshot() as unknown as Record<string, unknown>)
}, { deep: true })

// 全部完成后写入本地完成态（含答题快照），刷新仍停留在完成屏；首页「讲解优秀文化」变绿
watch(isAllCompleted, async (val) => {
  if (val) {
    markTalkCultureCompleted(buildTalkCultureSnapshot() as unknown as Record<string, unknown>)
    const { useProgressStore } = await import('../stores/progress')
    useProgressStore().markTaskFinished('talk-culture')
  }
})

// 完成页反馈文案
const completionMessage = computed(() => {
  const last = historyAnswerList.at(-1)
  if (!last) return ''
  return last.isFinalPass
    ? '恭喜你完成本次文化宣传文案创作，整体内容完整、立意清晰，继续加油哦！'
    : '本次作答已完成，参考范文可以帮助你优化文案，记得多多练习~'
})

// ========== 音频播放 ==========
const { isPlaying, playAudio, stop } = useAudioPlayer()

// ========== 文件上传 / OCR / 录音 ==========
const {
  uploadImage,
  ocrImageFile,
  startRecording,
  stopRecordingAndUpload,
  uploading,
  isRecording
} = useFile()
const capturedImageUrl = ref('')
const audioUrl = ref('')
// 录音上传后正在调用后端语音转文字（ASR）接口
const isTranscribing = ref(false)
const playForeignBubbleAudio = () => {
  foreignGirlTalk.value && playAudio(foreignGirlTalk.value)
}
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  talkText.value && playAudio(talkText.value)
}
// ========== 顶部导航功能 ==========
// 语音播报开关：开启时播报当前数字人引导语，关闭时停止（与 PromoteCulture 创作页一致）
const voiceBroadcastOn = ref(true)
const playVoiceBroadcast = () => {
  voiceBroadcastOn.value = !voiceBroadcastOn.value
  if (voiceBroadcastOn.value) {
    if (talkText.value) playAudio(talkText.value)
  } else {
    stop()
  }
}
// 回看视频：打开视频弹窗，播放后端 params.introVideo.url
const showVideoModal = ref(false)
const openVideoModal = () => {
  showVideoModal.value = true
}

// ========== 交互逻辑 ==========
const handleSubmit = async () => {
  if (isInputEmpty.value) return
  currentAttempts.value += 1

  try {
    const { submitId } = await submitHeritageCultural(userInput.value)

    // 轮询评测结果
    let result = await getHeritageCulturalSubmitResult(submitId)
    for (let i = 0; i < 10 && result.isProcessing; i++) {
      await new Promise(r => setTimeout(r, 1000))
      result = await getHeritageCulturalSubmitResult(submitId)
    }

    const needShowOpt = result.isPassed || currentAttempts.value >= 3
    const recordItem = {
      stuContent: userInput.value,
      aiOptContent: result.feedback || '',
      isFinalPass: result.isPassed,
      showOptContent: needShowOpt
    }
    historyAnswerList.push(recordItem)

    if (result.isPassed) {
      currentSubmitStatus.value = 'correct'
      setTimeout(() => playAudio(result.feedback), 1000)
    } else {
      currentSubmitStatus.value = 'wrong'
      if (currentAttempts.value >= 3) {
        recordItem.isFinalPass = true
        // 调用结束语接口
        try {
          const ending = await getHeritageCulturalEnding()
          if (ending.comment) {
            setTimeout(() => playAudio(ending.comment), 2000)
          }
        } catch (e) {
          console.error('获取结束语失败:', e)
        }
      }
    }

    userInput.value = ''
    nextTick(() => {
      if (rightContainerRef.value) {
        rightContainerRef.value.scrollTop = 0
      }
    })
  } catch (e) {
    console.error('提交失败:', e)
    talkText.value = toUserFriendlyError(e)
    playAudio(talkText.value)
  }
}

// 语音：点击开始录音，再次点击停止并上传音频，上传后调后端 ASR 把文字回填输入框
const handleVoice = async () => {
  try {
    if (!isRecording.value) {
      await startRecording()
    } else {
      const res = await stopRecordingAndUpload({ resource_info: '宣传优秀文化-语音作答' })
      audioUrl.value = res.url
      // 语音转文字：调后端 GET /utils/transcriptions/{resourceId} 轮询识别结果
      const resourceId = res.resp.resource_id ?? ''
      if (resourceId) {
        isTranscribing.value = true
        try {
          let text = ''
          for (let i = 0; i < 6; i++) {
            if (i > 0) await new Promise(r => setTimeout(r, 500))
            const t = await getTranscription(resourceId)
            if (t && t.text) { text = t.text; break }
          }
          if (text.trim()) {
            userInput.value = userInput.value ? `${userInput.value}\n${text}` : text
          }
        } catch (e) {
          console.error('语音识别失败:', e)
        } finally {
          isTranscribing.value = false
        }
      }
    }
  } catch (e: any) {
    console.error('语音录制上传失败:', e)
    talkText.value = e?.message || '无法启动麦克风，请检查浏览器权限设置。'
  }
}

const handlePhoto = () => photoInputRef.value?.click()

// 拍照：上传图片 → OCR 识别文字填入输入框 → 预览图
const onPhotoCapture = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const img = await uploadImage(file, { resource_info: '宣传优秀文化-拍照作答' })
    capturedImageUrl.value = img.url
    const text = await ocrImageFile(file, { resource_info: '宣传优秀文化-手写识别' })
    if (text && text.trim()) {
      userInput.value = userInput.value ? `${userInput.value}\n${text}` : text
    }
  } catch (err: any) {
    console.error('拍照上传/OCR 失败:', err)
  } finally {
    target.value = ''
  }
}

// ========== 导航跳转 ==========
const goBack = () => router.push('/')
const { goToReport, goHome } = useCompletionNav()

// ========== 生命周期 ==========
onMounted(async () => {
  try {
    const [params, state] = await Promise.all([
      getHeritageCulturalParams(),
      getHeritageCulturalState()
    ])
    apiParams.value = params
    apiState.value = state

    // 从 introBubbles 设置对话文案
    if (params.introBubbles && params.introBubbles.length > 0) {
      const foreignerBubble = params.introBubbles.find(b => b.role === 'foreigner')
      const nativeBubble = params.introBubbles.find(b => b.role === 'native')
      if (foreignerBubble) foreignGirlTalk.value = foreignerBubble.text
      if (nativeBubble) talkText.value = nativeBubble.text
    }

    // 从 submitLogs 恢复历史记录
    if (state.submitLogs && state.submitLogs.length > 0) {
      state.submitLogs.forEach(log => {
        historyAnswerList.push({
          stuContent: log.submittedText,
          aiOptContent: log.feedback || '',
          isFinalPass: log.isPassed,
          showOptContent: log.isCompleted
        })
      })
      currentAttempts.value = state.submitLogs.length
    }

    // 本地已完成但后端数据不全 → 以本地快照为准，停留在完成屏
    if (!isAllCompleted.value && isTalkCultureCompleted()) {
      applyTalkCultureSnapshot(loadTalkCultureProgress<Record<string, unknown>>() as unknown as TalkCultureSnapshot)
    }

    // 未完成才播导入对话；完成态恢复时静默
    if (!isAllCompleted.value) {
      setTimeout(() => playAudio(foreignGirlTalk.value), 500)
      setTimeout(() => playAudio(talkText.value), 3500)
    }
  } catch (e) {
    console.error('加载宣传文化数据失败:', e)
    // 后端不可用：用本地快照兜底恢复答题记录/完成态
    if (!applyTalkCultureSnapshot(loadTalkCultureProgress<Record<string, unknown>>() as unknown as TalkCultureSnapshot)) {
      talkText.value = toUserFriendlyError(e)
    } else if (!isAllCompleted.value) {
      talkText.value = '后端服务暂不可用，已恢复你之前的答题记录。'
    }
  }
})
</script>

<style scoped>


/* ========== 顶部导航栏 ========== */
/* ========== 场景人物区域 ========== */
.scene-characters-wrap {
  position: absolute;
  top: 120px;
  left: 0;
  right: 0;
  bottom: 320px;
  z-index: 5;
}
/* 完成状态提升整体层级，确保内部所有元素在遮罩上方 */
.scene-high-z {
  z-index: 15;
}

/* 中间外国女孩 */
.foreign-girl-area {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.foreign-girl-img {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.foreign-bubble {
  position: relative;
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #7c4403;
  border-radius: 12px;
  padding: 14px 40px 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  margin-bottom: 12px;
  max-height: 60vh; /* 超长才限高滑动，滚动条隐藏 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.foreign-bubble::-webkit-scrollbar {
  display: none; /* WebKit/Blink 隐藏滚动条 */
}
.bubble-voice-icon-right {
  position: absolute;
  right: 12px;
  top: 14px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  object-fit: contain;
}
.bubble-arrow-bottom {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -10px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #ffffff;
}

/* 右侧罗罗数字人 */
.digital-human-area {
  position: absolute;
  right: 100px;
  bottom: -120px;
  display: flex;
  gap: 14px;
  align-items: flex-end;
}
.digital-human-img {
  width: 160px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
  transition: width 0.3s ease;
}
.digital-human-img.complete-human-size {
  width: 130px;
}

/* 气泡+操作按钮容器 */
.bubble-action-wrap {
  position: absolute;
  right: 180px;
  bottom: 60px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 19px;
}
.human-talk-bubble {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px 14px 40px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.bubble-voice-icon-left {
  position: absolute;
  left: 12px;
  top: 14px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  object-fit: contain;
}
.bubble-text {
  flex: 1;
  max-height: 60vh; /* 不固定长度：短文自适应，超长才限高滑动，滚动条隐藏 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  transition: max-height 0.3s ease;
}
.bubble-text::-webkit-scrollbar {
  display: none; /* WebKit/Blink 隐藏滚动条 */
}
.human-talk-bubble.expanded .bubble-text {
  max-height: none;
}
/* 气泡箭头在右侧，指向数字人 */
.bubble-arrow-right {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #ffffff;
}

/* ========== 左下角答题区域 ========== */
.bottom-input-area {
  position: absolute;
  left: 2.5%;
  right: 2.5%;
  bottom: 60px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  /* 答题区统一宽度：输入框 / 历史作答 / 发送按钮 三处共用（均 width:var(--talk-input-w); margin:0 auto），
     改这里即可整体调整。用 cm 单位（与发送按钮 2.5cm 一致），当前比上版 15cm 再短 2.5cm = 12.5cm，
     三处保持等长、按钮跟随左对齐；完成态答案卡片也共用本变量，与输入框一样长。 */
  --talk-input-w: 12.5cm;
}
.bottom-input-area.complete-mode {
  left: 2%;
  right: auto;
  width: 46%;
  bottom: auto;
  top: 16%;
  z-index: 12;
}
/* 完成态：学生答案卡片与输入框同宽（共用 --talk-input-w，居中），不再占满 46% 整列，避开右侧数字人/外国女孩气泡 */
.bottom-input-area.complete-mode .history-answer-list {
  width: var(--talk-input-w);
  margin: 0 auto;
  /* 最后一页(查看评价/回到首页)：全部答案一次显示，不出现右侧滚动框 */
  max-height: none;
  overflow: visible;
}
.bottom-input-area.complete-mode .submit-btn-wrap,
.bottom-input-area.complete-mode .feel-input-box {
  width: 100%;
  margin: 0;
}

/* 历史作答列表：与输入框同宽（共用 --talk-input-w 居中），保证"你的作品"卡片和输入框一样长 */
.history-answer-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 260px;
  overflow-y: auto;
  padding-top: 16px;
  width: var(--talk-input-w);
  margin: 0 auto;
}
.history-item-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

/* 你的作品卡片 */
.stu-answer-card {
  position: relative;
  border-radius: 12px;
  padding: 14px 18px;
  border-width: 2px;
  border-style: solid;
  width: 100%;
  box-sizing: border-box;
}
.card-correct {
  background: #62bd4b;
  border-color: #2e881a;
  color: #fff;
}
.card-wrong {
  background: #f4baba;
  border-color: #b42020;
  color: #b42020;
}
.card-tag {
  position: absolute;
  top: -10px;
  right: 16px;
  background: inherit;
  color: inherit;
  border: none;
  font-size: 18px;
  padding: 2px 12px;
  border-radius: 4px;
  font-weight: 700;
}
.stu-content-text {
  font-size: 15px;
  line-height: 1.6;
}

/* 参考范文卡片 */
.ai-ref-card {
  position: relative;
  background: #fff9cc;
  border: 2px solid #c9b044;
  border-radius: 12px;
  padding: 12px 18px;
  width: 100%;
  box-sizing: border-box;
}
.ai-ref-label {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #fff9cc;
  color: #947000;
  border: none;
  font-size: 18px;
  padding: 2px 12px;
  border-radius: 4px;
  font-weight: 700;
}
.ai-ref-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-top: 4px;
}

/* 输入操作区 */
.input-operation-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.feel-input-box {
  position: relative;
  width: var(--talk-input-w);
  margin: 0 auto;
}
.feel-input {
  width: 100%;
  min-height: 120px;
  border: 1.5px solid #b8c8f0;
  border-radius: 14px;
  padding: 14px 140px 14px 16px;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.3s, color 0.3s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.95);
}
.feel-input.has-content {
  border-color: #daa520;
}
.feel-input.input-invalid {
  border-color: red;
}
.text-red {
  color: red;
}
.func-btn-group {
  position: absolute;
  right: 12px;
  bottom: 14px;
  display: flex;
  gap: 10px;
}
.func-btn {
  padding: 6px 14px;
  border: 1px solid #eff1f5;
  background: #fff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.func-text {
  color: #daa520;
}
.func-icon-img {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.func-btn.is-recording {
  border-color: #e53935;
  background: #fdecec;
}
.func-btn.is-recording .func-text {
  color: #e53935;
}
.capture-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.capture-img {
  max-width: 120px;
  max-height: 90px;
  border-radius: 8px;
  border: 1px solid #eee;
  object-fit: cover;
}
.capture-tip {
  font-size: 12px;
  color: #888;
}

.submit-btn-wrap {
  display: flex;
  justify-content: flex-start;
  width: var(--talk-input-w);
  margin: 0 auto;
}
.submit-btn {
  width: 2.5cm;
  min-height: 38px;
  border: 1.5px solid #c8920f;
  border-radius: 8px;
  background: #daa520;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.submit-btn.submit-disabled {
  background: #e3e1e1;
  cursor: not-allowed;
  color: #b2afaf;
}
</style>