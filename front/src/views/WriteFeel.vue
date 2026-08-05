<template>
  <div class="page-container" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">寻找文化：写写感想</span>
      <div class="top-nav-buttons">
        <div class="nav-btn" @click="mockVoice">
          <img src="/image/语音 1.png" alt="语音播报" class="btn-icon" />
          开启语音
        </div>
        <div class="nav-btn" @click="mockVideo">
          <img src="/image/视频 2.png" alt="回看视频" class="btn-icon" />
          回看视频
        </div>
      </div>
    </div>

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
      <div class="digital-human-area" v-if="currentPanel === 'human'">
        <img
          src="/image/小小_汉服 1.png"
          alt="数字人"
          class="digital-human-img"
        />
        <div
          class="human-talk-bubble"
          :class="{ expanded: isBubbleExpanded }"
          v-if="talkText"
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

        <div class="completion-feedback-bubble" v-if="isAllCompleted">
          <div class="feedback-message">{{ completionMessage }}</div>
          <span class="bubble-arrow"></span>
        </div>
        <div class="completion-action-bar" v-if="isAllCompleted">
          <button class="completion-action-btn report-btn" @click="goToReport">查看评价</button>
          <button class="completion-action-btn home-btn" @click="goHome">回到首页</button>
        </div>
      </div>

      <div class="article-close-btn" v-if="currentPanel === 'lesson'" @click="closeArticle">×</div>

      <div class="article-panel" v-if="currentPanel === 'lesson'">
        <div class="article-content">
          <h3 class="article-title">{{ currentTabName }}</h3>
          <div class="article-body" v-html="currentArticleContent"></div>
        </div>
      </div>
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
          <h3 class="question-title">{{ question.name }}</h3>
          <div class="submitted-answer">
            <div class="answer-box answer-correct">
              {{ getCorrectAnswer(question.id) }}
            </div>
          </div>
        </div>

        <!-- 当前题目 -->
        <div class="current-question-block" v-if="activeQuestionId">
          <h3 class="question-title">{{ getQuestionName(activeQuestionId) }}</h3>

          <!-- 历史回答记录（含不合格红色答案） -->
          <div class="history-section" v-if="getHistoryRecords(activeQuestionId).length > 0">
            <div
              v-for="(record, idx) in getHistoryRecords(activeQuestionId)"
              :key="'history-' + idx"
              class="history-item"
            >
              <div
                class="history-answer-box"
                :class="record.isCorrect ? 'answer-correct' : 'answer-wrong'"
              >
                <span class="answer-label">回答{{ idx + 1 }}：</span>{{ record.answer }}
              </div>
            </div>
          </div>

          <div class="input-wrapper">
            <div class="feel-input-box">
              <textarea
                class="feel-input"
                v-model="userInput"
                :class="{
                  'input-invalid': currentSubmitStatus === 'wrong',
                  'has-content': userInput.trim(),
                  'text-red': currentSubmitStatus === 'wrong'
                }"
                placeholder="输入你的感想..."
              ></textarea>
              <div class="func-btn-group">
                <button class="func-btn" @click="handleVoice">
                  <img src="/image/矢量 62.png" alt="语音" class="func-icon-img" />
                  <span class="func-text">语音</span>
                </button>
                <button class="func-btn" @click="handlePhoto">
                  <img src="/image/矢量 65.png" alt="拍照" class="func-icon-img" />
                  <span class="func-text">拍照</span>
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
            </div>

            <div class="error-tip" v-if="currentSubmitStatus === 'wrong'">
              请重新输入。已尝试 {{ currentAttempts }}/3 次。
            </div>

            <div class="reference-answer" v-if="showReferenceAnswer">
              <div class="ref-label">参考答案：</div>
              <div class="ref-content">{{ referenceAnswer }}</div>
            </div>
          </div>
        </div>

        <div class="all-completed-hint" v-if="isAllCompleted">
          <div class="completed-message">已完成所有题目！</div>
        </div>
      </div>
    </div>

    <!-- 下一篇课文按钮 -->
    <div
      class="next-lesson-btn"
      :class="{ 'gold-bg': userInput.trim() }"
      :style="{ top: nextBtnTop + 'px' }"
      @click="handleNextLesson"
    >
      <img src="/image/矢量 67.png" alt="箭头" class="btn-arrow-icon" />
      下一篇课文
    </div>

    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const photoInputRef = ref<HTMLInputElement | null>(null)
const rightContainerRef = ref<HTMLElement | null>(null)

// ========== 自适应缩放 ==========
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

const pageStyle = ref({
  transform: 'scale(1)',
  transformOrigin: 'top left',
  width: DESIGN_WIDTH + 'px',
  height: DESIGN_HEIGHT + 'px',
  marginLeft: '0px',
  marginTop: '0px'
})

const updateScale = () => {
  const scaleX = window.innerWidth / DESIGN_WIDTH
  const scaleY = window.innerHeight / DESIGN_HEIGHT
  pageStyle.value = {
    transform: `scale(${scaleX}, ${scaleY})`,
    transformOrigin: 'top left',
    width: DESIGN_WIDTH + 'px',
    height: DESIGN_HEIGHT + 'px',
    marginLeft: '0px',
    marginTop: '0px'
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

// ========== 首次自动播放标记 ==========
const hasAutoPlayed = ref(false)

// ========== 数据定义 ==========
const tabList = ref([
  { id: 'paper', name: '纸的发明' },
  { id: 'bridge', name: '赵州桥' },
  { id: 'painting', name: '一幅名扬中外的画' }
])

const articleContents: Record<string, string> = {
  paper: '《纸的发明》课文内容...',
  bridge: '《赵州桥》课文内容...',
  painting: '《一幅名扬中外的画》课文内容...'
}

const questionData: Record<string, { question: string; referenceAnswer: string }> = {
  paper: {
    question: '在《纸的发明》中，是哪些让你感到自豪？',
    referenceAnswer: '纸的发明体现了古代劳动人民的智慧，蔡伦改进造纸术，促进了文化的传播和发展。'
  },
  bridge: {
    question: '在《赵州桥》里，哪些方面让你感到自豪？',
    referenceAnswer: '赵州桥的建造技艺、设计美观、坚固耐用，体现了古代工匠的杰出智慧。'
  },
  painting: {
    question: '《一幅名扬中外的画》哪些细节让你感到自豪？',
    referenceAnswer: '《清明上河图》描绘了北宋都城的繁华景象，画中人物众多、细节丰富，体现了高超的绘画技艺。'
  }
}

const currentTabId = ref('paper')
const currentPanel = ref<'human' | 'lesson'>('human')
const userInput = ref('')

const attemptsMap = reactive<Record<string, number>>({ paper: 0, bridge: 0, painting: 0 })
const passedMap = reactive<Record<string, boolean>>({ paper: false, bridge: false, painting: false })
const historyRecordsMap = reactive<Record<string, Array<{ question: string; answer: string; isCorrect: boolean }>>>({
  paper: [],
  bridge: [],
  painting: []
})
const showReferenceAnswerMap = reactive<Record<string, boolean>>({ paper: false, bridge: false, painting: false })
const studentInputsMap = reactive<Record<string, Array<{ answer: string; attempt: number; time: number }>>>({
  paper: [],
  bridge: [],
  painting: []
})

const talkText = ref('')
const conversationHistory = ref<Array<{ role: string; text: string }>>([])

// ========== 引导文字（固定） ==========
const currentGuideText = '这三篇课文都写到了中华优秀传统文化的内容，在《纸的发明》里，是哪些方面让你自豪？《赵州桥》《一幅名扬中外的画》又分别是哪些方面让你自豪？请把特别让你自豪的这些方面写下来，记得都要能够联系相应的课文内容和生活实际。'

// ========== 计算属性 ==========
const currentTabName = computed(() => {
  const tab = tabList.value.find(t => t.id === currentTabId.value)
  return tab ? tab.name : ''
})

const currentArticleContent = computed(() => articleContents[currentTabId.value] || '')

const referenceAnswer = computed(() =>
  activeQuestionId.value ? (questionData[activeQuestionId.value]?.referenceAnswer || '') : ''
)

const currentAttempts = computed(() =>
  activeQuestionId.value ? attemptsMap[activeQuestionId.value] : 0
)

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

const isAllCompleted = computed(() => tabList.value.every(t => passedMap[t.id]))

const completionMessage = computed(() =>
  conversationHistory.value
    .filter(c => c.role === 'student')
    .map(c => c.text)
    .join('\n')
)

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

const getQuestionText = (tabId: string) => questionData[tabId]?.question || ''

const getHistoryRecords = (tabId: string) => historyRecordsMap[tabId] || []

const getCorrectAnswer = (tabId: string) => {
  const records = historyRecordsMap[tabId] || []
  const correctRecord = records.find(r => r.isCorrect)
  return correctRecord
    ? correctRecord.answer
    : records.length > 0
      ? records[records.length - 1].answer
      : ''
}

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
  saveState()
}

const openArticle = () => {
  currentPanel.value = 'lesson'
}

const closeArticle = () => {
  currentPanel.value = 'human'
}

// ========== 音频播放（接口预留） ==========
const playAudio = (text: string) => {
  // TODO: 接入真实TTS接口
  console.log('播放语音:', text)
}

const playBubbleAudio = () => {
  // 展开气泡并播放
  isBubbleExpanded.value = true
  if (talkText.value) {
    playAudio(talkText.value)
  }
}

// 监听talkText变化，自动折叠旧气泡
watch(talkText, () => {
  isBubbleExpanded.value = false
  // 更新气泡后重算按钮位置
  updateNextBtnPosition()
})

// ========== 模拟功能 ==========
const mockVoice = () => console.log('模拟开启语音')
const mockVideo = () => console.log('模拟回看视频')

const fetchTalkText = async (articleId: string): Promise<string> => {
  // TODO: 接入真实接口获取数字人话术
  const texts: Record<string, string> = {
    paper: '亲爱的同学，请你来写写感想，分享你对《纸的发明》中让你感到自豪的方面吧。',
    bridge: '很好！接下来看看《赵州桥》，说说哪些方面让你感到自豪？',
    painting: '太棒了！最后来看看《一幅名扬中外的画》，哪些细节让你感到自豪呢？'
  }
  return texts[articleId] || '来写写你的感想吧，分享你对中华优秀传统文化的感悟。'
}

const validateAnswer = async (
  answer: string,
  articleId: string
): Promise<{ isCorrect: boolean; feedback: string }> => {
  // TODO: 接入真实AI评判接口
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        isCorrect: answer.trim().length >= 10,
        feedback: answer.trim().length >= 10 ? '回答合格' : '回答不够详细，请再补充'
      })
    }, 500)
  })
}

const recognizeOCR = async (file: File): Promise<string> => {
  // TODO: 接入真实OCR接口
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('OCR识别结果（请手动修改）')
    }, 800)
  })
}

// ========== 提交答案 ==========
const submitAnswer = async () => {
  if (!userInput.value.trim()) return

  const articleId = activeQuestionId.value
  if (!articleId) return

  attemptsMap[articleId]++
  const currentAttempt = attemptsMap[articleId]

  // 记录学生实际输入
  studentInputsMap[articleId].push({
    answer: userInput.value,
    attempt: currentAttempt,
    time: Date.now()
  })

  const result = await validateAnswer(userInput.value, articleId)
  const isCorrect = result.isCorrect

  // 记录历史
  historyRecordsMap[articleId].push({
    question: questionData[articleId].question,
    answer: userInput.value,
    isCorrect
  })

  conversationHistory.value.push({
    role: 'student',
    text: userInput.value
  })

  if (isCorrect) {
    // 合格：绿色背景
    passedMap[articleId] = true
    userInput.value = ''
    showReferenceAnswerMap[articleId] = false
    saveState()
    // 自动打开下一篇课文
    autoAdvanceToNext()
  } else {
    // 不合格：关闭课文，显示数字人，播报提示
    currentPanel.value = 'human'
    const errorMsg = '这次的回答还没有符合要求，请再仔细想一想。'
    talkText.value = errorMsg
    playAudio(errorMsg)

    if (currentAttempt >= 3) {
      // 3次不合格：显示参考答案，自动通过
      showReferenceAnswerMap[articleId] = true
      passedMap[articleId] = true
      userInput.value = ''
      saveState()
      autoAdvanceToNext()
    } else {
      saveState()
    }
  }
  updateNextBtnPosition()
}

// ========== 自动推进到下一篇课文 ==========
const autoAdvanceToNext = () => {
  const nextId = activeQuestionId.value
  if (nextId) {
    currentTabId.value = nextId
    // 获取新的数字人话术
    fetchTalkText(nextId).then(text => {
      talkText.value = text
      updateNextBtnPosition()
    })
  }
  if (isAllCompleted.value) {
    talkText.value = '恭喜你完成了所有题目！'
    updateNextBtnPosition()
  }
}

// ========== 下一篇课文按钮 ==========
const handleNextLesson = () => {
  if (!activeQuestionId.value) return
  if (!passedMap[activeQuestionId.value]) {
    // 当前题未完成，触发提交
    submitAnswer()
  }
}

// ========== 语音/拍照 ==========
const handleVoice = () => {
  // TODO: 接入语音输入接口
  console.log('语音输入')
}

const handlePhoto = () => {
  if (photoInputRef.value) {
    photoInputRef.value.click()
  }
}

const onPhotoCapture = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const ocrResult = await recognizeOCR(file)
  userInput.value = ocrResult
  target.value = ''
}

// ========== 状态持久化 ==========
const STORAGE_KEY = 'write-feel-state'

const saveState = () => {
  const state = {
    currentTabId: currentTabId.value,
    currentPanel: currentPanel.value,
    userInput: userInput.value,
    attemptsMap: { ...attemptsMap },
    passedMap: { ...passedMap },
    historyRecordsMap: JSON.parse(JSON.stringify(historyRecordsMap)),
    showReferenceAnswerMap: { ...showReferenceAnswerMap },
    studentInputsMap: JSON.parse(JSON.stringify(studentInputsMap)),
    talkText: talkText.value,
    conversationHistory: JSON.parse(JSON.stringify(conversationHistory.value)),
    hasAutoPlayed: hasAutoPlayed.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const restoreState = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return false
  try {
    const state = JSON.parse(saved)
    currentTabId.value = state.currentTabId || 'paper'
    currentPanel.value = state.currentPanel || 'human'
    userInput.value = state.userInput || ''
    Object.assign(attemptsMap, state.attemptsMap || { paper: 0, bridge: 0, painting: 0 })
    Object.assign(passedMap, state.passedMap || { paper: false, bridge: false, painting: false })
    Object.assign(historyRecordsMap, state.historyRecordsMap || { paper: [], bridge: [], painting: [] })
    Object.assign(showReferenceAnswerMap, state.showReferenceAnswerMap || { paper: false, bridge: false, painting: false })
    Object.assign(studentInputsMap, state.studentInputsMap || { paper: [], bridge: [], painting: [] })
    talkText.value = state.talkText || ''
    conversationHistory.value = state.conversationHistory || []
    hasAutoPlayed.value = state.hasAutoPlayed || false
    return true
  } catch {
    return false
  }
}

// ========== 导航 ==========
const goBack = () => {
  saveState()
  router.push('/')
}

const goToReport = () => router.push('/report')
const goHome = () => {
  saveState()
  router.push('/')
}

// ========== 监听输入变化，实时保存 ==========
watch(userInput, () => {
  saveState()
  updateNextBtnPosition()
})

// 监听面板内容变化，更新按钮位置
watch([currentPanel, () => historyRecordsMap[activeQuestionId.value || 'paper']?.length], () => {
  updateNextBtnPosition()
}, { deep: true })

// ========== 生命周期 ==========
onMounted(async () => {
  updateScale()
  window.addEventListener('resize', updateScale)

  const restored = restoreState()

  if (!restored) {
    // 全新状态：初始化第一篇课文
    const firstId = tabList.value[0].id
    const text = await fetchTalkText(firstId)
    talkText.value = text
    // 首次自动播放文字和音频
    setTimeout(() => {
      playAudio(text)
    }, 500)
    hasAutoPlayed.value = true
    saveState()
  } else if (!hasAutoPlayed.value && talkText.value) {
    // 恢复的状态但未自动播放过
    setTimeout(() => {
      playAudio(talkText.value)
    }, 500)
    hasAutoPlayed.value = true
    saveState()
  }

  updateNextBtnPosition()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  saveState()
})
</script>

<style scoped>
.page-container {
  width: 1920px;
  height: 1080px;
  background: url('/image/image 110.png') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

/* ========== 顶部导航 ========== */
.top-nav {
  position: absolute;
  top: 30px;
  left: 60px;
  right: 60px;
  height: 65px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 25px;
  background: rgba(245, 244, 243, 0.45);
  border-radius: 12px;
  color: #4e1b05ed;
  font-weight: 900;
  font-size: 25px;
  z-index: 10;
}
.back-icon {
  font-size: 22px;
  cursor: pointer;
}
.top-nav-buttons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}
.nav-btn {
  width: 120px;
  height: 35px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgb(220, 137, 29);
  color: #fff;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 300;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(118, 117, 117, 0.647);
  cursor: pointer;
}
.btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* ========== 课文标签 ========== */
.tab-wrapper {
  position: absolute;
  top: 110px;
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
  width: 500px;
  z-index: 5;
}
.article-close-btn {
  position: absolute;
  top: -50px;
  right: -200px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  text-align: center;
  line-height: 32px;
  font-size: 18px;
  cursor: pointer;
  z-index: 6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}
.article-close-btn:hover {
  transform: scale(1.1);
}

/* 数字人 */
.digital-human-area {
  position: absolute;
  left: 80px;
  bottom: 20px;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}

/* 气泡 */
.human-talk-bubble {
  position: absolute;
  left: 190px;
  top: 20px;
  width: 300px;
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
  max-height: 72px; /* 3行 */
  overflow: hidden;
  transition: max-height 0.3s ease;
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

/* 课文面板 */
.article-panel {
  width: 700px;
  height: 600px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 20px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.article-content {
  flex: 1;
}
.article-title {
  font-size: 20px;
  margin: 0 0 12px;
  color: #333;
}
.article-body {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
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
  color: #2a53b8;
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
  border: 1.5px solid #b8c8f0;
  border-radius: 14px;
  padding: 14px 60px 14px 14px;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.3s, color 0.3s;
  box-sizing: border-box;
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

.error-tip {
  margin-top: 8px;
  color: #d32f2f;
  font-size: 13px;
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
  position: absolute;
  left: 190px;
  top: 100px;
  width: 300px;
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
  position: absolute;
  left: 190px;
  top: 280px;
  width: 300px;
  display: flex;
  gap: 12px;
}
.completion-action-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.report-btn {
  background: #2a53b8;
  color: #fff;
}
.report-btn:hover {
  background: #1e3d8f;
}
.home-btn {
  background: #f7c846;
  color: #fff;
}
.home-btn:hover {
  background: #e5b535;
}

.all-completed-hint {
  margin-top: 14px;
}
.completed-message {
  font-size: 16px;
  color: #2a9d3a;
  font-weight: 600;
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
.btn-arrow-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>