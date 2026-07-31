<template>
  <div class="page-container">
    <!-- 顶部返回导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">寻找文化：写写感想</span>
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
      <!-- 数字人区域（未打开课文时显示） -->
      <div class="digital-human-area" v-if="currentPanel === 'human'">
        <img
          src="/image/小小_汉服 1.png"
          alt="数字人"
          class="digital-human-img"
        />
        <div class="human-talk-bubble" v-if="talkText">
          {{ talkText }}
          <span class="voice-icon" @click="playAudio(talkText)">🔊</span>
          <span class="bubble-arrow"></span>
        </div>

        <!-- 完成全部题目后：AI反馈信息对话框 -->
        <div class="completion-feedback-bubble" v-if="isAllCompleted">
          <div class="feedback-message">{{ completionMessage }}</div>
          <span class="bubble-arrow"></span>
        </div>
        <!-- 完成全部题目后：跳转按钮（宽度与对话框对齐） -->
        <div class="completion-action-bar" v-if="isAllCompleted">
          <button class="completion-action-btn report-btn" @click="goToReport">查看评价</button>
          <button class="completion-action-btn home-btn" @click="goHome">回到首页</button>
        </div>
      </div>

      <!-- 课文关闭按钮（在课文框外右上方，仅打开课文时显示） -->
      <div class="article-close-btn" v-if="currentPanel === 'lesson'" @click="closeArticle">×</div>

      <!-- 课文内容面板（打开课文时显示） -->
      <div class="article-panel" v-if="currentPanel === 'lesson'">
        <div class="article-content">
          <h3 class="article-title">{{ currentTabName }}</h3>
          <div class="article-body" v-html="currentArticleContent"></div>
        </div>
      </div>
    </div>

    <!-- 右侧答题容器（常驻显示） -->
    <div class="right-container">
      <div class="write-feel-modal">
        <!-- 已完成的题目答案（显示在上方） -->
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

        <!-- 当前活跃的题目（未完成的第一题） -->
        <div class="current-question-block" v-if="activeQuestionId">
          <h3 class="modal-title">
            {{ getQuestionName(activeQuestionId) }}
            <span class="voice-icon" @click="playAudio(getQuestionText(activeQuestionId))">🔊</span>
          </h3>

          <!-- 引导文字 -->
          <p class="guide-desc">
            {{ getQuestionText(activeQuestionId) }}
          </p>

          <!-- 当前题目的历史尝试记录 -->
          <div class="history-section" v-if="getHistoryRecords(activeQuestionId).length > 0">
            <div
              v-for="(record, idx) in getHistoryRecords(activeQuestionId)"
              :key="'history-' + idx"
              class="history-item"
            >
              <div class="history-answer" :class="{ 'history-wrong': !record.isCorrect }">
                <span class="answer-label">回答{{ idx + 1 }}：</span>{{ record.answer }}
              </div>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="input-wrapper">
            <div class="feel-input-box">
              <textarea
                v-model="userInput"
                class="feel-input"
                :class="{ 'input-invalid': currentSubmitStatus === 'wrong' }"
                placeholder="输入你的感想..."
              ></textarea>
              <div class="func-btn-group">
                <button
                  class="func-btn"
                  @click="handleVoice"
                  title="语音输入"
                >
                  <span class="func-icon">🎤语音</span>
                </button>
                <button
                  class="func-btn"
                  @click="handlePhoto"
                  title="拍照上传"
                >
                  <span class="func-icon">📷拍照</span>
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

            <!-- 错误提示 -->
            <div class="error-tip" v-if="currentSubmitStatus === 'wrong'">
              请重新输入。已尝试 {{ currentAttempts }}/3 次。
            </div>

          <!-- 参考答案（第3次不合格后显示） -->
          <div class="reference-answer" v-if="showReferenceAnswer">
            <div class="ref-label">参考答案：</div>
            <div class="ref-content">{{ referenceAnswer }}</div>
          </div>

          <!-- 提交按钮 -->
          <button
            class="submit-btn"
            :disabled="!canSubmit"
            @click="submitAnswer"
          >
            ⇧ 提交
          </button>
          </div>
        </div>

        <!-- 全部完成时的提示 -->
        <div class="all-completed-hint" v-if="isAllCompleted">
          <div class="completed-message">已完成所有题目！</div>
        </div>
      </div>
    </div>

    <!-- 完成三道题后的遮罩层（人物和答题框不被覆盖，z-index更高） -->
    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const photoInputRef = ref(null)

// ==================== 题目数据 ====================
const tabList = ref([
  { id: 'paper', name: '纸的发明' },
  { id: 'bridge', name: '赵州桥' },
  { id: 'painting', name: '一幅名扬中外的画' }
])

const articleContents = {
  paper: '《纸的发明》课文内容...',
  bridge: '《赵州桥》课文内容...',
  painting: '《一幅名扬中外的画》课文内容...'
}

const questionData = {
  paper: {
    question: '这三篇课文都写到了中华优秀传统文化的内容，在《纸的发明》里，是哪些方面让你自豪？',
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

// ==================== 状态管理 ====================
const currentTabId = ref('paper')
const currentPanel = ref('human') // 'human' | 'lesson'
const userInput = ref('')

// 每题尝试次数
const attemptsMap = reactive({ paper: 0, bridge: 0, painting: 0 })
// 每题是否已通过
const passedMap = reactive({ paper: false, bridge: false, painting: false })
// 历史记录
const historyRecordsMap = reactive({ paper: [], bridge: [], painting: [] })
// 参考答案显示
const showReferenceAnswerMap = reactive({ paper: false, bridge: false, painting: false })
// 学生实际输入记录
const studentInputsMap = reactive({ paper: [], bridge: [], painting: [] })

// 数字人对话
const talkText = ref('')
const conversationHistory = ref([]) // [{role:'human'|'student', text}]

// ==================== 计算属性 ====================
const currentTabName = computed(() => {
  const tab = tabList.value.find(t => t.id === currentTabId.value)
  return tab ? tab.name : ''
})

const currentArticleContent = computed(() => articleContents[currentTabId.value] || '')

// 当前活跃题目的相关信息（用于输入和显示）
const questionText = computed(() => activeQuestionId.value ? (questionData[activeQuestionId.value]?.question || '') : '')
const referenceAnswer = computed(() => activeQuestionId.value ? (questionData[activeQuestionId.value]?.referenceAnswer || '') : '')

const currentAttempts = computed(() => activeQuestionId.value ? attemptsMap[activeQuestionId.value] : 0)
const isCurrentCompleted = computed(() => activeQuestionId.value ? passedMap[activeQuestionId.value] : true)
const showReferenceAnswer = computed(() => activeQuestionId.value ? showReferenceAnswerMap[activeQuestionId.value] : false)

const historyRecords = computed(() => activeQuestionId.value ? (historyRecordsMap[activeQuestionId.value] || []) : [])

const currentSubmittedAnswer = computed(() => {
  if (!activeQuestionId.value) return ''
  const records = historyRecordsMap[activeQuestionId.value] || []
  if (records.length > 0) {
    return records[records.length - 1].answer
  }
  return ''
})

const currentSubmitStatus = computed(() => {
  if (!activeQuestionId.value) return ''
  const records = historyRecordsMap[activeQuestionId.value] || []
  if (records.length > 0) {
    return records[records.length - 1].isCorrect ? 'correct' : 'wrong'
  }
  return ''
})

const lastSubmitStatus = computed(() => {
  if (!activeQuestionId.value) return ''
  const records = historyRecordsMap[activeQuestionId.value] || []
  if (records.length > 0) {
    return records[records.length - 1].isCorrect ? 'correct' : 'wrong'
  }
  return ''
})

const canSubmit = computed(() => {
  return !!userInput.value.trim() && activeQuestionId.value && !isCurrentCompleted.value
})

const isAllCompleted = computed(() => {
  return tabList.value.every(t => passedMap[t.id])
})

const completionMessage = computed(() => {
  return conversationHistory.value.filter(c => c.role === 'student').map(c => c.text).join('\n')
})

// 获取当前活跃的题目（第一个未完成的）
const activeQuestionId = computed(() => {
  for (let i = 0; i < tabList.value.length; i++) {
    if (!passedMap[tabList.value[i].id]) {
      return tabList.value[i].id
    }
  }
  return null // 全部完成
})

// 获取已完成的题目列表（用于显示历史答题记录）
const completedQuestions = computed(() => {
  return tabList.value.filter(t => passedMap[t.id] && historyRecordsMap[t.id]?.length > 0)
})

// ==================== 导航样式 ====================
const getTabClass = (tabId) => {
  const idx = tabList.value.findIndex(t => t.id === tabId)
  const isActive = tabId === currentTabId.value
  const isPassed = passedMap[tabId]
  const isLocked = !isPassed && idx > getFirstUnpassedIndex()

  return {
    'tab-active': isActive && !isLocked,
    'tab-passed': isPassed,
    'tab-locked': isLocked,
    'tab-unlocked': !isLocked && !isActive
  }
}

const getFirstUnpassedIndex = () => {
  for (let i = 0; i < tabList.value.length; i++) {
    if (!passedMap[tabList.value[i].id]) return i
  }
  return tabList.value.length
}

// ==================== 辅助函数（获取题目信息） ====================
const getQuestionName = (tabId) => {
  const tab = tabList.value.find(t => t.id === tabId)
  return tab ? tab.name : ''
}

const getQuestionText = (tabId) => {
  return questionData[tabId]?.question || ''
}

const getHistoryRecords = (tabId) => {
  return historyRecordsMap[tabId] || []
}

const getCorrectAnswer = (tabId) => {
  const records = historyRecordsMap[tabId] || []
  const correctRecord = records.find(r => r.isCorrect)
  return correctRecord ? correctRecord.answer : (records.length > 0 ? records[records.length - 1].answer : '')
}

// ==================== 标签点击 ====================
const handleTabClick = (tabId) => {
  const idx = tabList.value.findIndex(t => t.id === tabId)
  const firstUnpassedIdx = getFirstUnpassedIndex()

  if (idx > firstUnpassedIdx) return // 锁定，不可点击

  if (tabId === currentTabId.value) {
    // 点击当前标签，打开课文（左侧切换为课文面板）
    openArticle()
  } else {
    switchToTab(tabId)
  }
}

const switchToTab = (tabId) => {
  currentTabId.value = tabId
  userInput.value = ''
  currentPanel.value = 'human'
  loadTabContent(tabId)
}

// ==================== 课文面板控制 ====================
const openArticle = () => {
  currentPanel.value = 'lesson'
}

const closeArticle = () => {
  currentPanel.value = 'human'
  // 数字人播报引导语音
  playAudio(questionText.value)
}

// ==================== 音频播放 ====================
let audioContext = null
const playAudio = (text) => {
  console.log('播放语音:', text)
}

// ==================== 数据初始化 ====================
const fetchTalkText = async () => {
  talkText.value = '亲爱的同学，来写写你的感想吧，分享你对中华优秀传统文化的感悟。'
}

// ==================== 答案验证（模拟逻辑） ====================
const validateAnswer = async (answer, articleId) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ isCorrect: answer.trim().length >= 10, feedback: '模拟验证完成' })
    }, 500)
  })
}

const submitStudentInput = async (answer, articleId, attempt) => {
  studentInputsMap[articleId].push({ answer, attempt, time: Date.now() })
}

const recognizeOCR = async (file) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('OCR识别结果（请手动修改）')
    }, 800)
  })
}

// ==================== 提交答案 ====================
const submitAnswer = async () => {
  if (!userInput.value.trim()) return

  const articleId = activeQuestionId.value
  if (!articleId) return

  attemptsMap[articleId]++

  // 记录学生输入
  submitStudentInput(userInput.value, articleId, attemptsMap[articleId])

  // 验证答案
  const result = await validateAnswer(userInput.value, articleId)
  const isCorrect = result.isCorrect

  // 记录历史
  const records = historyRecordsMap[articleId]
  records.push({
    question: questionData[articleId].question,
    answer: userInput.value,
    isCorrect
  })

  conversationHistory.value.push({
    role: 'student',
    text: userInput.value
  })

  if (isCorrect) {
    passedMap[articleId] = true
    // 清空输入框，布局会自动显示下一题
    userInput.value = ''
  } else {
    if (attemptsMap[articleId] >= 3) {
      // 3次不合格，显示参考答案，标记为完成
      showReferenceAnswerMap[articleId] = true
      passedMap[articleId] = true
      // 清空输入框
      userInput.value = ''
    }
  }
}

// ==================== 功能按钮 ====================
const handleVoice = () => {
  console.log('语音输入')
}

const handlePhoto = () => {
  if (photoInputRef.value) {
    photoInputRef.value.click()
  }
}

const onPhotoCapture = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const ocrResult = await recognizeOCR(file)
  userInput.value = ocrResult

  // 清空input以便下次选择同一文件
  event.target.value = ''
}

// ==================== 加载题目内容 ====================
const loadTabContent = (tabId) => {
  // 重置输入状态
  userInput.value = ''
}

// ==================== 路由跳转 ====================
const goBack = () => router.push('/')

const goToReport = () => {
  router.push('/report')
}

const goHome = () => {
  router.push('/')
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await fetchTalkText()
  // 首次进入自动播放
  setTimeout(() => {
    playAudio(talkText.value)
  }, 500)
})
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  background: url('/image 110.png') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

/* 顶部导航栏 */
.top-nav {
  position: absolute;
  top: 30px;
  left: 30px;
  right: 30px;
  height: 54px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 25px;
  background: rgba(35, 25, 16, 0.45);
  border-radius: 12px;
  color: #ffffff;
  font-size: 18px;
  z-index: 10;
}
.back-icon {
  font-size: 22px;
  cursor: pointer;
}

/* 顶部标签栏 */
.tab-wrapper {
  position: absolute;
  top: 110px;
  left: 40px;
  display: flex;
  align-items: center;
  background: rgba(240, 239, 238, 0.3);
  border-radius: 12px;
  border: 1px solid rgb(250, 248, 247, 0.5);
  padding: 6px 14px;
  gap: 8px;
  z-index: 10;
}
.tab-item {
  padding: 8px 22px;
  height: 38px;
  background: #ffffff;
  border-radius: 20px;
  font-size: 16px;
  line-height: 20px;
  color: #333;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: all 0.2s;
}
.tab-item.tab-active {
  background: #f7c846;
  color: #fff;
  border-color: #f7c846;
}
.tab-item.tab-passed {
  background: #f7c846;
  color: #fff;
  border-color: #f7c846;
}
.tab-item.tab-locked {
  background: #d0d0d0;
  color: #666;
  border-color: #c5c5c5;
  cursor: not-allowed;
}
.tab-item.tab-unlocked {
  background: #fff;
  color: #333;
  border-color: #ddd;
}

/* 左侧区域 */
.left-area {
  position: absolute;
  top: 170px;
  left: 40px;
  bottom: 20px;
  width: 500px;
  z-index: 5;
}

/* 课文关闭按钮（在课文框外右上方） */
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}
.article-close-btn:hover {
  transform: scale(1.1);
}

/* 数字人区域 */
.digital-human-area {
  position: absolute;
  left: 80px;
  bottom: 20px;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));
}
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
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
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
.voice-icon {
  font-size: 16px;
  cursor: pointer;
  margin-left: 6px;
}

/* 课文面板 */
.article-panel {
  width: 700px;
  height: 600px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  padding: 20px 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
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
.panel-actions {
  margin-top: 12px;
  text-align: right;
}
.panel-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.close-btn {
  background: #3668e8;
  color: #fff;
}

/* 右侧容器（常驻答题框） */
.right-container {
  position: absolute;
  top: 170px;
  right: 30px;
  width: 580px;
  z-index: 10;
}

/* 已完成题目的答案块 */
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

/* 当前活跃题目块 */
.current-question-block {
  margin-top: 10px;
}

/* 全部完成提示 */
.all-completed-hint {
  text-align: center;
  padding: 20px;
}
.completed-message {
  font-size: 16px;
  color: #2a9d3a;
  font-weight: 600;
}

.write-feel-modal {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 24px 26px 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #111;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.guide-desc {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 14px;
}

/* 历史记录（无背景色，遵守项目记忆规则） */
.history-section {
  margin-bottom: 14px;
  padding-top: 10px;
  border-top: 1px dashed #e0e0e0;
}
.history-item {
  margin-bottom: 10px;
  font-size: 14px;
}
.answer-label {
  color: #888;
  font-weight: 500;
}
.history-answer {
  color: #333;
  margin-bottom: 4px;
}
.history-wrong {
  color: #b42020;
}
.history-status {
  font-size: 13px;
  font-weight: 600;
}
.history-status.correct {
  color: #2a9d3a;
}
.history-status.wrong {
  color: #d97706;
}

/* 提交答案显示 */
.submitted-answer {
  margin-bottom: 14px;
}
.answer-box {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
}
.answer-correct {
  background: #2a9d3a;
  color: #fff;
  border: 1px solid #2a7d30;
}
.answer-wrong {
  background: #fde2e2;
  color: #b42020;
  border: 1px solid #d32f2f;
}

/* 输入区 */
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
  box-shadow: 0 0 10px rgba(4, 111, 232, 0.25);
  border-radius: 14px;
  padding: 14px 60px 14px 14px;
  font-size: 16px;
  resize: none;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.3s, background 0.3s;
  box-sizing: border-box;
}
.feel-input.input-invalid {
  border-color: #d32f2f;
  background: #fff5f5;
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

/* 错误提示 */
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

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 52px;
  background: #2a53b8;
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  transition: all 0.25s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(42, 83, 184, 0.4);
}
.submit-btn:disabled {
  background: #b8b8b8;
  color: #fff;
  cursor: not-allowed;
}

/* 已完成显示 */
.completed-display {
  margin-top: 14px;
}
.completed-answer {
  padding: 10px 14px;
  border-radius: 10px;
  background: #f0f0f0;
  color: #333;
  font-size: 14px;
}
.completed-answer.answer-correct {
  background: #2a9d3a;
  color: #fff;
}

/* 完成遮罩层（在人物和答题框之下，背景层之上） */
.completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
}

/* AI反馈信息对话框（在人物说话框下方，宽度=说话框宽度） */
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
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.completion-feedback-bubble .feedback-message {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0;
}
/* 完成全部题目后跳转按钮栏（宽度与对话框300px对齐） */
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
</style>
