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
        :class="{ active: activeTab === tabName }"
        @click="openArticle(tabName)"
      >
        {{ tabName }}
      </div>
    </div>

    <!-- 右侧容器 -->
    <div class="right-container">
      <div class="write-feel-modal">
        <h3 class="modal-title">初步感悟 <span class="voice-icon">🔊</span></h3>

        <!-- 赵州桥题目 -->
        <template v-if="currentArticleId === 'bridge'">
          <p class="guide-desc">
            亲爱的某某同学，来体会"围绕一个意思把一段话写清楚"的表达方法吧。<br>
            一、在《赵州桥》的课文中<br>
            作者详细介绍了桥面
            <input
              class="fill-input"
              type="text"
              v-model="answers.bridge[0]"
              :placeholder="answers.bridge[0] ? '' : '点击输入'"
              @blur="checkAnswer('bridge', 0)"
            />
            、桥洞的
            <input
              class="fill-input"
              type="text"
              v-model="answers.bridge[1]"
              :placeholder="answers.bridge[1] ? '' : '点击输入'"
              @blur="checkAnswer('bridge', 1)"
            />
            ，把每种
            <input
              class="fill-input"
              type="text"
              v-model="answers.bridge[2]"
              :placeholder="answers.bridge[2] ? '' : '点击输入'"
              @blur="checkAnswer('bridge', 2)"
            />
            的
            <input
              class="fill-input"
              type="text"
              v-model="answers.bridge[3]"
              :placeholder="answers.bridge[3] ? '' : '点击输入'"
              @blur="checkAnswer('bridge', 3)"
            />
            <input
              class="fill-input"
              type="text"
              v-model="answers.bridge[4]"
              :placeholder="answers.bridge[4] ? '' : '点击输入'"
              @blur="checkAnswer('bridge', 4)"
            />
            写得清清楚楚。
          </p>
        </template>

        <!-- 一幅名扬中外的画题目 -->
        <template v-else-if="currentArticleId === 'painting'">
          <p class="guide-desc">
            二、在《一幅名扬中外的画》的课文中<br>
            作者详细介绍了画上的
            <input
              class="fill-input"
              type="text"
              v-model="answers.painting[0]"
              :placeholder="answers.painting[0] ? '' : '点击输入'"
              @blur="checkAnswer('painting', 0)"
            />
            、
            <input
              class="fill-input"
              type="text"
              v-model="answers.painting[1]"
              :placeholder="answers.painting[1] ? '' : '点击输入'"
              @blur="checkAnswer('painting', 1)"
            />
            ，把画面的
            <input
              class="fill-input"
              type="text"
              v-model="answers.painting[2]"
              :placeholder="answers.painting[2] ? '' : '点击输入'"
              @blur="checkAnswer('painting', 2)"
            />
            和
            <input
              class="fill-input"
              type="text"
              v-model="answers.painting[3]"
              :placeholder="answers.painting[3] ? '' : '点击输入'"
              @blur="checkAnswer('painting', 3)"
            />
            写得清清楚楚。
          </p>
        </template>

        <!-- 纸的发明题目 -->
        <template v-else-if="currentArticleId === 'paper'">
          <p class="guide-desc">
            三、在《纸的发明》的课文中<br>
            作者详细介绍了纸的
            <input
              class="fill-input"
              type="text"
              v-model="answers.paper[0]"
              :placeholder="answers.paper[0] ? '' : '点击输入'"
              @blur="checkAnswer('paper', 0)"
            />
            、
            <input
              class="fill-input"
              type="text"
              v-model="answers.paper[1]"
              :placeholder="answers.paper[1] ? '' : '点击输入'"
              @blur="checkAnswer('paper', 1)"
            />
            ，以及纸的
            <input
              class="fill-input"
              type="text"
              v-model="answers.paper[2]"
              :placeholder="answers.paper[2] ? '' : '点击输入'"
              @blur="checkAnswer('paper', 2)"
            />
            过程。
          </p>
        </template>
      </div>

      <!-- 底部按钮 -->
      <button
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

// 课文列表
const tabList = ref<string[]>(['赵州桥', '一幅名扬中外的画', '纸的发明'])
const activeTab = ref<string>('赵州桥')
const currentArticleId = ref('bridge')

const articleMapping: Record<string, string> = {
  '赵州桥': 'bridge',
  '一幅名扬中外的画': 'painting',
  '纸的发明': 'paper'
}

// 答案数据（每篇课文的填空答案）
const answers = reactive({
  bridge: ['', '', '', '', ''],
  painting: ['', '', '', ''],
  paper: ['', '', '']
})

// 错误次数记录（每个填空框的错误次数）
const errorCounts = reactive({
  bridge: [0, 0, 0, 0, 0],
  painting: [0, 0, 0, 0],
  paper: [0, 0, 0]
})

// 每篇课文的正确答案（模拟数据，后续接入接口）
const correctAnswers: Record<string, string[]> = {
  bridge: ['结构特点', '设计原理', '造型', '美观', '坚固'],
  painting: ['人物', '场景', '内容', '细节'],
  paper: ['历史', '原料', '制作']
}

// 已完成的课文
const completedArticles = reactive(new Set<string>())

// 当前课文是否全部填写完成
const isCurrentArticleComplete = computed(() => {
  const currentAnswers = answers[currentArticleId.value as keyof typeof answers]
  return currentAnswers.every(a => a.trim() !== '')
})

// 提交按钮文字
const submitButtonText = computed(() => {
  const currentIdx = tabList.value.indexOf(activeTab.value)
  const isLast = currentIdx === tabList.value.length - 1
  return isLast ? '全部完成' : '提交'
})

// 打开课文（点击标签）
const openArticle = (tabName: string) => {
  // TODO: 接入后端接口打开课文内容
  // const res = await api.getArticle(tabName)
  activeTab.value = tabName
  currentArticleId.value = articleMapping[tabName]
}

// 检查答案（失焦时触发）
const checkAnswer = (articleId: string, index: number) => {
  // TODO: 接入AI接口验证答案
  // const res = await api.checkAnswer(articleId, index, answers[articleId][index])

  // 模拟：如果错误2次，AI填入答案
  if (errorCounts[articleId][index] >= 2) {
    // AI填入答案
    const aiAnswer = correctAnswers[articleId][index]
    answers[articleId][index] = aiAnswer
    errorCounts[articleId][index] = 0
  }
}

// 提交处理
const handleSubmit = () => {
  const currentIdx = tabList.value.indexOf(activeTab.value)
  const isLast = currentIdx === tabList.value.length - 1

  // TODO: 接入后端接口保存答案
  // await api.submitAnswers(currentArticleId.value, answers[currentArticleId.value])

  completedArticles.add(currentArticleId.value)

  if (isLast) {
    // 全部完成
    alert('恭喜你完成了所有课文的填空！')
    goBack()
  } else {
    // 切换到下一篇
    const nextTab = tabList.value[currentIdx + 1]
    openArticle(nextTab)
  }
}

// 切换课文标签（手动切换）
const switchArticleTab = (tabName: string) => {
  if (tabName === activeTab.value) return
  openArticle(tabName)
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

/* 数字人区域 */
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
  transition: all 0.2s;
}
.tab-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.tab-item.active {
  background: #f7c846;
  color: #fff;
  border-color: #f7c846;
}

/* 右侧容器 */
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
  transition: border-color 0.2s;
}
.fill-input::placeholder {
  color: #a0b4e8;
  font-size: 14px;
}
.fill-input:focus {
  border-bottom-color: #2a53b8;
  border-bottom-width: 2px;
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
</style>
