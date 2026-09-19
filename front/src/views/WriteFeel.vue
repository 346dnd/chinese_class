<template>
  <div class="page-bg"></div>
    <div class="page-container" :style="pageStyle">
    <PageHeader
      title="寻找文化：写写感想"
      @back="goBack"
      voice-broadcast
      :voice-on="voiceBroadcastOn"
      @toggle-voice="playVoiceBroadcast"
      @video="openVideoModal"
    />

    <!-- 课文标签切换 -->
    <div class="tab-wrapper">
      <div
        v-for="(tab, idx) in tabList"
        :key="tab.id"
        class="tab-item"
        :class="getTabClass(tab.id)"
        @click="handleTabClick(tab.id)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 左侧区域：数字人 + 对话框 或 课文内容 -->
    <div class="left-area">
      <div class="digital-human-area" v-if="currentPanel === 'human' && !isAllCompleted">
        <img
          src="/image/小小_汉服 1.png"
          alt="数字人"
          class="digital-human-img"
        />
        <div class="bubble-action-wrap" v-if="talkText">
          <div
            class="human-talk-bubble"
            :class="{ expanded: isBubbleExpanded }"
          >
            <span class="bubble-text">{{ talkText }}</span>
            <img
              src="/image/语音朗读.png"
              alt="播放"
              class="bubble-voice-icon"
              @click="playBubbleAudio"
            />
            <span class="bubble-arrow"></span>
          </div>

          <!-- 完成态 UI 已迁移至底部 CompletionOverlay -->
        </div>
      </div>

      <ArticleReader
        v-if="currentPanel === 'lesson'"
        :visible="currentPanel === 'lesson'"
        :htmlContent="currentArticleContent"
        @close="closeArticle"
      />
    </div>

    <!-- 右侧答题容器 -->
    <div class="right-container" ref="rightContainerRef">
      <div class="write-feel-modal">
        <!-- 固定引导标题始终显示 -->
        <h3 class="modal-title">
          写写感想
          <img
            src="/image/语音朗读.png"
            alt="语音"
            class="title-voice-icon"
            @click="playAudio(currentGuideText)"
          />
        </h3>
        <p class="guide-desc">
          这三篇课文都写到了中华优秀传统文化的内容，在《纸的发明》里，是哪些方面让你自豪？《赵州桥》《一幅名扬中外的画》又分别是哪些方面让你自豪？请把特别让你自豪的这些方面写下来，记得都要能够<span class="text-red">联系相应的课文内容</span>和<span class="text-red">生活实际</span>。
        </p>

        <!-- 已完成的题目 -->
          <div
            v-for="(question, qIdx) in completedQuestions"
            :key="'completed-' + question.id"
            class="completed-question-block"
          >
            <h3 class="question-title">{{ getApiQuestionTitle(question.id) }}</h3>
            <div class="submitted-answer">
              <div
                class="answer-box"
                :class="showReferenceAnswerMap[question.id] ? 'answer-wrong' : (getLastRecord(question.id)?.isCorrect ? 'answer-correct' : 'answer-wrong')"
              >
                <template v-if="showReferenceAnswerMap[question.id] && getLastRecord(question.id)?.referenceAnswer">
                  <span class="answer-label">参考答案：</span>{{ getLastRecord(question.id)?.referenceAnswer }}
                </template>
                <template v-else>
                  <span class="answer-label">回答：</span>{{ getLastRecord(question.id)?.studentAnswer || getLastRecord(question.id)?.answer }}
                </template>
              </div>
            </div>
          </div>

        <!-- 当前题目 -->
        <div class="current-question-block" v-if="activeQuestionId">
          <h3 class="question-title">{{ getApiQuestionTitle(activeQuestionId) }}</h3>

          <!-- 历史回答记录：3次不合格时展示后端参考答案，否则展示最后一次作答（绿=对，红=错） -->
          <div class="history-section" v-if="lastRecord">
            <div class="history-item">
              <div
                class="history-answer-box"
                :class="isCurrentRevealed ? 'answer-wrong' : (lastRecord.isCorrect ? 'answer-correct' : 'answer-wrong')"
              >
                <template v-if="isCurrentRevealed && lastRecord.referenceAnswer">
                  <span class="answer-label">参考答案：</span>{{ lastRecord.referenceAnswer }}
                </template>
                <template v-else>
                  <span class="answer-label">回答：</span>{{ lastRecord.studentAnswer || lastRecord.answer }}
                </template>
              </div>
            </div>
          </div>

          <div class="input-wrapper">
            <p class="reveal-note" v-if="isCurrentRevealed">以下为你最后一次的作答，即将进入下一篇课文：</p>
            <div class="feel-input-box">
              <textarea
                class="feel-input"
                v-model="userInput"
                :readonly="isCurrentRevealed"
                :class="{
                  'input-invalid': currentSubmitStatus === 'wrong' && !isCurrentRevealed,
                  'has-content': userInput.trim(),
                  'text-red': currentSubmitStatus === 'wrong' && !isCurrentRevealed,
                  'input-revealed': isCurrentRevealed
                }"
                :placeholder="getApiQuestion(activeQuestionId)?.placeholder || '输入你的感想...'"
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
                <span class="capture-tip">已识别并填入作答框</span>
              </div>
            </div>

            </div>
        </div>

        <div class="all-completed-hint" v-if="isAllCompleted">
        </div>
      </div>

      <!-- 提交反馈：严格置于右侧答题框正下方（相对流元素，宽度随答题框） -->
      <div
        class="submit-feedback"
        v-if="submitState !== 'idle'"
        :class="{
          'is-submitting': submitState === 'submitting',
          'is-success': submitState === 'success',
          'is-error': submitState === 'error'
        }"
      >
        <span v-if="submitState === 'submitting'" class="feedback-spinner"></span>
        {{ submitMsg }}
      </div>
    </div>

    <!-- 主操作按钮：作答期间显示「提交」，完成后显示「下一篇课文」 -->
    <div
      class="next-lesson-btn"
      :class="{
        'gold-bg': userInput.trim() || isCurrentRevealed,
        'green-bg': activeQuestionId ? passedMap[activeQuestionId] && !isCurrentRevealed : false
      }"
      :style="{ top: nextBtnTop + 'px' }"
      @click="onPrimaryBtnClick"
    >
      <img src="/image/矢量 67.png" alt="箭头" class="btn-arrow-icon" />
      {{ primaryBtnLabel }}
    </div>

  </div>

  <!-- 完成态：全屏黑色半透明遮罩 + 数字人/按钮舞台（覆盖整个视口，不被画布缩放与其余层遮挡） -->
  <CompletionOverlay :show="isAllCompleted">
    <div class="wf-complete-wrap">
      <img class="wf-complete-human" src="/image/小小_汉服 1.png" alt="数字人" />
      <div class="wf-complete-feedback">
        <CompletionFeedback
          :show="true"
          :message="talkText"
          @go-report="goToReport"
          @go-home="goHome"
          @play-audio="playBubbleAudio"
        />
      </div>
    </div>
  </CompletionOverlay>

  <!-- 回看视频弹窗 -->
  <VideoModal v-model:show="showVideoModal" :url="introVideoUrl" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useScale } from '../composables/useScale'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { useFile } from '../composables/useFile'
import { lessonSource } from '../utils/lessonText'
import PageHeader from '../components/PageHeader.vue'
import ArticleReader from '../components/ArticleReader.vue'
import CompletionOverlay from '../components/CompletionOverlay.vue'
import CompletionFeedback from '../components/completion/CompletionFeedback.vue'
import VideoModal from '../components/VideoModal.vue'
import { DefaultService } from '../api/generated'
import { call, toUserFriendlyError } from '../api/helpers'
import { getWriteThoughtEnding, getTranscription } from '../api'
import type {
  WriteThoughtParams,
  WriteThoughtState,
  WriteThoughtSubmitResult,
} from '../api/generated'
type WriteThoughtQuestion = WriteThoughtState['questions'][number]
import { useCompletionPersistence } from '../composables/useCompletionPersistence'

// 跨刷新持久化：答完「写写感想」后，刷新仍停在带「查看评价/回到首页」的完成屏
const {
  markCompleted: markWriteFeelCompleted,
  loadProgress: loadWriteFeelProgress,
  saveProgress: saveWriteFeelProgress,
  isCompleted: isWriteFeelCompleted,
} = useCompletionPersistence('write-feel')
type WriteFeelProgress = {
  passedMap?: Record<string, boolean>
  historyRecordsMap?: Record<string, Array<{ question: string; answer: string; studentAnswer?: string; referenceAnswer?: string; isCorrect: boolean }>>
  showReferenceAnswerMap?: Record<string, boolean>
  /** 每篇课文的输入草稿（未提交），刷新后回填 */
  drafts?: Record<string, string>
}

const router = useRouter()
// nodeId / classId 优先取路由参数（route.params 或 route.query），缺省回退到已知正确值
// 本页对应 write-thoughts 模块，默认 node 17
const route = useRoute()
const NODE_ID = computed(() => Number(route.params.nodeId) || Number(route.query.nodeId) || 17)
const CLASS_ID = computed(() => Number(route.params.classId) || Number(route.query.classId) || 127)
const photoInputRef = ref<HTMLInputElement | null>(null)
const rightContainerRef = ref<HTMLElement | null>(null)

// ========== 自适应缩放 ==========
const { pageStyle, updateScale } = useScale()

// ========== 文件上传 / OCR / 录音 ==========
const {
  uploadImage,
  ocrImageFile,
  startRecording,
  stopRecordingAndUpload,
  uploading,
  isRecording
} = useFile()
// 拍照后得到的预览图（已上传，可预览地址）
const capturedImageUrl = ref('')
const audioUrl = ref('')
// 录音上传后正在调用后端语音转文字（ASR）接口
const isTranscribing = ref(false)

// ========== 提交反馈状态（让用户明确看到「提交中 / 成功 / 失败」） ==========
const submitState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const submitMsg = ref('')
let submitMsgTimer: ReturnType<typeof setTimeout> | null = null
const showSubmitFeedback = (
  state: 'idle' | 'submitting' | 'success' | 'error',
  msg: string,
  autoHide = true
) => {
  submitState.value = state
  submitMsg.value = msg
  if (submitMsgTimer) {
    clearTimeout(submitMsgTimer)
    submitMsgTimer = null
  }
  if (autoHide) {
    submitMsgTimer = setTimeout(() => {
      submitState.value = 'idle'
      submitMsg.value = ''
    }, 3500)
  }
}

// ========== 动态计算按钮位置 ==========
const nextBtnTop = ref(0)
const updateNextBtnPosition = () => {
  nextTick(() => {
    if (rightContainerRef.value) {
      const container = rightContainerRef.value
      const containerTop = container.offsetTop
      const containerHeight = container.offsetHeight
      const gap = 18.9 // 0.5cm ≈ 18.9px
      nextBtnTop.value = containerTop + containerHeight + gap
    }
  })
}

// ========== 气泡折叠 ==========
const isBubbleExpanded = ref(true)

// ========== 数据定义 ==========
const tabList = ref<Array<{ id: string; name: string; apiQuestion: WriteThoughtQuestion | null }>>([])

const articleContents: Record<string, string> = {
  paper: lessonSource.paper_invent.html,
  bridge: lessonSource.zhaozhouqiao.html,
  painting: lessonSource.famous_painting.html
}

const currentTabId = ref('paper')
const currentPanel = ref<'human' | 'lesson'>('human')
const userInput = ref('')

const passedMap = reactive<Record<string, boolean>>({ paper: false, bridge: false, painting: false })
const historyRecordsMap = reactive<Record<string, Array<{
  question: string
  answer: string
  studentAnswer?: string
  referenceAnswer?: string
  isCorrect: boolean
}>>>({
  paper: [],
  bridge: [],
  painting: []
})
const showReferenceAnswerMap = reactive<Record<string, boolean>>({ paper: false, bridge: false, painting: false })

const talkText = ref('')
const conversationHistory = ref<Array<{ role: string; text: string }>>([])

// ========== API 数据 ==========
const apiQuestions = ref<WriteThoughtQuestion[]>([])

// ========== 引导文字 ==========
const currentGuideText = ref('')

// ========== 计算属性 ==========
const currentTabName = computed(() => {
  const tab = tabList.value.find(t => t.id === currentTabId.value)
  return tab ? tab.name : ''
})

const currentArticleContent = computed(() => articleContents[currentTabId.value] || '')

const showReferenceAnswer = computed(() =>
  activeQuestionId.value ? showReferenceAnswerMap[activeQuestionId.value] : false
)

const currentSubmitStatus = computed(() => {
  if (!activeQuestionId.value) return ''
  const records = historyRecordsMap[activeQuestionId.value] || []
  if (records.length > 0) {
    return records[records.length - 1].isCorrect ? 'correct' : 'wrong'
  }
  return ''
})

const isAllCompleted = computed(() => tabList.value.length > 0 && tabList.value.every(t => passedMap[t.id]))

const completionMessage = computed(() =>
  conversationHistory.value
    .filter(c => c.role === 'student')
    .map(c => c.text)
    .join('\n')
)

// 当前激活题 = 第一篇「未完成」的课文（按顺序解锁：前面的没做完，后面的 tab 点不开）
const activeQuestionId = computed(() => {
  for (let i = 0; i < tabList.value.length; i++) {
    if (!passedMap[tabList.value[i].id]) {
      return tabList.value[i].id
    }
  }
  return null
})

const completedQuestions = computed(() =>
  tabList.value.filter(t => passedMap[t.id] && historyRecordsMap[t.id]?.length > 0)
)

// 当前题目是否已「揭晓参考答案」（第三次不合格触发）
const isCurrentRevealed = computed(() => {
  const id = activeQuestionId.value
  return id ? !!showReferenceAnswerMap[id] : false
})

// 主操作按钮文案：作答期间显示「提交」，已通过/已揭晓显示「下一篇课文」
const primaryBtnLabel = computed(() => {
  const id = activeQuestionId.value
  if (!id) return '下一篇课文'
  if (passedMap[id] || showReferenceAnswerMap[id]) return '下一篇课文'
  return '提交'
})

// ========== 方法 ==========
const getTabClass = (tabId: string) => {
  const idx = tabList.value.findIndex(t => t.id === tabId)
  const isActive = tabId === currentTabId.value
  const isPassed = passedMap[tabId]
  const firstUnpassedIdx = getFirstUnpassedIndex()
  const isLocked = !isPassed && idx > firstUnpassedIdx
  return {
    'tab-active': isActive && !isLocked,
    'tab-passed': isPassed,
    'tab-locked': isLocked,
    'tab-unlocked': !isLocked && !isActive && !isPassed
  }
}

const getFirstUnpassedIndex = () => {
  for (let i = 0; i < tabList.value.length; i++) {
    if (!passedMap[tabList.value[i].id]) return i
  }
  return tabList.value.length
}

const getQuestionName = (tabId: string) => {
  const tab = tabList.value.find(t => t.id === tabId)
  return tab ? tab.name : ''
}

// 取当前标签对应的「后端真实问题对象」：tabList 项里已嵌入 apiQuestion
const getApiQuestion = (tabId: string): WriteThoughtQuestion | null | undefined => {
  return tabList.value.find(t => t.id === tabId)?.apiQuestion
}

// 显示后端返回的真实题目文本（如「在《纸的发明》中，是哪些让你感到自豪？」），
// 找不到时回退到课文标签名，保证一定有题目可见。
const getApiQuestionTitle = (tabId: string): string => {
  return getApiQuestion(tabId)?.title || getQuestionName(tabId)
}

const getHistoryRecords = (tabId: string) => historyRecordsMap[tabId] || []

// 取某题「最后一次作答」记录（答完后只展示最后这一次的状态）
const getLastRecord = (tabId: string) => {
  const records = historyRecordsMap[tabId] || []
  return records.length > 0 ? records[records.length - 1] : null
}

// 当前激活题的最后一次作答记录（供模板直接绑定，避免 null 判断报错）
const lastRecord = computed(() =>
  activeQuestionId.value ? getLastRecord(activeQuestionId.value) : null
)

// 用后端返回的权威状态重建本地进度（页面加载 / 提交后回拉 都用它）
// 以后端 node_submissions 的 submitLogs 为准，最后一次提交即为「最新作答」
const applyState = (state: WriteThoughtState) => {
  const lessonKeys = ['paper', 'bridge', 'painting']
  const lessonNames = ['纸的发明', '赵州桥', '一幅名扬中外的画']
  // 1. 重建 tab 列表（后端真实题目，按课文顺序对齐）
  tabList.value = lessonKeys.map((key, i) => ({
    id: key,
    name: lessonNames[i],
    apiQuestion: state.questions[i] || null
  }))
  apiQuestions.value = state.questions

  // 2. 以 submitLogs 重建三张进度表
  lessonKeys.forEach((key, i) => {
    const q = state.questions[i]
    // 后端 submitLogs 按时间倒序（最新在前），翻转为正序（最新在后），与「最后一次作答」语义一致
    const logs = (q && q.submitLogs ? q.submitLogs.slice().reverse() : [])
    passedMap[key] = false
    showReferenceAnswerMap[key] = false
    historyRecordsMap[key] = logs.map(log => ({
      question: q ? q.title : key,
      answer: log.submittedText || '',
      studentAnswer: log.submittedText || '',
      referenceAnswer: log.referenceAnswer || undefined,
      isCorrect: !!log.isPassed
    }))
    const attempts = logs.length
    if (attempts > 0) {
      const lastPassed = !!logs[attempts - 1].isPassed
      // 已通过 或 已达 3 次上限 → 标记该课文完成
      if (lastPassed || attempts >= 3) passedMap[key] = true
      // 已答 3 次（含不合格）→ 显示「查看评价」节点（参考答案由数字人提供，前端不展示）
      if (attempts >= 3) showReferenceAnswerMap[key] = true
    }
  })

  // 3. 顺带把当前进度存本地快照（中途刷新也能保留答题记录）
  saveWriteFeelProgress({
    passedMap: { ...passedMap },
    historyRecordsMap: JSON.parse(JSON.stringify(historyRecordsMap)),
    showReferenceAnswerMap: { ...showReferenceAnswerMap }
  })
}

// 用本地快照恢复进度（后端不可用 / 后端数据不全但本地已完成时兜底）
const applyLocalSnapshot = (): boolean => {
  const saved = loadWriteFeelProgress<WriteFeelProgress>()
  if (!saved) return false
  // tabList 为空（后端没下发题目）时先按静态课文结构建好外壳
  if (tabList.value.length === 0) {
    const lessonKeys = ['paper', 'bridge', 'painting']
    const lessonNames = ['纸的发明', '赵州桥', '一幅名扬中外的画']
    tabList.value = lessonKeys.map((key, i) => ({ id: key, name: lessonNames[i], apiQuestion: null }))
  }
  if (saved.passedMap) {
    Object.keys(saved.passedMap).forEach(key => { passedMap[key] = !!saved.passedMap?.[key] })
  }
  if (saved.historyRecordsMap) {
    Object.keys(saved.historyRecordsMap).forEach(key => {
      historyRecordsMap[key] = (saved.historyRecordsMap?.[key] || []).map(r => ({ ...r }))
    })
  }
  if (saved.showReferenceAnswerMap) {
    Object.keys(saved.showReferenceAnswerMap).forEach(key => {
      showReferenceAnswerMap[key] = !!saved.showReferenceAnswerMap?.[key]
    })
  }
  // 回填当前激活课文的输入草稿（全部完成时无需回填）
  const active = activeQuestionId.value
  if (active && saved.drafts?.[active] && !isAllCompleted.value) {
    userInput.value = saved.drafts[active]
  }
  return true
}

// 打字草稿防抖保存：未提交的输入，刷新后也不丢
let draftTimer: ReturnType<typeof setTimeout> | null = null
watch(userInput, () => {
  if (draftTimer) clearTimeout(draftTimer)
  draftTimer = setTimeout(() => {
    const draftKey = activeQuestionId.value
    if (!draftKey || isAllCompleted.value) return
    const saved = loadWriteFeelProgress<WriteFeelProgress>() || {}
    saveWriteFeelProgress({
      passedMap: { ...passedMap },
      historyRecordsMap: JSON.parse(JSON.stringify(historyRecordsMap)),
      showReferenceAnswerMap: { ...showReferenceAnswerMap },
      drafts: { ...(saved.drafts || {}), [draftKey]: userInput.value }
    })
  }, 500)
})
const handleTabClick = (tabId: string) => {
  const idx = tabList.value.findIndex(t => t.id === tabId)
  const firstUnpassedIdx = getFirstUnpassedIndex()
  if (idx > firstUnpassedIdx) return

  if (tabId === currentTabId.value) {
    openArticle()
  } else {
    switchToTab(tabId)
  }
}

const switchToTab = (tabId: string) => {
  currentTabId.value = tabId
  userInput.value = ''
  currentPanel.value = 'human'
  updateNextBtnPosition()
}

const openArticle = () => {
  currentPanel.value = 'lesson'
}

const closeArticle = () => {
  currentPanel.value = 'human'
}

// ========== 音频播放（接口预留） ==========
const { isPlaying, playAudio, stop } = useAudioPlayer()

const playBubbleAudio = () => {
  // 展开气泡并播放
  isBubbleExpanded.value = true
  if (talkText.value) {
    playAudio(talkText.value)
  }
}

// 监听talkText变化，自动折叠旧气泡；完成态下保留展开以展示后端结束语
watch(talkText, () => {
  if (!isAllCompleted.value) isBubbleExpanded.value = false
  // 更新气泡后重算按钮位置
  updateNextBtnPosition()
})

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
const introVideoUrl = ref('')
const openVideoModal = () => {
  showVideoModal.value = true
}

// ========== 提交答案 ==========
const submitAnswer = async () => {
  if (!userInput.value.trim()) {
    showSubmitFeedback('error', '请先填写你的感想，再点击提交')
    playAudio('请先填写你的感想，再点击提交')
    return
  }
  const articleId = activeQuestionId.value
  if (!articleId) return

  const submittedText = userInput.value
  const tab = tabList.value.find(t => t.id === articleId)
  const apiQuestion = tab?.apiQuestion
  if (!apiQuestion) {
    // 后端没下发该课文题目（虚拟 tab）：标记通过并进入下一篇
    showSubmitFeedback('success', '已提交，进入下一篇课文')
    passedMap[articleId] = true
    goToNextUnpassed(articleId)
    return
  }

  try {
    // 0. 明确反馈「提交中…」，让用户知道点击已生效
    showSubmitFeedback('submitting', '提交中…', false)
    // 1. 提交到后端（返回 submitId，异步 AI 批改）
    const submitResp = await call(DefaultService.postApiV1StuClassNodeWriteThoughtsSubmissions(CLASS_ID.value, NODE_ID.value, { questionId: apiQuestion.id, type: 'submit', input: submittedText })) as
      | { submitId?: string; tip?: string }
      | WriteThoughtSubmitResult
      | null

    // 2. 异步形态：轮询直到批改完成（best-effort，仅用于即时反馈文案）
    let pollFeedback = ''
    if (submitResp && 'submitId' in submitResp && submitResp.submitId) {
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 1000))
        try {
          const poll = await call(DefaultService.getApiV1StuClassNodeWriteThoughtsSubmissions(CLASS_ID.value, NODE_ID.value, submitResp.submitId))
          if (poll) {
            pollFeedback = poll.feedback || ''
            if (!poll.isProcessing) break
          }
        } catch {
          // 轮询异常不影响最终以回拉 state 为准
        }
      }
    } else if (submitResp && 'feedback' in submitResp) {
      pollFeedback = (submitResp as WriteThoughtSubmitResult).feedback || ''
    }

    // 3. 关键：回拉后端权威状态，用「最后一次提交的记录」重建页面
    //    提交即落库（node_submissions），刷新也能还原——彻底解决「只写第一题/不保存」
    const state = await call(DefaultService.getApiV1StuClassNodeWriteThoughtsState(CLASS_ID.value, NODE_ID.value))
    if (state) applyState(state)

    // 4. 用回拉后的最新记录驱动反馈与翻篇
    const records = historyRecordsMap[articleId] || []
    if (records.length === 0) {
      // 已成功落库但未能回拉状态（极少见）：仍明确提示提交成功
      showSubmitFeedback('success', '提交成功！')
      return
    }
    const last = records[records.length - 1]
    const isCorrect = last.isCorrect
    const attempts = records.length

    conversationHistory.value.push({ role: 'student', text: submittedText })

    if (isCorrect) {
      talkText.value = pollFeedback || '回答正确，请继续写写下一篇课文的感想。'
      playAudio(talkText.value)
      showSubmitFeedback('success', '提交成功，回答正确！')
      userInput.value = ''
      autoAdvanceToNext(articleId)
    } else if (attempts >= 3) {
      // 第三次不合格：后端已达 3 次答题上限，展示最后一次作答并自动跳转下一篇课文
      showSubmitFeedback('success', '已为你保留最后一次作答，即将进入下一篇课文')
      revealAndAdvance(articleId, undefined)
    } else {
      // 后端每题给 3 次答题机会：错答时提示剩余次数，引导用户继续作答
      const remaining = 3 - attempts
      talkText.value = pollFeedback || `这次的回答还没有符合要求，还有 ${remaining} 次机会，请再仔细想一想。`
      playAudio(talkText.value)
      showSubmitFeedback('error', `这次的回答还不符合要求，还有 ${remaining} 次机会，请再仔细想想`)
    }
    updateNextBtnPosition()
  } catch (e) {
    console.error('提交失败:', e)
    const msg = toUserFriendlyError(e)
    talkText.value = msg
    playAudio(msg)
    showSubmitFeedback('error', msg)
  }
}

// 取 tabList 中指定 tab 的下一个 tabId（已到末尾则返回 null）
const getNextTabId = (currentId: string): string | null => {
  const idx = tabList.value.findIndex(t => t.id === currentId)
  if (idx < 0 || idx + 1 >= tabList.value.length) return null
  return tabList.value[idx + 1].id
}

// ========== 自动推进到下一篇课文 ==========
const autoAdvanceToNext = (articleId: string) => {
  const nextId = getNextTabId(articleId)
  if (nextId) {
    switchToTab(nextId)
    talkText.value = '回答正确，请继续写写下一篇课文的感想。'
  } else {
    talkText.value = '恭喜你完成了所有题目！'
  }
  updateNextBtnPosition()
}

// ========== 主操作按钮 ==========
// 作答中点击 → 提交；已通过/已揭晓点击 → 进入下一篇
const onPrimaryBtnClick = () => {
  const id = activeQuestionId.value
  if (!id) return
  if (passedMap[id] || showReferenceAnswerMap[id]) {
    goToNextUnpassed(id)
  } else {
    submitAnswer()
  }
}

// 揭晓参考答案并自动跳转下一篇课文
const revealAndAdvance = (articleId: string, refAnswer?: string) => {
  // 三次不合格：展示后端返回的参考答案（替换学生最后一次输入），不展示「学生原错误答案」
  const records = historyRecordsMap[articleId]
  const last = (records && records.length > 0) ? records[records.length - 1] : null
  const refAnswerText = refAnswer || (last && (last.referenceAnswer || last.studentAnswer || last.answer)) || userInput.value
  showReferenceAnswerMap[articleId] = true

  // 把后端参考答案回填到输入框（只读展示），替换学生原输入
  userInput.value = refAnswerText
  talkText.value = '已为你展示参考答案，即将进入下一篇课文。'
  updateNextBtnPosition()
  // 1.8s 后才标记通过并切换，避免 activeQuestionId 立即翻篇导致作答一闪而过
  setTimeout(() => {
    passedMap[articleId] = true
    goToNextUnpassed(articleId)
  }, 1800)
}

// 跳转到下一篇未完成的课文（按 tabList 顺序显式计算，避免依赖 computed 时序）。
// 虚拟 tab（后端未下发对应题目）会自动标记通过并向后跳过，直到找到真正需要作答的下一篇或全部完成。
const goToNextUnpassed = (justFinishedId: string) => {
  let nextId = getNextTabId(justFinishedId)
  // 跳过连续虚拟 tab（后端仅下发 1 题时，第 2、3 篇为虚拟）
  while (nextId) {
    const tab = tabList.value.find(t => t.id === nextId)
    if (tab && !tab.apiQuestion) {
      passedMap[nextId] = true
      nextId = getNextTabId(nextId)
    } else {
      break
    }
  }
  if (nextId) {
    switchToTab(nextId)
    talkText.value = '请继续写写下一篇课文的感想。'
  } else {
    talkText.value = '恭喜你完成了所有题目！'
  }
  updateNextBtnPosition()
}

// ========== 语音/拍照 ==========
// 语音：点击开始录音，再次点击停止并上传音频，上传后调后端 ASR 把文字回填输入框
const handleVoice = async () => {
  try {
    if (!isRecording.value) {
      await startRecording()
    } else {
      const res = await stopRecordingAndUpload({ resource_info: '写写感想-语音作答' })
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

const handlePhoto = () => {
  if (photoInputRef.value) {
    photoInputRef.value.click()
  }
}

// 拍照：上传图片 → OCR 识别手写文字填入作答框 → 预览图
const onPhotoCapture = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const url = await uploadImage(file, { resource_info: '写写感想-拍照作答' })
    capturedImageUrl.value = url.url
    const text = await ocrImageFile(file, { resource_info: '写写感想-手写识别' })
    if (text && text.trim()) {
      userInput.value = userInput.value ? `${userInput.value}\n${text}` : text
    }
  } catch (e: any) {
    console.error('拍照上传/OCR 失败:', e)
  } finally {
    target.value = ''
  }
}

// ========== 导航 ==========
const goBack = () => {
  router.push('/')
}

const goToReport = () => router.push(`/report?classId=${CLASS_ID.value}&nodeId=${NODE_ID.value}`)
const goHome = () => {
  router.push('/')
}

// ========== 监听输入变化 ==========
watch(userInput, () => {
  // 用户重新输入时清除上一次「成功/失败」提示（提交中状态不清除）
  if (submitState.value !== 'submitting') {
    submitState.value = 'idle'
    submitMsg.value = ''
  }
  updateNextBtnPosition()
})

// 监听面板内容变化，更新按钮位置
watch([currentPanel, () => historyRecordsMap[activeQuestionId.value || 'paper']?.length], () => {
  updateNextBtnPosition()
}, { deep: true })

// 切 tab 时恢复输入框：已揭晓的题目重新填上参考答案，未通过的清空
watch(activeQuestionId, (newId) => {
  if (!newId) return
  if (!passedMap[newId]) {
    userInput.value = ''
  }
})

// 全部完成后：拉取后端结束语（AI 总结）填充数字人气泡 + 写入本地完成态
watch(isAllCompleted, async (val) => {
  if (val) {
    // 写入本地完成态，首页「写写感想」变绿（未完成保持白）
    const { useProgressStore } = await import('../stores/progress')
    useProgressStore().markTaskFinished('write-feel')
    // 拉取后端结束语（v4 write-thoughts/ending），填充数字人旁的气泡（后端数据）
    try {
      const ending = await getWriteThoughtEnding(CLASS_ID.value, NODE_ID.value)
      talkText.value = ending?.comment || '你联系课文内容和生活实际，把对中华优秀传统文化的自豪感写得真真切切，很会表达！'
      isBubbleExpanded.value = true
      playAudio(talkText.value)
    } catch (e) {
      console.error('获取写写感想结束语失败:', e)
      // 兜底：后端未启动或接口异常时也给气泡填充文字，避免气泡无高度
      talkText.value = '你联系课文内容和生活实际，把对中华优秀传统文化的自豪感写得真真切切，很会表达！'
      isBubbleExpanded.value = true
    }
    // 写入本地完成态：刷新后停留在带「查看评价/回到首页」的完成屏
    markWriteFeelCompleted({
      passedMap: { ...passedMap },
      historyRecordsMap: JSON.parse(JSON.stringify(historyRecordsMap)),
      showReferenceAnswerMap: { ...showReferenceAnswerMap }
    })
  }
})

// ========== 生命周期 ==========
onMounted(async () => {
  try {
    const [params, state] = await Promise.all([
      call(DefaultService.getApiV1StuClassNodeWriteThoughtsParams(CLASS_ID.value, NODE_ID.value)),
      call(DefaultService.getApiV1StuClassNodeWriteThoughtsState(CLASS_ID.value, NODE_ID.value))
    ])
    // 用后端返回的权威状态重建进度（题目、作答记录、完成态均以后端 submitLogs 为准）
    if (state) applyState(state)
    // 设置引导文字
    talkText.value = params.introBubbleText || ''
    currentGuideText.value = params.description?.map(d => d.text).join('') || params.introBubbleText || ''
    // 保存导入视频地址供"回看视频"按钮使用
    introVideoUrl.value = params.introVideo?.url || ''
    // 后端数据不全但本地已完成（后端可能只落库了部分题目）→ 以本地快照为准，停留在完成屏
    if (!isAllCompleted.value && isWriteFeelCompleted()) {
      applyLocalSnapshot()
    }
    // 未完成时才播导入音频；完成态恢复时由结束语 watch 负责播报
    if (!isAllCompleted.value) {
      setTimeout(() => playAudio(params.introBubbleText || ''), 500)
    }
    updateNextBtnPosition()
  } catch (e) {
    console.error('加载写写感想数据失败:', e)
    // 后端不可用：用本地快照兜底，已完成的学生仍停留在带「查看评价/回到首页」的完成屏，
    // 做到一半的也能恢复之前的答题记录
    if (applyLocalSnapshot()) {
      if (!isAllCompleted.value) {
        talkText.value = '后端服务暂不可用，已恢复你之前的答题记录。'
      }
    } else {
      talkText.value = toUserFriendlyError(e)
    }
  }
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
  background: url('/image/image 110.png') no-repeat center center;
  background-size: cover;
}
.page-container {
  width: 1920px;
  height: 1080px;
  position: fixed;
  top: 50%;
  left: 50%;
  overflow: hidden;
  z-index: 1;
}


/* ========== 课文标签 ========== */
.tab-wrapper {
  position: absolute;
  top: 130px;
  left: 60px;
  display: flex;
  align-items: center;
  background: rgba(240, 239, 238, 0.2);
  border-radius: 12px;
  border: 1px solid rgb(250, 248, 247, 0.5);
  padding: 6px 14px;
  gap: 8px;
  z-index: 10;
}
.tab-item {
  padding: 8px 19px;
  height: 35px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 20px;
  font-family: "FZCuKaiS-R-GB", "KaiTi", "STKaiti", 楷体, serif;
  font-weight: 580;
  line-height: 19px;
  letter-spacing: -2px;
  color: #333;
  cursor: pointer;
  border: 1px solid #a29f9f;
  box-shadow: 0 2px 4px rgba(134, 129, 129, 0.647);
  transition: all 0.2s;
}
.tab-item.tab-active {
  background: #d27f01;
  color: #fff;
  border-color: #d27f01;
}
.tab-item.tab-passed {
  background: #d27f01;
  color: #fff;
  border-color: #d27f01;
}
.tab-item.tab-locked {
  background: #e9e8e8;
  color: #a19d9d;
  border-color: #c5c5c5;
  cursor: not-allowed;
}
.tab-item.tab-unlocked {
  background: #fff;
  color: #333;
  border-color: #ddd;
}

/* ========== 左侧区域 ========== */
.left-area {
  position: absolute;
  top: 170px;
  left: 60px;
  bottom: 20px;
  width: 800px;
  z-index: 5;
}

/* 数字人 */
.digital-human-area {
  position: absolute;
  left: 150px;
  bottom: 20px;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}

/* 完成态遮罩舞台内的数字人 + 评价按钮：锚到与正常页面数字人完全一致的位置/大小，
   即“没跳到完成页”的视觉（left:80px/bottom:20px、数字人 180px，与 .digital-human-area 一致） */
.wf-complete-wrap {
  position: absolute;
  left: -150px;
  bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 28px;
}
.wf-complete-human {
  width: 180px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.wf-complete-feedback {
  width: 480px;
}

/* 气泡+按钮容器：flex列布局，按钮跟随气泡高度 */
.bubble-action-wrap {
  position: absolute;
  left: 190px;
  /* 与数字人整体垂直居中对齐（避开脖子/头顶），任意图片高度都自然 */
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 19px; /* 0.5cm */
}
.human-talk-bubble {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 8px;
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
.bubble-voice-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  object-fit: contain;
}
.bubble-arrow {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid #fff;
}

/* ========== 右侧面板 ========== */
.right-container {
  position: absolute;
  top: 170px;
  right: 70px;
  width: 580px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 20px 24px;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 固定标题 */
.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-voice-icon {
  width: 22px;
  height: 22px;
  cursor: pointer;
  object-fit: contain;
}
.guide-desc {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 14px;
}
.text-red {
  color: red;
}

/* 已完成题目 */
.completed-question-block {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ddd;
}
.question-title {
  font-size: 17px;
  font-weight: 600;
  color: #0e0e0f;
  margin: 0 0 10px 0;
}
.submitted-answer {
  margin-bottom: 14px;
}

/* 答案框 */
.answer-box {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
}
.answer-correct {
  background: #2a9d3a;
  color: #fff;
  border: 2px solid #1e7a2a;
}
.answer-wrong {
  background: #fde2e2;
  color: #b42020;
  border: 2px solid #b42020;
}

/* 历史回答 */
.history-section {
  margin-bottom: 14px;
  padding-top: 10px;
  border-top: 1px dashed #e0e0e0;
}
.history-item {
  margin-bottom: 10px;
  font-size: 14px;
}
.history-answer-box {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  max-height: 84px; /* 约3行（line-height 1.5 × 14px × 3 ≈ 63px）+ padding，超出滚动 */
  overflow-y: auto;
}
.history-answer-box.answer-correct {
  background: #2a9d3a;
  color: #fff;
  border: 2px solid #1e7a2a;
}
.history-answer-box.answer-wrong {
  background: #fde2e2;
  color: #b42020;
  border: 2px solid #b42020;
}
.answer-label {
  font-weight: 500;
}

/* 输入框 */
.input-wrapper {
  margin-top: 6px;
}
.feel-input-box {
  position: relative;
}
.feel-input {
  width: 100%;
  min-height: 90px;
  max-height: 108px; /* 约4行（line-height 1.5 × font-size 16px × 4 ≈ 96px），超出滚动 */
  border: 1.5px solid #b8c8f0;
  border-radius: 14px;
  padding: 14px 60px 14px 14px;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.3s, color 0.3s;
  box-sizing: border-box;
  overflow-y: auto;
}
.feel-input.has-content {
  border-color: #daa520;
}
.feel-input.input-invalid {
  border-color: red;
}
.feel-input.text-red {
  color: red;
}
.func-btn-group {
  position: absolute;
  right: 10px;
  bottom: 15px;
  display: flex;
  gap: 10px;
}
.func-btn {
  padding: 5px 14px;
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

/* 揭晓参考答案提示 */
.reveal-note {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}
/* 输入框已展示最后一次作答（只读） */
.feel-input.input-revealed {
  background: #f5f5f5;
  border-color: #ccc;
  color: #444;
}
/* 参考答案 */
.reference-answer {
  margin-top: 10px;
  padding: 10px 14px;
  background: #e3f2fd;
  border-radius: 10px;
  border-left: 3px solid #1976d2;
}
.ref-label {
  font-size: 13px;
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 4px;
}
.ref-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* 完成覆盖层 */
.completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
}
.completion-feedback-bubble {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.feedback-message {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0;
}
.completion-action-bar {
  position: relative;
  width: 100%;
  display: flex;
  gap: 12px;
}
.bar-btn-icon {
  width:18px;
  height:18px;
  object-fit:contain;
}
.completion-action-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
}
.report-btn {
  background: #daa520;
  color: #ffffff;
}
.report-btn:hover {
  background: #c4941c;
}
.home-btn {
  background: #ffffff;
  color: #daa520;
  border:1px solid #daa520;
}
.home-btn:hover {
  background: #fff8e6;
}

.all-completed-hint {
  margin-top: 14px;
}


/* 提交反馈条：位于右侧答题框正下方，明确告知「提交中 / 成功 / 失败」 */
.submit-feedback {
  margin-top: 14px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
}
.submit-feedback.is-submitting {
  background: #e8f0fe;
  color: #1565c0;
  border: 1px solid #1565c0;
}
.submit-feedback.is-success {
  background: #e6f4ea;
  color: #1e7a2a;
  border: 1px solid #2a9d3a;
}
.submit-feedback.is-error {
  background: #fde2e2;
  color: #b42020;
  border: 1px solid #b42020;
}
.feedback-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #1565c0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 下一篇课文按钮 */
.next-lesson-btn {
  position: absolute;
  right: 70px;
  width: 580px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: background 0.3s;
}
.next-lesson-btn.gold-bg {
  background: #daa520;
  color: #fff;
}
.next-lesson-btn.gold-bg .btn-arrow-icon {
  filter: brightness(0) invert(1);
}
/* 答对（已通过）时底部按钮显示绿色 */
.next-lesson-btn.green-bg {
  background: #4caf50;
  color: #fff;
}
.next-lesson-btn.green-bg .btn-arrow-icon {
  filter: brightness(0) invert(1);
}
.btn-arrow-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>