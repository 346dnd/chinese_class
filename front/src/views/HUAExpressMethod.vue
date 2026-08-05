<template>
  <div class="page-container">
    <!-- 顶部标题栏 -->
    <div class="header-bar">
      <span class="back-arrow" @click="$router.back()">&lt;</span>
      <h1 class="page-title">学习《一幅名扬中外的画》的表达方法</h1>
      <button class="text-btn" @click="toggleArticle">课文</button>
    </div>

    <!-- 背景图 -->
    <div class="bg-wrap">
      <img src="/image 4.png" alt="背景" class="bg-img" />
    </div>

    <!-- 左侧数字人+对话气泡 -->
    <div class="human-wrap">
      <img src="/小小_汉服 1.png" alt="数字人" class="human-img" />
      <div class="talk-bubble" v-if="talkText">
        {{ talkText }}
        <span class="voice-btn">🔊</span>
        <span class="bubble-arrow"></span>
      </div>
    </div>

    <!-- 左侧课文弹窗 -->
    <div class="article-popup" v-if="showArticle">
      <div v-html="articleHtml"></div>
      <button class="top-btn">顶部</button>
    </div>

    <!-- 右侧白色表单卡片 -->
    <div class="right-form-card">
      <!-- 两列表格 -->
      <div class="table-wrapper">
        <!-- 表头 -->
        <div class="table-header">
          <div class="col-left-header">怎么写</div>
          <div class="col-right-header">《一幅名扬中外的画》第3自然段</div>
        </div>

        <!-- 数据行 -->
        <div
          v-for="(question, idx) in questions"
          :key="idx"
          class="table-row"
        >
          <div
            class="col-left"
            :class="{
              'col-left-correct': statusList[idx] === 'correct',
              'col-left-wrong': statusList[idx] === 'wrong'
            }"
          >
            <span class="question-text">{{ question.label }}</span>
          </div>
          <div
            class="col-right"
            :class="{
              'col-right-correct': statusList[idx] === 'correct',
              'col-right-wrong': statusList[idx] === 'wrong'
            }"
          >
            <div class="input-with-action">
              <input
                v-model="answers[idx]"
                class="input-field"
                :class="{
                  'input-correct': statusList[idx] === 'correct',
                  'input-wrong': statusList[idx] === 'wrong'
                }"
                :placeholder="statusList[idx] === 'wrong' ? '不正确，请重新输入' : '点击窗口输入'"
                readonly
              />
              <span class="mic-btn">🎤语音</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部提交按钮 -->
      <button class="submit-btn" :disabled="!allFilled" @click="handleSubmit">
        ⇧ 提交
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const showArticle = ref(false)
const articleHtml = ref(`《清明上河图》是北宋画家张择端画的一幅画。<br>这幅画描绘了北宋都城汴京的热闹景象。<br>画面上的人物很多，有农民、船工、商人、读书人，还有骑着毛驴的、推着小车的……<br>街上有挂着各种招牌的店铺，有热闹的街市，有横跨汴河的大桥。<br>这幅画已经名扬中外，让人看到了八百多年前古都的风貌。`)

const questions = ref([
  { label: '①先确定一个意思。' },
  { label: '②根据这个意思写一句中心句。' },
  { label: '③围绕中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节把内容写具体。' }
])

const answers = ref(['', '', ''])

const statusList = ref(['', '', ''])

const allFilled = computed(() => {
  return answers.value.every(a => !!a)
})

const talkText = ref('')

const loadTalkText = async () => {
  talkText.value = '亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。'
}

onMounted(() => {
  loadTalkText()
})

const toggleArticle = () => {
  showArticle.value = !showArticle.value
}

const handleSubmit = () => {
  statusList.value = answers.value.map(a => a.trim().length > 0 ? 'correct' : 'wrong')
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
  left: 260px;
  z-index: 5;
}
.human-img {
  width: 130px;
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
.bubble-arrow {
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid rgba(59, 58, 58, 0.5);
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
  background: rgba(255, 255, 255, 0.5);
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

/* 右侧白色表单卡片 */
.right-form-card {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 480px;
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-header {
  display: flex;
  gap: 8px;
}
.table-header .col-left-header {
  flex: 1;
  background: #d5e5fa;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #060606ff;
  text-align: center;
}
.table-header .col-right-header {
  flex: 2;
  background: #d5e5fa;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #121213ff;
}

/* 核心行布局 */
.table-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.table-row .col-left {
  flex: 1;
  background: #2578e4ff;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  transition: background 0.3s;
}
.table-row .col-right {
  flex: 2;
  border-radius: 8px;
  /* 重点：移除上下padding！！不要在这里加内边距 */
  overflow: visible;
  display: flex;
  align-items: center;
  transition: background 0.3s;
}

.col-left.col-left-correct {
  background: #4af364ff !important;
}
.col-right.col-right-correct {
  background: #57f06bff !important;
}
.col-left.col-left-wrong {
  background: #f8bbd0 !important;
}
.col-right.col-right-wrong {
  background: #f9bbccff !important;
}

.question-text {
  font-size: 13px;
  color: #f5f7faff;
  line-height: 1.5;
}
.col-left-correct .question-text {
  color: #1b5e20;
}
.col-left-wrong .question-text {
  color: #880e4f;
}

/* 输入框 */
.input-with-action {
  position: relative;
  width: 100%;
  height: 100%;
}
.input-field {
  width: 100%;
  height: 100%;
  border: 1px solid #689bf5ff;
  border-radius: 8px;
  padding: 10px 60px 10px 10px;
  box-sizing: border-box;
  transition: border-color 0.3s, background 0.3s, color 0.3s;
  background: #fff;
  outline: none;
}
.input-field:focus {
  border-color: #689bf5ff !important;
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

.submit-btn {
  width: 100%;
  height: 44px;
  background: #3678e8;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 6px;
}
.submit-btn:disabled {
  background: #b0c3e8;
  cursor: not-allowed;
}
</style>