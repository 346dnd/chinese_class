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
      </div>
    </div>

    <!-- 左侧课文弹窗 -->
    <div class="article-popup" v-if="showArticle">
      <!-- TODO: 后续接入后端接口渲染课文内容 -->
      <div v-html="articleHtml"></div>
      <button class="top-btn">顶部</button>
    </div>

    <!-- 右侧表单卡片 -->
    <div class="right-form-card">
      <p class="form-title">请仔细阅读《一幅名扬中外的画》第3自然段，思考作者描写的思路，在对应的空格中填入文字。</p>

      <!-- 第1行输入项 -->
      <div
        class="form-item"
        :class="{
          'item-correct': status1 === 'correct',
          'item-wrong': status1 === 'wrong'
        }"
      >
        <label class="item-label">怎么写</label>
        <div class="input-row">
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
          <span class="text-desc">《一幅名扬中外的画》第3自然段</span>
        </div>
      </div>

      <!-- 第2行输入项 -->
      <div
        class="form-item"
        :class="{
          'item-correct': status2 === 'correct',
          'item-wrong': status2 === 'wrong'
        }"
      >
        <label class="item-label">①先确定一个意思。</label>
        <div class="input-row">
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
        </div>
      </div>

      <!-- 第3行输入项 -->
      <div
        class="form-item"
        :class="{
          'item-correct': status3 === 'correct',
          'item-wrong': status3 === 'wrong'
        }"
      >
        <label class="item-label">②根据这个意思写一句中心句。</label>
        <div class="input-row">
          <div class="input-with-action">
            <input
              v-model="answer3"
              class="input-field"
              :class="{
                'input-correct': status3 === 'correct',
                'input-wrong': status3 === 'wrong'
              }"
              :placeholder="status3 === 'wrong' ? '不正确，请重新输入' : '点击窗口输入'"
              readonly
            />
            <span class="mic-btn">🎤语音</span>
          </div>
        </div>
      </div>

      <!-- 第4行输入项 -->
      <div
        class="form-item"
        :class="{
          'item-correct': status4 === 'correct',
          'item-wrong': status4 === 'wrong'
        }"
      >
        <label class="item-label">③围绕中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节把内容写具体。</label>
        <div class="input-row">
          <div class="input-with-action">
            <input
              v-model="answer4"
              class="input-field"
              :class="{
                'input-correct': status4 === 'correct',
                'input-wrong': status4 === 'wrong'
              }"
              :placeholder="status4 === 'wrong' ? '不正确，请重新输入' : '点击窗口输入'"
              readonly
            />
            <span class="mic-btn">🎤语音</span>
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
import { ref, computed } from 'vue'

const showArticle = ref(false)
const articleHtml = ref('')

// 四项填写内容
const answer1 = ref('')
const answer2 = ref('')
const answer3 = ref('')
const answer4 = ref('')

// 每个题目的答题状态：'' 未提交 | 'correct' 正确 | 'wrong' 错误
const status1 = ref<'' | 'correct' | 'wrong'>('')
const status2 = ref<'' | 'correct' | 'wrong'>('')
const status3 = ref<'' | 'correct' | 'wrong'>('')
const status4 = ref<'' | 'correct' | 'wrong'>('')

// 全部输入完成才解除按钮置灰
const allFilled = computed(() => {
  return !!answer1.value && !!answer2.value && !!answer3.value && !!answer4.value
})

const talkText = ref('亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。')

// 切换课文弹窗
const toggleArticle = async () => {
  showArticle.value = !showArticle.value
  if (showArticle.value && !articleHtml.value) {
    // TODO: 后续接入后端接口获取课文内容
    // articleHtml.value = await fetchArticleContent('一幅名扬中外的画')
  }
}

// 提交后逐项校验（后续对接AI接口）
const handleSubmit = async () => {
  // TODO: 调用后端接口批量校验所有答案
  // const results = await validateAllAnswers({ answer1, answer2, answer3, answer4 })
  // 此处为模拟逻辑：答案非空即正确
  const validate = (val: string) => val.trim().length > 0

  status1.value = validate(answer1.value) ? 'correct' : 'wrong'
  status2.value = validate(answer2.value) ? 'correct' : 'wrong'
  status3.value = validate(answer3.value) ? 'correct' : 'wrong'
  status4.value = validate(answer4.value) ? 'correct' : 'wrong'
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

/* 右侧白色表单卡片 */
.right-form-card {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 360px;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-title {
  font-size: 13px;
  color: #333;
  margin: 0 0 8px;
  line-height: 1.5;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.3s;
}
.form-item.item-correct {
  background: #e8f5e9;
}
.form-item.item-wrong {
  background: #fce4ec;
}
.item-label {
  font-size: 14px;
  color: #222;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.input-with-action {
  position: relative;
  flex: 1;
}
.input-field {
  width: 100%;
  border: 1px solid #d0d7e3;
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
.text-desc {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
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
  margin-top: 10px;
}
.submit-btn:disabled {
  background: #b0c3e8;
  cursor: not-allowed;
}
</style>
