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
      <div class="human-talk-bubble">
        亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。你可以点击课文名称打开课文。
        <span class="voice-icon">🔊</span>
      </div>
    </div>

    <!-- 课文标签切换 -->
    <div class="tab-wrapper">
      <div
        v-for="tabName in tabList"
        :key="tabName"
        class="tab-item"
        :class="getTabClass(tabName)"
        @click="openArticle(tabName)"
      >
        {{ tabName }}
      </div>
    </div>

    <!-- 右侧容器 -->
    <div class="right-container">
      <div class="write-feel-modal">
        <h3 class="modal-title">初步感悟 <span class="voice-icon">🔊</span></h3>

        <!-- 已完成的题目列表（保留显示题目+答案，按对错着色） -->
        <div v-for="(item, idx) in completedItems" :key="'done-' + idx" class="completed-item">
          <div class="guide-desc" v-html="item.renderedHTML"></div>
        </div>

        <!-- 当前正在进行的题目 -->
        <template v-if="!isAllDone">

          <p class="guide-desc">
            <template v-if="currentArticleId === 'bridge'">
              亲爱的某某同学，来体会"围绕一个意思把一段话写清楚"的表达方法吧。<br>
              一、在《赵州桥》的课文中<br>
              作者详细介绍了桥面
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.bridge[0] === 'correct', 'wrong-input': answerStatus.bridge[0] === 'wrong' }"
                type="text" v-model="answers.bridge[0]"
                :readonly="completedArticles.includes('赵州桥')"
                :placeholder="answers.bridge[0] ? '' : '点击输入'" />
              、桥洞的
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.bridge[1] === 'correct', 'wrong-input': answerStatus.bridge[1] === 'wrong' }"
                type="text" v-model="answers.bridge[1]"
                :readonly="completedArticles.includes('赵州桥')"
                :placeholder="answers.bridge[1] ? '' : '点击输入'" />
              ，把每种
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.bridge[2] === 'correct', 'wrong-input': answerStatus.bridge[2] === 'wrong' }"
                type="text" v-model="answers.bridge[2]"
                :readonly="completedArticles.includes('赵州桥')"
                :placeholder="answers.bridge[2] ? '' : '点击输入'" />
              的
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.bridge[3] === 'correct', 'wrong-input': answerStatus.bridge[3] === 'wrong' }"
                type="text" v-model="answers.bridge[3]"
                :readonly="completedArticles.includes('赵州桥')"
                :placeholder="answers.bridge[3] ? '' : '点击输入'" />
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.bridge[4] === 'correct', 'wrong-input': answerStatus.bridge[4] === 'wrong' }"
                type="text" v-model="answers.bridge[4]"
                :readonly="completedArticles.includes('赵州桥')"
                :placeholder="answers.bridge[4] ? '' : '点击输入'" />
              写得清清楚楚。
            </template>

            <template v-else-if="currentArticleId === 'painting'">
              二、在《一幅名扬中外的画》的课文中<br>
              作者详细介绍了画上的
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.painting[0] === 'correct', 'wrong-input': answerStatus.painting[0] === 'wrong' }"
                type="text" v-model="answers.painting[0]"
                :readonly="completedArticles.includes('一幅名扬中外的画')"
                :placeholder="answers.painting[0] ? '' : '点击输入'" />
              、
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.painting[1] === 'correct', 'wrong-input': answerStatus.painting[1] === 'wrong' }"
                type="text" v-model="answers.painting[1]"
                :readonly="completedArticles.includes('一幅名扬中外的画')"
                :placeholder="answers.painting[1] ? '' : '点击输入'" />
              ，把画面的
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.painting[2] === 'correct', 'wrong-input': answerStatus.painting[2] === 'wrong' }"
                type="text" v-model="answers.painting[2]"
                :readonly="completedArticles.includes('一幅名扬中外的画')"
                :placeholder="answers.painting[2] ? '' : '点击输入'" />
              和
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.painting[3] === 'correct', 'wrong-input': answerStatus.painting[3] === 'wrong' }"
                type="text" v-model="answers.painting[3]"
                :readonly="completedArticles.includes('一幅名扬中外的画')"
                :placeholder="answers.painting[3] ? '' : '点击输入'" />
              写得清清楚楚。
            </template>

            <template v-else-if="currentArticleId === 'paper'">
              三、在《纸的发明》的课文中<br>
              作者详细介绍了纸的
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.paper[0] === 'correct', 'wrong-input': answerStatus.paper[0] === 'wrong' }"
                type="text" v-model="answers.paper[0]"
                :readonly="completedArticles.includes('纸的发明')"
                :placeholder="answers.paper[0] ? '' : '点击输入'" />
              、
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.paper[1] === 'correct', 'wrong-input': answerStatus.paper[1] === 'wrong' }"
                type="text" v-model="answers.paper[1]"
                :readonly="completedArticles.includes('纸的发明')"
                :placeholder="answers.paper[1] ? '' : '点击输入'" />
              ，以及纸的
              <input
                class="fill-input"
                :class="{ 'correct-input': answerStatus.paper[2] === 'correct', 'wrong-input': answerStatus.paper[2] === 'wrong' }"
                type="text" v-model="answers.paper[2]"
                :readonly="completedArticles.includes('纸的发明')"
                :placeholder="answers.paper[2] ? '' : '点击输入'" />
              过程。
            </template>
          </p>
        </template>
      </div>

      <!-- 底部按钮 -->
      <button
        v-if="!isAllDone"
        class="submit-btn"
        @click="handleSubmit"
        :disabled="!isCurrentArticleComplete"
      >
        {{ submitButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tabList = ref<string[]>(['赵州桥', '一幅名扬中外的画', '纸的发明'])
const activeTab = ref<string>('赵州桥')
const currentArticleId = ref('bridge')

const articleMapping: Record<string, string> = {
  '赵州桥': 'bridge',
  '一幅名扬中外的画': 'painting',
  '纸的发明': 'paper'
}

const answers = reactive({
  bridge: ['', '', '', '', ''],
  painting: ['', '', '', ''],
  paper: ['', '', '']
})

const answerStatus = reactive({
  bridge: ['pending', 'pending', 'pending', 'pending', 'pending'],
  painting: ['pending', 'pending', 'pending', 'pending'],
  paper: ['pending', 'pending', 'pending']
})

const correctAnswers: Record<string, string[]> = {
  bridge: ['结构特点', '设计原理', '造型', '美观', '坚固'],
  painting: ['人物', '场景', '内容', '细节'],
  paper: ['历史', '原料', '制作']
}

const completedArticles = ref<string[]>([])
const completedItems = ref<{ articleId: string, articleName: string, renderedHTML: string }[]>([])

const isAllDone = computed(() => completedArticles.value.length === tabList.value.length)

const isCurrentArticleComplete = computed(() => {
  if (isAllDone.value) return false
  const currentAnswers = answers[currentArticleId.value as keyof typeof answers]
  return currentAnswers.every(a => a.trim() !== '')
})

const submitButtonText = computed(() => {
  return '提交'
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

const renderCompletedHTML = (articleId: string, articleName: string) => {
  const a = answers[articleId as keyof typeof answers]
  const s = answerStatus[articleId as keyof typeof answerStatus]
  const getInputClass = (idx: number) => {
    if (s[idx] === 'correct') return 'correct-box'
    if (s[idx] === 'wrong') return 'wrong-box'
    return ''
  }

  const inputs = (texts: string[]) => {
    return texts.map((t, i) => `<span class="answer-box ${getInputClass(i)}">${t}</span>`).join('')
  }

  if (articleId === 'bridge') {
    return `亲爱的某某同学，来体会"围绕一个意思把一段话写清楚"的表达方法吧。<br>一、在《${articleName}》的课文中<br>作者详细介绍了桥面${inputs([a[0]])}、桥洞的${inputs([a[1]])}，把每种${inputs([a[2]])}的${inputs([a[3], a[4]])}写得清清楚楚。`
  } else if (articleId === 'painting') {
    return `二、在《${articleName}》的课文中<br>作者详细介绍了画上的${inputs([a[0], a[1]])}，把画面的${inputs([a[2], a[3]])}写得清清楚楚。`
  } else {
    return `三、在《${articleName}》的课文中<br>作者详细介绍了纸的${inputs([a[0], a[1]])}，以及纸的${inputs([a[2]])}过程。`
  }
}

const openArticle = (tabName: string) => {
  activeTab.value = tabName
  currentArticleId.value = articleMapping[tabName]
}

const handleSubmit = () => {
  if (!isCurrentArticleComplete.value) return

  const articleId = currentArticleId.value
  const articleName = activeTab.value

  // TODO: 接入后端接口批量判断答案对错
  // const res = await api.batchCheckAnswers(articleId, answers[articleId])

  const currentAnswers = answers[articleId as keyof typeof answers]
  const statuses = answerStatus[articleId as keyof typeof answerStatus]
  const correctList = correctAnswers[articleId as keyof typeof correctAnswers]

  currentAnswers.forEach((ans, i) => {
    statuses[i] = ans.trim() === correctList[i] ? 'correct' : 'wrong'
  })

  if (!completedArticles.value.includes(articleName)) {
    completedArticles.value.push(articleName)
    completedItems.value.push({
      articleId,
      articleName,
      renderedHTML: renderCompletedHTML(articleId, articleName)
    })
  }

  const currentIdx = tabList.value.indexOf(activeTab.value)
  if (currentIdx < tabList.value.length - 1) {
    const nextTab = tabList.value[currentIdx + 1]
    openArticle(nextTab)
  }
}

const goBack = () => router.push('/')

onMounted(() => {
  currentArticleId.value = articleMapping[activeTab.value]
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
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
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
  background: #ffffff;
  border-radius: 20px;
  font-size: 16px;
  line-height: 20px;
  color: #333;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: all 0.2s;
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

.right-container {
  position: absolute;
  top: 120px;
  right: 30px;
  width: 540px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

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
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.voice-icon {
  font-size: 16px;
  cursor: pointer;
}

.guide-desc {
  font-size: 15px;
  color: #333;
  line-height: 2;
}

.completed-item {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed #e0e0e0;
}

/* 填空输入框 */
.fill-input {
  display: inline-block;
  width: 100px;
  border: none;
  border-bottom: 1.5px solid #4078e8;
  padding: 4px 6px;
  margin: 0 4px;
  font-size: 15px;
  color: #4078e8;
  background: transparent;
  text-align: center;
  outline: none;
  transition: all 0.3s;
}
.fill-input::placeholder {
  color: #a0b4e8;
  font-size: 14px;
}
.fill-input:focus {
  border-bottom-color: #2a53b8;
  border-bottom-width: 2px;
}
.fill-input.correct-input {
  background: #c8f0cc;
  border-bottom-color: #2a9d3a;
  color: #2a7d30;
}
.fill-input.wrong-input {
  background: #fef3c7;
  border-bottom-color: #d97706;
  color: #b45309;
}

.answer-box {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 0 3px;
  font-weight: 600;
}
.answer-box.correct-box {
  background: #c8f0cc;
  color: #2a7d30;
}
.answer-box.wrong-box {
  background: #fef3c7;
  color: #b45309;
}

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
</style>
