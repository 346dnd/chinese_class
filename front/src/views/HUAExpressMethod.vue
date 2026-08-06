<template>
  <div class="page-container" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">宣传有法：学习《一幅名扬中外的画》的表达方法</span>
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

    <!-- 课文标签tab -->
    <div class="tab-wrapper">
      <div
        v-for="tab in tabList"
        :key="tab.id"
        class="tab-item"
        :class="getTabClass(tab.id)"
        @click="handleTabClick(tab.id)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 背景图 -->
    <div class="bg-wrap">
      <img src="/image/image 4.png" alt="背景" class="bg-img" />
    </div>

    <!-- 左侧区域：数字人 + 课文弹窗【和赵州桥布局完全对齐】 -->
    <div class="left-area">
      <div class="digital-human-area" v-if="currentPanel === 'human'">
        <img
          src="/image/小小_汉服 1.png"
          alt="数字人"
          class="digital-human-img"
        />
        <div class="bubble-action-wrap" v-if="talkText">
          <div class="human-talk-bubble">
            <img
              src="/image/语音朗读.png"
              alt="播放"
              class="bubble-voice-icon"
              @click="playBubbleAudio"
            />
            <span class="bubble-text">{{ talkText }}</span>
            <span class="bubble-arrow"></span>
          </div>

          <div class="completion-action-bar" v-if="isAllCompleted">
            <button class="completion-action-btn report-btn" @click="handleFinishOk">
              <img src="/image/矢量 69.png" alt="图标" class="bar-btn-icon" />
              好的
            </button>
          </div>
        </div>
      </div>

      <!-- 课文关闭叉叉位置和赵州桥保持一致 top:-50px; right:-150px -->
      <div class="article-close-btn" v-if="currentPanel === 'lesson'" @click="closeArticle">×</div>
      <div class="article-panel" v-if="currentPanel === 'lesson'">
        <div class="article-content">
          <h3 class="article-title">{{ currentTabName }}</h3>
          <div class="article-body" v-html="currentArticleContent"></div>
        </div>
      </div>
    </div>

    <!-- 右侧答题容器 -->
    <div class="right-container">
      <div class="write-feel-modal">
        <h3 class="modal-title">
          请仔细阅读《一幅名扬中外的画》第3自然段，在对应的空格中填入文字。
          <img
            src="/image/语音朗读.png"
            alt="语音"
            class="title-voice-icon"
            @click="playAudio(talkText)"
          />
        </h3>

        <!-- 两列表格 -->
        <div class="table-wrapper">
          <div class="table-header">
            <div class="col-left-header">怎么写</div>
            <div class="col-right-header">《一幅名扬中外的画》第3自然段</div>
          </div>

          <div
            v-for="(question, idx) in questions"
            :key="idx"
            class="table-row"
          >
            <div
              class="col-left"
              :class="{
                'col-left-correct': statusList[idx] === 'correct',
                'col-left-wrong': statusList[idx] === 'wrong',
                'col-left-system-fill': statusList[idx] === 'systemFill'
              }"
            >
              <span class="question-text">{{ question.label }}</span>
            </div>
            <div
              class="col-right"
              :class="{
                'col-right-correct': statusList[idx] === 'correct',
                'col-right-wrong': statusList[idx] === 'wrong',
                'col-right-system-fill': statusList[idx] === 'systemFill'
              }"
            >
              <div class="input-with-action">
                <input
                  v-model="answers[idx]"
                  class="input-field"
                  :class="{
                    'input-correct': statusList[idx] === 'correct',
                    'input-wrong': statusList[idx] === 'wrong',
                    'input-system-fill': statusList[idx] === 'systemFill'
                  }"
                  :placeholder="getPlaceholder(idx)"
                  :readonly="statusList[idx] === 'correct' || statusList[idx] === 'systemFill'"
                />
                <button
                  v-if="!isAllCompleted && statusList[idx] !== 'correct'"
                  class="mic-btn"
                  @click="handleVoiceInput(idx)"
                >
                  <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                  <span class="mic-text">语音</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="!isAllCompleted"
          class="submit-btn"
          :class="{ submitGold: canSubmit && allFilled }"
          :disabled="!canSubmit || !allFilled"
          @click="handleSubmit"
        >
          提交答案
        </button>
      </div>
    </div>

    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080
const pageStyle = ref({
  transform: 'scale(1)',
  transformOrigin: 'top left',
  width: DESIGN_WIDTH + 'px',
  height: DESIGN_HEIGHT + 'px',
})
const updateScale = () => {
  const scaleX = window.innerWidth / DESIGN_WIDTH
  const scaleY = window.innerHeight / DESIGN_HEIGHT
  pageStyle.value = {
    transform: `scale(${scaleX}, ${scaleY})`,
    transformOrigin: 'top left',
    width: DESIGN_WIDTH + 'px',
    height: DESIGN_HEIGHT + 'px',
  }
}

const isBubbleExpanded = ref(false)

const tabList = ref([{ id: 'painting', name: '一幅名扬中外的画' }])
const currentTabId = ref('painting')
const currentPanel = ref<'human' | 'lesson'>('human')

const articleHtmlRaw = ref(`《清明上河图》是北宋画家张择端画的一幅画。<br>这幅画描绘了北宋都城汴京的热闹景象。<br>画面上的人物很多，有农民、船工、商人、读书人，还有骑着毛驴的、推着小车的……<br>街上有挂着各种招牌的店铺，有热闹的街市，有横跨汴河的大桥。<br>这幅画已经名扬中外，让人看到了八百多年前古都的风貌。`)

const currentTabName = computed(() => {
  const tab = tabList.value.find(t => t.id === currentTabId.value)
  return tab ? tab.name : ''
})
const currentArticleContent = computed(() => articleHtmlRaw.value)

const questions = ref([
  { label: '①先确定一个意思。', correctAnswer: '热闹', allowModifier: ['很热闹', '非常热闹', '特别热闹'] },
  { label: '②根据这个意思写一句中心句。', correctAnswer: '画上的街市可热闹了。', allowModifier: [] },
  { label: '③围绕中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节把内容写具体。', correctAnswer: '街上有挂着各种招牌的店铺、作坊、酒楼、茶馆……', allowModifier: [] }
])
const answers = ref(['', '', ''])
const statusList = ref<Array<''|'correct'|'wrong'|'systemFill'>>(['', '', ''])
const attemptList = ref([0,0,0])

const allFilled = computed(() => answers.value.every(a => !!a.trim()))
const canSubmit = computed(()=>{
  for(let i=0;i<3;i++){
    if(statusList.value[i] === 'wrong' && !answers.value[i].trim()){
      return false
    }
  }
  return true
})
const isAllCompleted = computed(() => statusList.value.every(s => s === 'correct' || s === 'systemFill'))

const talkText = ref('')
const loadTalkText = async () => {
  talkText.value = '亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。你可以点击课文名称打开课文哦。'
}

const getPlaceholder = (idx:number)=>{
  const s = statusList.value[idx]
  if(s === 'wrong') return '不正确，请重新输入'
  if(s === 'systemFill') return '系统已填入正确答案'
  return '请输入...'
}

const getTabClass = (tabId: string) => {
  const isActive = tabId === currentTabId.value
  return {
    'tab-active': isActive,
    'tab-passed': false,
    'tab-locked': false,
    'tab-unlocked': !isActive
  }
}
const handleTabClick = (tabId: string) => {
  currentTabId.value = tabId
  currentPanel.value = 'lesson'
}
const closeArticle = () => {
  currentPanel.value = 'human'
}

const playAudio = (text: string) => {
  console.log('播放语音：', text)
}
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  if (talkText.value) playAudio(talkText.value)
}
watch(talkText, () => {
  isBubbleExpanded.value = false
})

const handleVoiceInput = (idx:number)=>{
  console.log(`第${idx+1}题语音输入触发`)
}

function checkAnswer(index:number, input:string):boolean{
  const q = questions.value[index]
  const trimInput = input.trim()
  if(trimInput === q.correctAnswer) return true
  if(q.allowModifier.includes(trimInput)) return true
  return false
}

const handleSubmit = () => {
  for(let i=0;i<questions.value.length;i++){
    if(statusList.value[i] === 'correct' || statusList.value[i] === 'systemFill') continue

    attemptList.value[i] += 1
    const ok = checkAnswer(i, answers.value[i])
    if(ok){
      statusList.value[i] = 'correct'
    }else{
      statusList.value[i] = 'wrong'
      answers.value[i] = ''
      const errMsg = '这一题回答不正确，请重新填写。'
      talkText.value = errMsg
      playAudio(errMsg)

      if(attemptList.value[i] >=3){
        statusList.value[i] = 'systemFill'
        answers.value[i] = questions.value[i].correctAnswer
        talkText.value = '已经尝试3次，系统帮你填入正确答案。'
        playAudio(talkText.value)
      }
    }
  }
  saveState()
}

const handleFinishOk = ()=>{
  console.log('点击好的，结束，不跳转评价页')
}

const mockVoice = () => console.log('开启语音')
const mockVideo = () => console.log('回看视频')

const STORAGE_KEY = 'painting-lesson-state'
const saveState = () => {
  const state = {
    answers: [...answers.value],
    statusList: [...statusList.value],
    attemptList: [...attemptList.value],
    currentPanel: currentPanel.value,
    talkText: talkText.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
const restoreState = async () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    await loadTalkText()
    saveState()
    return
  }
  try {
    const s = JSON.parse(raw)
    answers.value = s.answers ?? ['', '', '']
    statusList.value = s.statusList ?? ['', '', '']
    attemptList.value = s.attemptList ?? [0,0,0]
    currentPanel.value = s.currentPanel ?? 'human'
    talkText.value = s.talkText ?? ''
  } catch {
    await loadTalkText()
  }
}

const goBack = () => {
  saveState()
  router.back()
}

onMounted(async () => {
  updateScale()
  window.addEventListener('resize', updateScale)
  await restoreState()
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
  position: relative;
  overflow: hidden;
  font-family: "Microsoft Yahei", sans-serif;
}

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
  width: 125px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 14px;
  background: #da9c20;
  color: #ffffff;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: background 0.24s ease;
}
.nav-btn:hover {
  background: #c48918;
}
.btn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

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

.bg-wrap {
  width: 100%;
  height: 100%;
}
.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 和赵州桥页面完全对齐 */
.left-area {
  position: absolute;
  top: 170px;
  left: 60px;
  bottom: 20px;
  width: 800px;
  z-index: 5;
}
.article-close-btn {
  position: absolute;
  top: -50px;
  right: -150px;
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

.digital-human-area {
  position: absolute;
  bottom: 320px;
  left: 890px;
}
.digital-human-img {
  width: 160px;
}

.bubble-action-wrap {
  position: absolute;
  right: 170px;
  top: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.5cm;
}

.human-talk-bubble {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #5d3004e4;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.bubble-text {
  flex: 1;
  max-height: 72px;
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
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 10px solid #fff;
}

.completion-action-bar {
  position: relative;
  width: 100%;
  z-index: 6;
}
.bar-btn-icon {
  width:18px;
  height:18px;
  object-fit:contain;
}
.completion-action-btn {
  width: 100%;
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

/* 课文面板完全复制赵州桥尺寸 */
.article-panel {
  width: 950px;
  height: 870px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
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

/* 右侧答题面板 */
.right-container {
  position: absolute;
  top: 150px;
  right: 80px;
  width: 580px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  border: 2px solid #f9b805;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 20px 24px;
  box-sizing: border-box;
}
.modal-title {
  font-size: 15px;
  font-weight: 300;
  color: #111;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-voice-icon {
  width: 22px;
  color: #f0940a;
  height: 22px;
  cursor: pointer;
  object-fit: contain;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.table-header {
  display: flex;
  gap: 8px;
}
.table-header .col-left-header {
  flex: 1;
  background: #f2efd8;
  border-radius: 8px;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}
.table-header .col-right-header {
  flex: 2;
  background: #f2efd8;
  border-radius: 8px;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 500;
}

.table-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  min-height: 86px;
}
.table-row .col-left {
  flex: 1;
  background: #f2efd8;
  border-radius: 8px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  transition: background 0.3s;
}
.table-row .col-right {
  flex: 2;
  border-radius: 8px;
  overflow: visible;
  display: flex;
  align-items: stretch;
  transition: background 0.3s;
}

.col-left.col-left-correct {
  background: rgb(213, 249, 218) !important;
}
.col-left-correct .question-text {
  color: #0f0f0f !important;
}
.col-left.col-left-wrong {
  background: #f0b4b4 !important;
}
.col-left-wrong .question-text {
  color: #0f0e0e !important;
}
.col-left.col-left-system-fill {
  background: #f0c2c2 !important;
}
.col-left-system-fill .question-text{
  color:#000;
}
.col-right.col-right-system-fill{
  background:#fecdd3 !important;
}
.col-right.col-right-wrong {
  background: #ffffff !important;
}

.question-text {
  font-size: 13px;
  color: rgb(8, 8, 8);
  line-height: 1.6;
}
.col-left-correct .question-text {
  color: #1b5e20;
}

.input-with-action {
  position: relative;
  width: 100%;
  height: 100%;
}
.input-field {
  width: 100%;
  height: 100%;
  border: 1px solid rgb(247, 158, 4);
  border-radius: 8px;
  padding: 18px 72px 18px 14px;
  box-sizing: border-box;
  transition: border-color 0.3s, background 0.3s, color 0.3s;
  background: #fff;
  outline: none;
  font-size:15px;
}
:deep(.input-field::placeholder) {
  color: #cbc7c7;
}
.input-field:focus {
  border-color: rgb(233, 184, 38) !important;
}
.input-field.input-correct {
  background: #bff59e;
  border-color: #1b960f;
  color: #1b5e20;
}
.input-field.input-wrong {
  background: #ffffff;
  border: 2px solid #dc7777;
  color: #e48f82;
}
.input-field.input-system-fill{
  background:#fecdd3;
  border:2px solid #fb9999;
}
.input-field.input-wrong::placeholder {
  color: #f09494;
}

.mic-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 14px;
  border: 1px solid #eff1f5;
  background: #fff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ebaf36;
}
.mic-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: #f9bc04;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 18px;
  transition: background 0.25s;
}
.submit-btn.submitGold{
  background:#daa520;
  color:#ffffff;
}
.submit-btn:disabled {
  background: #d5d5d5;
  cursor: not-allowed;
  color:#bbb8b8;
  border-radius: 12px;
}

.completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
}
</style>