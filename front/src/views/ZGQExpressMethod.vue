<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <span class="back-arrow" @click="$router.back()">&lt;</span>
      <h1 class="page-title">学习《赵州桥》的表达方法</h1>
      <button class="text-btn" @click="toggleArticle">课文</button>
    </div>

    <!-- 背景图 -->
    <div class="bg-wrap">
      <img src="/image 2 .png" alt="背景" class="bg-img" />
    </div>

    <!-- 左侧数字人+对话气泡 -->
    <div class="human-wrap">
      <img src="/罗罗_汉服.psd 1 .png" alt="数字人" class="human-img" />
      <div class="talk-bubble" v-if="talkText">
        {{ talkText }}
        <span class="voice-btn">🔊</span>
      </div>
    </div>

    <!-- 左侧课文弹窗 -->
    <div class="article-popup" v-if="showArticle">
      <!-- TODO: 后续接入后端接口渲染课文内容 -->
      <div v-html="articleHtml"></div>
      <button class="top-btn">顶部</button>
    </div>

    <!-- 右侧分步流程 -->
    <div class="step-flow">
      <!-- 步骤1 -->
      <div class="step-item">
        <div class="step-num active">1</div>
        <div class="step-line" :class="{active: step >= 2}"></div>
        <div
          class="step-card"
          :class="{
            'card-correct': status1 === 'correct',
            'card-wrong': status1 === 'wrong'
          }"
        >
          <p class="step-question">在《赵州桥》的第3自然段里，一个意思指的是：</p>
          <div class="input-box" v-if="step === 1">
            <div class="input-with-action">
              <input
                v-model="answer1"
                class="input-field"
                :class="{
                  'input-correct': status1 === 'correct',
                  'input-wrong': status1 === 'wrong'
                }"
                :placeholder="status1 === 'wrong' ? '不正确，请重新输入' : '点击窗口输入'"
                readonly
              />
              <span class="mic-btn">🎤语音</span>
            </div>
            <button class="confirm-btn" @click="submitStep1">确定</button>
          </div>
          <div class="answer-result" v-if="step >= 2">
            <div class="green-tag">美观</div>
          </div>
        </div>
      </div>

      <!-- 步骤2 -->
      <div class="step-item">
        <div class="step-num" :class="{active: step >= 2}">2</div>
        <div class="step-line" :class="{active: step >= 3}"></div>
        <div
          class="step-card"
          v-if="step >= 2"
          :class="{
            'card-correct': status2 === 'correct',
            'card-wrong': status2 === 'wrong'
          }"
        >
          <p class="step-question">根据这一个意思写一句中心句：</p>
          <div class="input-box" v-if="step === 2">
            <div class="input-with-action">
              <input
                v-model="answer2"
                class="input-field"
                :class="{
                  'input-correct': status2 === 'correct',
                  'input-wrong': status2 === 'wrong'
                }"
                :placeholder="status2 === 'wrong' ? '不正确，请重新输入' : '点击窗口输入'"
                readonly
              />
              <span class="mic-btn">🎤语音</span>
            </div>
            <button class="confirm-btn" @click="submitStep2">确定</button>
          </div>
          <div class="answer-result" v-if="step >= 3">
            <div class="green-tag">这座桥不但坚固，而且美观</div>
          </div>
        </div>
      </div>

      <!-- 步骤3 -->
      <div class="step-item">
        <div class="step-num" :class="{active: step >= 3}">3</div>
        <div
          class="step-card"
          v-if="step >= 3"
          :class="{
            'card-correct': status3 === 'correct',
            'card-wrong': status3 === 'wrong'
          }"
        >
          <p class="step-question">围绕这中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节来写具体。请你读读中心句后面的句子，体会这种写法。</p>
          <div class="read-box" v-if="step === 3">
            <div class="input-with-action">
              <input class="read-input" readonly placeholder="朗读" />
              <span class="mic-btn">🎤</span>
            </div>
            <div class="read-buttons" v-if="hasRead">
              <button class="play-btn">▶ 播放</button>
              <button class="replay-btn">↺ 重读</button>
            </div>
            <button class="confirm-btn" :disabled="!hasRead">确定</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部完成按钮 -->
    <button class="finish-btn" :disabled="!allFilled" v-if="step === 3">完成</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const showArticle = ref(false)
const articleHtml = ref('')
const step = ref(1)
const answer1 = ref('')
const answer2 = ref('')
const hasRead = ref(false)

// 每个步骤的答题状态：'' 未提交 | 'correct' 正确 | 'wrong' 错误
const status1 = ref<'' | 'correct' | 'wrong'>('')
const status2 = ref<'' | 'correct' | 'wrong'>('')
const status3 = ref<'' | 'correct' | 'wrong'>('')

const allFilled = computed(() => {
  return !!answer1.value && !!answer2.value && hasRead.value
})

const talkText = ref('亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。')

// 切换课文弹窗
const toggleArticle = async () => {
  showArticle.value = !showArticle.value
  if (showArticle.value && !articleHtml.value) {
    // TODO: 后续接入后端接口获取课文内容
    // articleHtml.value = await fetchArticleContent('赵州桥')
  }
}

// 步骤1提交（后续对接AI接口校验）
const submitStep1 = async () => {
  // TODO: 调用后端接口校验答案，后端返回 correct / wrong
  // const result = await validateAnswer({ step: 1, answer: answer1.value })
  // 模拟：回答正确
  if (answer1.value === '美观') {
    status1.value = 'correct'
    step.value = 2
  } else {
    status1.value = 'wrong'
    // 3秒后清空错误提示，允许重新输入
    setTimeout(() => {
      status1.value = ''
      answer1.value = ''
    }, 1500)
  }
}

// 步骤2提交（后续对接AI接口校验）
const submitStep2 = async () => {
  // TODO: 调用后端接口校验答案，后端返回 correct / wrong
  // const result = await validateAnswer({ step: 2, answer: answer2.value })
  if (answer2.value === '这座桥不但坚固，而且美观') {
    status2.value = 'correct'
    step.value = 3
  } else {
    status2.value = 'wrong'
    setTimeout(() => {
      status2.value = ''
      answer2.value = ''
    }, 1500)
  }
}
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: "Microsoft Yahei", sans-serif;
}
.bg-wrap {
  width: 100%;
  height: 100%;
}
.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-bar {
  position: absolute;
  top: 12px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}
.back-arrow {
  font-size: 22px;
  color: #222;
  cursor: pointer;
}
.page-title {
  font-size: 20px;
  margin: 0;
  color: #222;
}
.text-btn {
  margin-left: auto;
  background: #fff;
  border: 1px solid #999;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
}

.human-wrap {
  position: absolute;
  bottom: 30px;
  left: 110px;
  z-index: 5;
}
.human-img {
  width: 160px;
}
.talk-bubble {
  position: absolute;
  left: 170px;
  top: 10px;
  background: rgba(59, 58, 58, 0.5);
  padding: 12px 16px;
  border-radius: 12px;
  width: 340px;
  font-size: 15px;
  color: #fff;
  line-height: 1.6;
}
.voice-btn {
  margin-left: 6px;
  cursor: pointer;
}

.article-popup {
  position: absolute;
  top: 70px;
  left: 16px;
  width: 520px;
  max-height: 75vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  z-index: 20;
}
.top-btn {
  position: sticky;
  right: 10px;
  top: 10px;
  float: right;
  background: #eee;
  border: none;
  border-radius: 10px;
  padding: 2px 8px;
}

.step-flow {
  position: absolute;
  top: 70px;
  right: 30px;
  width: 320px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.step-item {
  display: flex;
  gap: 12px;
  position: relative;
}
.step-line {
  position: absolute;
  left: 15px;
  top: 36px;
  width: 2px;
  height: calc(100% + 18px);
  background: #ddd;
  transition: background 0.3s;
}
.step-line.active {
  background: #3678e8;
}
.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
  color: #666;
  text-align: center;
  line-height: 32px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: background 0.3s, color 0.3s;
}
.step-num.active {
  background: #3678e8;
  color: #fff;
}
.step-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: background 0.3s, box-shadow 0.3s;
}
.step-card.card-correct {
  background: #e8f5e9;
  box-shadow: 0 4px 12px rgba(57, 199, 87, 0.25);
}
.step-card.card-wrong {
  background: #fce4ec;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.2);
}
.step-question {
  font-size: 14px;
  margin: 0 0 12px;
}

.input-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-with-action {
  position: relative;
  width: 100%;
}
.input-field {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 60px 8px 10px;
  box-sizing: border-box;
  transition: border-color 0.3s, background 0.3s, color 0.3s;
}
.input-field.input-correct {
  background: #c8e6c9;
  border-color: #2e7d32;
  color: #1b5e20;
}
.input-field.input-wrong {
  background: #fff0f3;
  border-color: #c2185b;
  color: #c2185b;
}
.input-field.input-wrong::placeholder {
  color: #c2185b;
}
.input-with-action .mic-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #3678e8;
  cursor: pointer;
  font-size: 13px;
}
.confirm-btn {
  background: #3678e8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  align-self: flex-end;
}

.answer-result {
  width: 100%;
}
.green-tag {
  background: #39c757;
  color: white;
  padding: 6px;
  border-radius: 6px;
}

.read-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.read-input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 60px 8px 10px;
  box-sizing: border-box;
}
.read-buttons {
  display: flex;
  gap: 10px;
}
.play-btn, .replay-btn {
  background: #ddd;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
}

.finish-btn {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: #3678e8;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 28px;
  font-size: 16px;
}
.finish-btn:disabled {
  background: #b8c8e8;
  cursor: not-allowed;
}
</style>
