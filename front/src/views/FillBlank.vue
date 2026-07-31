<template>
  <div class="page-container">
    <!-- 顶部返回导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">‹</span>
      <span class="nav-title">寻找文化：初步感悟</span>
    </div>

    <!-- 数字人区域 -->
    <div class="digital-human-area">
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

      <!-- 填空输入区域：在人物对话框下方 -->
      <div class="blank-input-panel" v-if="showInputModal">
        <!-- 第一行：输入框 + 确定/取消 -->
        <div class="input-row">
          <input
            type="text"
            class="input-field"
            :class="{ 'input-error': modalError }"
            v-model="tempInput"
            placeholder="请输入"
            ref="modalInputRef"
            @keyup.enter="confirmInput"
          />
          <div class="input-btns">
            <button class="panel-btn cancel-btn" @click="closeInputModal">取消</button>
            <button class="panel-btn confirm-btn" @click="confirmInput">确定</button>
          </div>
        </div>
        <!-- 第二行：软键盘（左对齐，宽度可大于上方） -->
        <div class="keyboard">
          <div class="kb-row" v-for="(row, rIdx) in keyboardLayout" :key="rIdx">
            <span
              v-for="key in row"
              :key="key"
              class="kb-key"
              :class="{ 'kb-wide': key === 'Space' }"
              @click="pressKey(key)"
            >{{ key === 'Space' ? '空格' : key }}</span>
          </div>
        </div>
      </div>

      <!-- 完成全部填空后：AI反馈信息对话框 -->
      <div class="completion-feedback-bubble" v-if="isAllCompleted">
        <div class="feedback-message">{{ completionMessage }}</div>
        <span class="bubble-arrow"></span>
      </div>
      <!-- 完成全部填空后：跳转按钮 -->
      <div class="completion-action-bar" v-if="isAllCompleted">
        <button class="completion-action-btn report-btn" @click="goToReport">查看评价</button>
        <button class="completion-action-btn home-btn" @click="goHome">回到首页</button>
      </div>
    </div>

    <!-- 课文标签切换 -->
    <div class="tab-wrapper">
      <div
        v-for="tab in tabList"
        :key="tab.id"
        class="tab-item"
        :class="getTabClass(tab.id)"
        @click="openArticle(tab.id)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 右侧答题容器 -->
    <div class="right-container">
      <div class="write-feel-modal">
        <!-- 已完成的题目（显示在上方） -->
        <div
          v-for="(question, qIdx) in completedQuestions"
          :key="'completed-' + question.id"
          class="completed-question-block"
        >
          <h3 class="question-title">{{ question.name }}</h3>
          <div class="guide-desc" v-html="question.renderedHTML"></div>
        </div>

        <!-- 当前活跃的题目 -->
        <div class="current-question-block" v-if="activeQuestionId">
          <h3 class="modal-title">
            {{ getQuestionName(activeQuestionId) }}
            <span class="voice-icon" @click="playAudio(getQuestionHelp(activeQuestionId))">🔊</span>
          </h3>

          <div class="guide-desc">
            <template v-if="activeQuestionId === 'bridge'">
              一、在《赵州桥》的课文中<br>
              作者详细介绍了桥面
              <span
                v-for="(blank, bIdx) in questions[0].blanks"
                :key="'b-' + bIdx"
              >
                <span
                  class="blank-slot"
                  :class="getBlankClass('bridge', bIdx)"
                  :title="isBlankClickable('bridge', bIdx) ? '点击填写' : '尚未解锁'"
                  @click="onBlankClick('bridge', bIdx)"
                >
                  {{ getBlankDisplay('bridge', bIdx) }}
                </span>
                <span v-if="getBlankSeparator('bridge', bIdx)">{{ getBlankSeparator('bridge', bIdx) }}</span>
              </span>
              写得清清楚楚。
            </template>

            <template v-else-if="activeQuestionId === 'painting'">
              二、在《一幅名扬中外的画》的课文中<br>
              作者详细介绍了画上的
              <span
                v-for="(blank, bIdx) in questions[1].blanks"
                :key="'b-' + bIdx"
              >
                <span
                  class="blank-slot"
                  :class="getBlankClass('painting', bIdx)"
                  :title="isBlankClickable('painting', bIdx) ? '点击填写' : '尚未解锁'"
                  @click="onBlankClick('painting', bIdx)"
                >
                  {{ getBlankDisplay('painting', bIdx) }}
                </span>
                <span v-if="getBlankSeparator('painting', bIdx)">{{ getBlankSeparator('painting', bIdx) }}</span>
              </span>
              写得清清楚楚。
            </template>
          </div>
        </div>

        <!-- 全部完成提示 -->
        <div class="all-completed-hint" v-if="isAllCompleted">
          <div class="completed-message">已完成所有填空！</div>
        </div>
      </div>
    </div>

    <!-- 完成所有填空后的遮罩层 -->
    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const modalInputRef = ref(null)

// ==================== 题目数据 ====================
const questions = ref([
  {
    id: 'bridge',
    name: '赵州桥',
    helpText: '仔细阅读课文，找到作者描写赵州桥的关键词。桥面的结构、桥洞的设计，都是围绕"写清楚"展开的。',
    completionText: '完成《赵州桥》填空！你已掌握围绕一个意思把段落写清楚的方法。',
    blanks: [
      { idx: 0, correct: '结构特点', separator: '、桥洞的' },
      { idx: 1, correct: '设计原理', separator: '，把每种' },
      { idx: 2, correct: '造型', separator: '的' },
      { idx: 3, correct: '美观', separator: '' },
      { idx: 4, correct: '坚固', separator: '' }
    ]
  },
  {
    id: 'painting',
    name: '一幅名扬中外的画',
    helpText: '课文中作者介绍了画上的人物、场景，以及画面的内容和细节。仔细回忆课文内容再尝试一次吧！',
    completionText: '完成《一幅名扬中外的画》填空！你已体会到作者如何把画面描写得清清楚楚。',
    blanks: [
      { idx: 0, correct: '人物', separator: '、' },
      { idx: 1, correct: '场景', separator: '，把画面的' },
      { idx: 2, correct: '内容', separator: '和' },
      { idx: 3, correct: '细节', separator: '' }
    ]
  }
])

// 填空状态：pending / correct / auto-filled
const blankStatus = reactive({})
// 每题的当前填到第几空
const currentBlankIdx = reactive({ bridge: 0, painting: 0 })
// 每题的填空尝试次数
const blankAttempts = reactive({ bridge: {}, painting: {} })

questions.value.forEach(q => {
  blankStatus[q.id] = q.blanks.map(() => 'pending')
  blankAttempts[q.id] = {}
  q.blanks.forEach(b => { blankAttempts[q.id][b.idx] = 0 })
})

// 当前题目状态
const activeQuestionId = ref('bridge')
const completedQuestions = ref([])

const tabList = computed(() => questions.value.map(q => ({ id: q.id, name: q.name })))

// 当前活跃的题目（第一个未完成的）
const activeQuestion = computed(() => {
  for (let i = 0; i < questions.value.length; i++) {
    if (!isQuestionCompleted(questions.value[i].id)) {
      return questions.value[i].id
    }
  }
  return null
})

const isAllCompleted = computed(() => {
  return questions.value.every(q => isQuestionCompleted(q.id))
})

const completionMessage = computed(() => {
  return completedQuestions.value.map(q => q.completionText).join('\n')
})

// 检查单个题目是否完成
function isQuestionCompleted(qid) {
  const q = questions.value.find(q => q.id === qid)
  if (!q) return false
  return blankStatus[qid].every(s => s !== 'pending')
}

// 获取题目名称
function getQuestionName(qid) {
  return questions.value.find(q => q.id === qid)?.name || ''
}

function getQuestionHelp(qid) {
  return questions.value.find(q => q.id === qid)?.helpText || ''
}

// 导航样式
function getTabClass(tabId) {
  const idx = questions.value.findIndex(q => q.id === tabId)
  const activeIdx = questions.value.findIndex(q => activeQuestion.value === q.id)
  const isCompleted = completedQuestions.value.some(q => q.id === tabId)
  const isActive = tabId === activeQuestionId.value
  const isLocked = !isActive && !isCompleted && idx > activeIdx

  return {
    'tab-active': isActive,
    'tab-completed': isCompleted,
    'tab-locked': isLocked
  }
}

// 打开题目
function openArticle(qid) {
  const idx = questions.value.findIndex(q => q.id === qid)
  const activeIdx = questions.value.findIndex(q => activeQuestion.value === q.id)
  if (idx > activeIdx) return
  activeQuestionId.value = qid
}

// 获取填空显示内容
function getBlankDisplay(qid, bIdx) {
  const status = blankStatus[qid][bIdx]
  if (status === 'pending') return '点击输入'
  if (status === 'correct') return questions.value.find(q => q.id === qid).blanks[bIdx].correct
  if (status === 'auto-filled') return questions.value.find(q => q.id === qid).blanks[bIdx].correct
  return '点击输入'
}

// 获取填空样式类
function getBlankClass(qid, bIdx) {
  const status = blankStatus[qid][bIdx]
  const clickable = isBlankClickable(qid, bIdx)
  return {
    'blank-pending': status === 'pending' && !clickable,
    'blank-clickable': status === 'pending' && clickable,
    'blank-correct': status === 'correct',
    'blank-autofilled': status === 'auto-filled'
  }
}

// 判断填空是否可点击
function isBlankClickable(qid, bIdx) {
  if (blankStatus[qid][bIdx] !== 'pending') return false
  return currentBlankIdx[qid] === bIdx
}

// 获取填空后的分隔文字
function getBlankSeparator(qid, bIdx) {
  const q = questions.value.find(q => q.id === qid)
  return q.blanks[bIdx].separator
}

// 渲染已完成题目的HTML
function renderCompletedHTML(question) {
  const q = questions.value.find(q => q.id === question.id)
  if (!q) return ''
  const blanks = q.blanks.map(b => {
    const status = blankStatus[q.id][b.idx]
    const cls = status === 'correct' ? 'correct-box' : 'autofilled-box'
    return `<span class="answer-box ${cls}">${b.correct}</span>${b.separator}`
  }).join('')

  if (q.id === 'bridge') {
    return `一、在《${q.name}》的课文中<br>作者详细介绍了桥面${blanks}写得清清楚楚。`
  } else {
    return `二、在《${q.name}》的课文中<br>作者详细介绍了画上的${blanks}写得清清楚楚。`
  }
}

// ==================== 填空输入弹窗 ====================
const showInputModal = ref(false)
const tempInput = ref('')
const editingBlank = reactive({ qid: '', bIdx: -1 })
const modalError = ref(false) // 输入错误时输入框变红

function onBlankClick(qid, bIdx) {
  if (!isBlankClickable(qid, bIdx)) return
  editingBlank.qid = qid
  editingBlank.bIdx = bIdx
  tempInput.value = ''
  modalError.value = false
  showInputModal.value = true
  nextTick(() => modalInputRef.value?.focus())
}

function closeInputModal() {
  showInputModal.value = false
  tempInput.value = ''
  modalError.value = false
}

async function confirmInput() {
  if (!tempInput.value.trim()) return
  const qid = editingBlank.qid
  const bIdx = editingBlank.bIdx
  const q = questions.value.find(q => q.id === qid)
  if (!q) return

  const blank = q.blanks[bIdx]
  const isCorrect = tempInput.value.trim() === blank.correct
  const attempts = blankAttempts[qid][bIdx] || 0

  if (isCorrect) {
    blankStatus[qid][bIdx] = 'correct'
    advanceBlank(qid)
    closeInputModal()
    setTalkText(`回答正确！继续填写下一个空吧。`)
  } else {
    blankAttempts[qid][bIdx] = attempts + 1
    if (blankAttempts[qid][bIdx] >= 2) {
      // 第二次错误：自动填写正确答案（黄色）
      blankStatus[qid][bIdx] = 'auto-filled'
      advanceBlank(qid)
      closeInputModal()
      setTalkText(`这是学生输入错误，AI生成的一段帮助学生的文案和音频文件。仔细阅读课文再尝试一次吧！`)
    } else {
      // 第一次错误：输入框变红 + AI帮助 + 清空输入 + 不显示错误答案
      modalError.value = true
      tempInput.value = ''
      setTalkText(`回答不正确。${q.helpText}`)
      nextTick(() => modalInputRef.value?.focus())
    }
  }
}

// 推进到下一个空或完成题目
function advanceBlank(qid) {
  const q = questions.value.find(q => q.id === qid)
  currentBlankIdx[qid]++
  if (currentBlankIdx[qid] >= q.blanks.length) {
    // 本题完成
    if (!completedQuestions.value.some(c => c.id === qid)) {
      // 快照渲染HTML，确保答题状态颜色保留
      const renderedHTML = renderCompletedHTML({ id: qid, name: q.name })
      completedQuestions.value.push({
        id: qid,
        name: q.name,
        completionText: q.completionText,
        renderedHTML
      })
      // 尝试切换到下一题
      const next = activeQuestion.value
      if (next && next !== qid) {
        activeQuestionId.value = next
        setTalkText(q.completionText)
      } else if (isAllCompleted.value) {
        setTalkText('恭喜你完成了所有填空！')
      }
    }
  }
}

// ==================== 键盘模拟 ====================
const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['空格', '删除']
]

function pressKey(key) {
  if (key === '空格') {
    tempInput.value += ' '
  } else if (key === '删除') {
    tempInput.value = tempInput.value.slice(0, -1)
  } else {
    tempInput.value += key
  }
}

// ==================== 数字人对话 ====================
const talkText = ref('')

function setTalkText(text) {
  talkText.value = text
}

const playAudio = (text) => {
  console.log('播放语音:', text)
}

// ==================== 路由跳转 ====================
const goBack = () => router.push('/')
const goToReport = () => router.push('/report')
const goHome = () => router.push('/')

// ==================== 生命周期 ====================
onMounted(() => {
  setTalkText('亲爱的同学，来填写课文中的关键词吧。点击下划线的空白处，输入正确答案。')
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

.digital-human-area {
  position: absolute;
  left: 180px;
  bottom: 20px;
  z-index: 5;
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
}

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
  background: rgba(242, 240, 238, 0.45);
  border-radius: 12px;
  color: #333;
  font-size: 18px;
  z-index: 10;
}
.back-icon {
  font-size: 22px;
  cursor: pointer;
}

.tab-wrapper {
  position: absolute;
  top: 110px;
  left: 40px;
  display: flex;
  align-items: center;
  background: rgba(240, 239, 238, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(250, 248, 247, 0.5);
  padding: 6px 14px;
  gap: 8px;
  z-index: 10;
}
.tab-item {
  padding: 8px 22px;
  height: 38px;
  background: #fff;
  border-radius: 20px;
  font-size: 16px;
  line-height: 20px;
  color: #333;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: all 0.2s;
}
.tab-item.tab-active {
  background: #fff;
  color: #333;
  border-color: #4078e8;
  box-shadow: 0 0 0 2px rgba(64,120,232,0.3);
}
.tab-item.tab-completed {
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

.right-container {
  position: absolute;
  top: 110px;
  right: 30px;
  width: 560px;
  z-index: 10;
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
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.guide-desc {
  font-size: 15px;
  color: #333;
  line-height: 2.2;
}

/* 填空槽样式 */
.blank-slot {
  display: inline-block;
  min-width: 80px;
  height: 25px;
  line-height: 22px;
  padding: 0 8px;
  margin: 0 4px;
  text-align: center;
  vertical-align: middle;
  border-radius: 8px;
  border: 1px solid #cccccc;
  background: #f3f3f3;
  color: #999999;
  font-weight: normal;
  cursor: default;
  text-decoration: none;
  box-sizing: border-box;
  transition: all 0.25s;
}
/* 可点击待填写状态：橙色边框，白底，原型样式 */
.blank-slot.blank-clickable {
  border-color: #e69138;
  border-width: 1px;
  background: #ffffff;
  color: #999;
  cursor: pointer;
  animation: blank-pulse 1.5s ease-in-out infinite;
}
.blank-slot.blank-correct {
  border-color: #2a9d3a;
  background: #2a9d3a;
  color: #ffffff;
  cursor: default;
}
.blank-slot.blank-autofilled {
  border-color: #d97706;
  background: #f7c846;
  color: #ffffff;
  cursor: default;
}

@keyframes blank-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230,145,56,0.25); }
  50% { box-shadow: 0 0 0 5px rgba(230,145,56,0); }
}

/* 答案盒子 */
.answer-box {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 6px;
  margin: 0 4px;
  font-weight: 600;
  color: #fff;
  border-bottom: 3px solid transparent;
}
.answer-box.correct-box {
  background: #2a9d3a;
  border-bottom-color: #1d7228;
  box-shadow: 0 2px 6px rgba(42,157,58,0.3);
}
.answer-box.autofilled-box {
  background: #f7c846;
  border-bottom-color: #c9a030;
  box-shadow: 0 2px 6px rgba(247,200,70,0.3);
}

/* 已完成题目块 */
.completed-question-block {
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ddd;
}
.question-title {
  font-size: 17px;
  font-weight: 600;
  color: #2a53b8;
  margin: 0 0 10px 0;
}
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

/* 填空输入面板（位于数字人区域下方） */
.blank-input-panel {
  position: absolute;
  left: 190px;
  top: 240px;
  width: 340px;
  z-index: 6;
}

/* 第一行：输入框 + 按钮 */
.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.input-field {
  flex: 1;
  height: 44px;
  border: 2px solid #4078e8;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 16px;
  color: #333;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}
.input-field:focus {
  border-color: #2a53b8;
  border-width: 2.5px;
}
.input-field.input-error {
  border-color: #dc2626;
  border-width: 2.5px;
  color: #b42020;
  background: #fef2f2;
  animation: input-shake 0.3s ease-in-out;
}
@keyframes input-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.input-btns {
  display: flex;
  gap: 6px;
}
.panel-btn {
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.panel-btn.confirm-btn {
  background: linear-gradient(135deg, #f7c846 0%, #e5b535 100%);
  color: #fff;
  font-weight: 600;
}
.panel-btn.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(247,200,70,0.4);
}
.panel-btn.cancel-btn {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}
.panel-btn.cancel-btn:hover {
  background: #f5f5f5;
}

/* 软键盘（左对齐，可宽于上方） */
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 10px;
  /* 宽度可大于上方的输入行 */
  width: max-content;
  min-width: 600px;
}
.kb-row {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
}
.kb-key {
  min-width: 28px;
  height: 32px;
  padding: 0 10px;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  border: 1px solid #ddd;
  transition: all 0.1s;
}
.kb-key:hover {
  background: #e8e8e8;
}
.kb-key:active {
  transform: scale(0.95);
  background: #d0d0d0;
}
.kb-key.kb-wide {
  min-width: 90px;
}

/* 完成遮罩层 */
.completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
}

/* AI反馈信息对话框 */
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
/* 跳转按钮栏 */
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
