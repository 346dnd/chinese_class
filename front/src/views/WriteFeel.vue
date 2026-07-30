<template>
  <div class="page-container">
    <!-- 顶部返回导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">‹</span>
      <span class="nav-title">寻找文化：写写感想</span>
    </div>

    <!-- 课文标签切换 -->
    <div class="tab-wrapper">
      <div
        v-for="tabName in tabList"
        :key="tabName"
        class="tab-item"
        :class="getTabClass(tabName)"
        @click="switchArticleTab(tabName)"
      >
        {{ tabName }}
      </div>
      <div class="modal-close-icon" @click="goBack">×</div>
    </div>

    <!-- 右侧容器 -->
    <div class="right-container">
      <div class="write-feel-modal">
        <h3 class="modal-title">写写感想 <span class="voice-icon">🔊</span></h3>

        <!-- 已完成的题目列表 -->
        <div v-for="(item, idx) in completedItems" :key="'done-' + idx" class="completed-item">
          <div class="completed-question">{{ item.question }}</div>
          <div
            class="completed-text"
            :class="{ 'correct-text': item.status === 'correct', 'wrong-text': item.status === 'wrong' }"
          >{{ item.text }}</div>
        </div>

        <!-- 当前正在进行的题目 -->
        <template v-if="!isAllDone">

          <p class="guide-desc">
            <template v-if="currentArticle.id === 'paper'">
              这三篇课文都写到了中华优秀传统文化的内容，在《纸的发明》里，是哪些方面让你自豪？《赵州桥》《一幅名扬中外的画》又分别是哪些方面让你自豪？请把特别让你自豪的这些方面写下来，记得都能够联系相应的课文内容和生活实际想法。
            </template>
            <template v-else-if="currentArticle.id === 'bridge'">
              在《赵州桥》里，哪些方面让你感到自豪？
            </template>
            <template v-else-if="currentArticle.id === 'painting'">
              《一幅名扬中外的画》哪些细节让你感到自豪？
            </template>
          </p>

          <div class="readonly-green-box" v-if="currentArticle.hintText1">
            {{ currentArticle.hintText1 }}
          </div>
          <div class="readonly-green-box small" v-if="currentArticle.hintText2">
            {{ currentArticle.hintText2 }}
          </div>

          <div class="input-wrapper">
            <div class="feel-input-box">
              <textarea
                v-model="userInputFeel"
                class="feel-input"
                placeholder="输入你的理由..."
                :disabled="inputDisabled"
              ></textarea>
              <div class="func-btn-group">
                <button class="func-btn" @click="handleVoice" :disabled="inputDisabled" title="语音">
                  <span class="func-icon">🎤语音</span>
                </button>
                <button class="func-btn" @click="handlePhoto" :disabled="inputDisabled" title="拍照">
                  <span class="func-icon">📷拍照</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 提交按钮 -->
      <button
        v-if="!isAllDone"
        class="submit-btn"
        @click="submitFeel"
        :disabled="!canSubmit"
      >
        {{ submitButtonText }}
      </button>
    </div>

    <!-- 数字人区域 -->
    <div class="digital-human-area" :class="{ 'z-top': isAllDone }">
      <img
        src="/image/小小_汉服 1.png"
        alt="数字人"
        class="digital-human-img"
      />
      <!-- 提交后对话框 -->
      <div v-if="isAllDone" class="feedback-dialog">
        <div class="feedback-text">这是学生提交后反馈的文字信息：{{ allStudentText }}</div>
        <div class="feedback-text ai">这是学生提交后AI反馈的信息：{{ aiFeedback }}</div>
        <div class="feedback-buttons">
          <button class="feedback-btn primary" @click="goToEvaluation">查看评价</button>
          <button class="feedback-btn secondary" @click="goHome">回到首页</button>
        </div>
      </div>
    </div>

    <!-- 黑色透明覆盖层：覆盖背景，不覆盖人物和答题框 -->
    <div v-if="isAllDone" class="page-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tabList = ref<string[]>(['纸的发明', '赵州桥', '一幅名扬中外的画'])
const activeTab = ref<string>('纸的发明')

const articles = reactive({
  paper: {
    id: 'paper',
    question: '在《纸的发明》里，是哪些方面让你感到自豪？',
    hintText1: '在《纸的发明》中，是哪些让你感到自豪？',
    hintText2: ''
  },
  bridge: {
    id: 'bridge',
    question: '在《赵州桥》里，哪些方面让你感到自豪？',
    hintText1: '在《赵州桥》，是哪些让你感到自豪？',
    hintText2: ''
  },
  painting: {
    id: 'painting',
    question: '《一幅名扬中外的画》哪些细节让你感到自豪？',
    hintText1: '在《一幅名扬中外的画》里，是哪些细节让你感到自豪？',
    hintText2: ''
  }
})

const currentArticle = ref(articles.paper)
const userInputFeel = ref('')
const inputDisabled = ref(false)

const completedArticles = ref<string[]>([])
const completedItems = ref<{ articleId: string, articleName: string, question: string, text: string, status: string }[]>([])

const isAllDone = computed(() => completedArticles.value.length === tabList.value.length)
const canSubmit = computed(() => userInputFeel.value.trim().length > 0)

const submitButtonText = computed(() => {
  const currentIdx = tabList.value.indexOf(activeTab.value)
  const isLast = currentIdx === tabList.value.length - 1
  return isLast ? '提交' : '提交'
})

// 汇总学生所有输入内容（用于反馈显示）
const allStudentText = computed(() => {
  return completedItems.value.map(item => `《${item.articleName}》:${item.text}`).join('；')
})

// AI反馈信息（预留后端接口）
const aiFeedback = computed(() => {
  // TODO: 接入后端AI反馈接口
  return '已收到你的所有感想，系统正在为你生成详细评价...'
})

const getTabClass = (tabName: string) => {
  const isCompleted = completedArticles.value.includes(tabName)
  const isActive = activeTab.value === tabName
  return {
    'tab-completed': isCompleted,
    'tab-active': isActive && !isCompleted,
    'tab-locked': !isActive && !isCompleted
  }
}

const loadArticleContent = (tabName: string) => {
  const mapping: Record<string, keyof typeof articles> = {
    '纸的发明': 'paper',
    '赵州桥': 'bridge',
    '一幅名扬中外的画': 'painting'
  }
  const key = mapping[tabName]
  if (key) {
    currentArticle.value = articles[key]
    userInputFeel.value = ''
  }
}

const switchArticleTab = (tabName: string) => {
  if (tabName === activeTab.value) return
  activeTab.value = tabName
  loadArticleContent(tabName)
}

const handleVoice = () => {
  alert('语音功能：后续接入接口')
}

const handlePhoto = () => {
  alert('拍照功能：后续接入接口')
}

const submitFeel = () => {
  if (!canSubmit.value) return

  const articleName = activeTab.value
  const articleId = currentArticle.value.id
  const question = currentArticle.value.question

  // TODO: 接入后端接口判断感想对错
  // const res = await api.judgeFeel(articleId, userInputFeel.value)
  const status = 'correct'

  if (!completedArticles.value.includes(articleName)) {
    completedArticles.value.push(articleName)
    completedItems.value.push({
      articleId,
      articleName,
      question,
      text: userInputFeel.value,
      status
    })
  }

  // TODO: 接入后端接口保存感想

  const currentIndex = tabList.value.indexOf(activeTab.value)
  if (currentIndex < tabList.value.length - 1) {
    switchArticleTab(tabList.value[currentIndex + 1])
  }
}

const goToEvaluation = () => {
  // TODO: 跳转到学习报告/评价页
  alert('跳转到学习报告页（后续接入路由）')
}

const goHome = () => router.push('/')

const goBack = () => router.push('/')

onMounted(() => {
  loadArticleContent(activeTab.value)
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
  color: #fff;
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
  border: 1px solid rgba(250, 248, 247, 0.5);
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
}
.tab-item.tab-completed {
  background: #f7c846;
  color: #fff;
  border-color: #f7c846;
}
.tab-item.tab-active {
  background: #f7c846;
  color: #fff;
  border-color: #f7c846;
  animation: pulse 1.5s ease-in-out infinite;
}
.tab-item.tab-locked {
  background: #d0d0d0;
  color: #666;
  border-color: #c5c5c5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(247, 200, 70, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(247, 200, 70, 0); }
}

.modal-close-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  text-align: center;
  line-height: 32px;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
}

/* 右侧容器 */
.right-container {
  position: absolute;
  top: 120px;
  right: 30px;
  width: 540px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 右侧白色弹窗 */
.write-feel-modal {
  width: 100%;
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
.voice-icon {
  font-size: 16px;
}

.guide-desc {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 14px;
}

/* 已完成题目 */
.completed-item {
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.completed-question {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
}
.completed-text {
  font-size: 15px;
  line-height: 1.6;
  padding: 6px 10px;
  border-radius: 6px;
  color: #555;
}
.completed-text.correct-text {
  color: #2a7d30;
}
.completed-text.wrong-text {
  color: #b45309;
}

/* 绿色只读框 */
.readonly-green-box {
  color: #111;
  padding: 4px 0;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 8px;
}
.readonly-green-box.small {
  padding: 14px 14px;
  background: #97e37a;
  font-size: 14px;
  color: #ffffff;
}

/* 感想输入框 */
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
}

/* 功能按钮组 */
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

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #f7c846 0%, #e5b535 100%);
  color: #fff;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(247, 200, 70, 0.4);
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(247, 200, 70, 0.5);
}
.submit-btn:disabled {
  background: #e9e9e9;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

/* 黑色透明覆盖层 */
.page-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 15;
}

/* 数字人区域 */
.digital-human-area {
  position: absolute;
  left: 180px;
  bottom: 20px;
  z-index: 5;
}
.digital-human-area.z-top {
  z-index: 25;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.25));
}

/* 反馈对话框 */
.feedback-dialog {
  position: absolute;
  left: 190px;
  top: -20px;
  width: 380px;
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
}
.feedback-dialog::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 30px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #fff;
}

.feedback-text {
  font-size: 14px;
  color: #333;
  line-height: 1.7;
  margin-bottom: 8px;
  padding: 8px 10px;
  background: #f0f4ff;
  border-radius: 8px;
}
.feedback-text.ai {
  background: #fff7e6;
  color: #8a5a12;
}

.feedback-buttons {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.feedback-btn {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.feedback-btn.primary {
  background: linear-gradient(135deg, #f7c846 0%, #e5b535 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(247, 200, 70, 0.4);
}
.feedback-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(247, 200, 70, 0.5);
}
.feedback-btn.secondary {
  background: #f0f0f0;
  color: #555;
}
.feedback-btn.secondary:hover {
  background: #e0e0e0;
}
</style>
