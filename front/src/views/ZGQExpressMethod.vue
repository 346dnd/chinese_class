<template>
  <div class="page-container" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">宣传有法：学习《赵州桥》的表达方法</span>
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

    <!-- 课文标签tab 完全复用写写感想样式 -->
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
      <img src="/image/image 116.png" alt="背景" class="bg-img" />
    </div>

    <!-- 左侧数字人+对话气泡 位置不变，气泡箭头移到右侧 -->
    <div class="human-wrap" v-if="showHuman">
      <img src="/image/罗罗_汉服.psd 1 .png" alt="数字人" class="human-img" />
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

      <!-- 完成后操作按钮，和写写感想一模一样 -->
      <div class="completion-action-bar" v-if="isAllCompleted">
        <button class="completion-action-btn report-btn" @click="goToReport">查看评价</button>
        <button class="completion-action-btn home-btn" @click="goHome">回到首页</button>
      </div>
    </div>

    <!-- ==========【重点】课文弹窗，1:1照搬写写感想的article-panel结构，删掉旧article-popup ========== -->
    <div class="left-area">
      <div class="article-close-btn" v-if="showArticle" @click="closeArticle">×</div>
      <div class="article-panel" v-if="showArticle">
        <div class="article-content">
          <h3 class="article-title">{{ tabList[0].name }}</h3>
          <div class="article-body" v-html="articleHtml"></div>
        </div>
      </div>
    </div>

    <!-- 右侧分步流程：移除连接线，v-if控制，答对一题渲染下一题 -->
    <div class="step-flow">
      <!-- 步骤1 -->
      <div class="step-item" v-if="step >= 1">
        <div class="step-num" :class="{ active: step >= 1 }">1</div>
        <div
          class="step-card"
          :class="{
            'card-correct': status1 === 'correct',
            'card-wrong': status1 === 'wrong'
          }"
        >
          <p class="step-question">{{ steps[0]?.question }}</p>
          <div class="input-box" v-if="step === 1">
            <div class="input-with-action">
              <!-- 只展示文本，禁止手动输入，移除input -->
              <div class="read-input" :class="{ 'input-wrong': status1 === 'wrong' }">
                {{ answer1 || '点击窗口输入' }}
              </div>
              <button class="mic-btn" @click="startRecord(1)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[1].recording ? `录音中(${recordStatus[1].countdown}s)` : '语音' }}
              </button>
            </div>
            <!-- 提交按钮内置答题框内部，修复class带横杠语法，禁用/金色样式 -->
            <button
              class="submit-inner-btn"
              :class="{ 'submit-disable': !answer1.trim() }"
              @click="submitStep1"
              :disabled="!answer1.trim()"
            >
              提交答案
            </button>
            <div class="error-tip" v-if="status1 === 'wrong'">
              朗读内容不完整，请{{ recordAttempt[1] >= 2 ? '自动进入下一题' : '重新朗读' }}，剩余次数：{{ 2 - recordAttempt[1] }}次
            </div>
          </div>
          <div class="answer-result" v-if="step >= 2">
            <div class="green-tag">{{ steps[0]?.correctAnswer }}</div>
          </div>
        </div>
      </div>

      <!-- 步骤2，答对step1才渲染 -->
      <div class="step-item" v-if="step >= 2">
        <div class="step-num" :class="{ active: step >= 2 }">2</div>
        <div
          class="step-card"
          v-if="step >= 2"
          :class="{
            'card-correct': status2 === 'correct',
            'card-wrong': status2 === 'wrong'
          }"
        >
          <p class="step-question">{{ steps[1]?.question }}</p>
          <div class="input-box" v-if="step === 2">
            <div class="input-with-action">
              <div class="read-input" :class="{ 'input-wrong': status2 === 'wrong' }">
                {{ answer2 || '点击窗口输入' }}
              </div>
              <button class="mic-btn" @click="startRecord(2)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[2].recording ? `录音中(${recordStatus[2].countdown}s)` : '语音' }}
              </button>
            </div>
            <button
              class="submit-inner-btn"
              :class="{ 'submit-disable': !answer2.trim() }"
              @click="submitStep2"
              :disabled="!answer2.trim()"
            >
              提交答案
            </button>
            <div class="error-tip" v-if="status2 === 'wrong'">
              朗读内容不完整，请{{ recordAttempt[2] >= 2 ? '自动进入下一题' : '重新朗读' }}，剩余次数：{{ 2 - recordAttempt[2] }}次
            </div>
          </div>
          <div class="answer-result" v-if="step >= 3">
            <div class="green-tag">{{ steps[1]?.correctAnswer }}</div>
          </div>
        </div>
      </div>

      <!-- 步骤3，答对step2才渲染 -->
      <div class="step-item" v-if="step >= 3">
        <div class="step-num" :class="{ active: step >= 3 }">3</div>
        <div
          class="step-card"
          v-if="step >= 3"
          :class="{
            'card-correct': status3 === 'correct',
            'card-wrong': status3 === 'wrong'
          }"
        >
          <p class="step-question">{{ steps[2]?.question }}</p>
          <div class="input-box" v-if="step === 3">
            <div class="input-with-action">
              <div class="read-input" :class="{ 'input-wrong': status3 === 'wrong' }">
                {{ answer3 || '点击窗口输入' }}
              </div>
              <button class="mic-btn" @click="startRecord(3)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[3].recording ? `录音中(${recordStatus[3].countdown}s)` : '语音' }}
              </button>
            </div>
            <button
              class="submit-inner-btn"
              :class="{ 'submit-disable': !answer3.trim() }"
              @click="submitStep3"
              :disabled="!answer3.trim()"
            >
              提交答案
            </button>
            <div class="error-tip" v-if="status3 === 'wrong'">
              朗读内容不完整，请{{ recordAttempt[3] >= 2 ? '自动完成关卡' : '重新朗读' }}，剩余次数：{{ 2 - recordAttempt[3] }}次
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ========== 写写感想同款 1920*1080 自适应缩放 ==========
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

// 气泡折叠
const isBubbleExpanded = ref(false)

// 数字人显示状态
const showHuman = ref(true)

// 课文弹窗状态
const showArticle = ref(false)
const articleHtml = ref(`赵州桥，又称安济桥，位于河北省石家庄市。<br>赵州桥建于隋朝年间，由著名匠师李春设计建造，距今已有1400多年的历史。<br>赵州桥的桥洞不是普通的半圆形，而是像一张弓。<br>赵州桥非常雄伟。桥长五十多米，有九米多宽。<br>赵州桥体现了劳动人民的智慧和才干，是我国宝贵的历史文化遗产。`)

// 步骤数据
const step = ref(1)
const answer1 = ref('')
const answer2 = ref('')
const answer3 = ref('')

// 朗读次数限制：每题最多2次
const recordAttempt = reactive({ 1: 0, 2: 0, 3: 0 })
// 录音状态
const recordStatus = reactive({
  1: { recording: false, countdown: 60, timer: null as number | null },
  2: { recording: false, countdown: 60, timer: null as number | null },
  3: { recording: false, countdown: 60, timer: null as number | null }
})

const steps = ref([
  { step: 1, question: '在《赵州桥》的第3自然段里，一个意思指的是：', correctAnswer: '美观' },
  { step: 2, question: '根据这一个意思写一句中心句：', correctAnswer: '这座桥不但坚固，而且美观' },
  { step: 3, question: '围绕这中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节来写具体。请你读读中心句后面的句子，体会这种写法。', correctAnswer: '' }
])

const status1 = ref('')
const status2 = ref('')
const status3 = ref('')

const talkText = ref('')

// 课文tab配置，完全对齐写写感想
const tabList = ref([{ id: 'zhaozhou', name: '赵州桥' }])
const currentTabId = ref('zhaozhou')

// ========== 交互流水数据结构，对接LLM接口 ==========
const studentRecord = reactive({
  student_name: '',
  gender: '',
  records: [] as Array<{
    interaction_id: number
    student_input: string
    is_correct: boolean
    time_cost: number
    attempt_count: number
  }>
})

// 计算属性
const isAllCompleted = computed(() => status1.value === 'correct' && status2.value === 'correct' && status3.value === 'correct')

// tab样式方法，完全复制写写感想
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
  showArticle.value = true
  showHuman.value = false
  talkText.value = ''
}
const closeArticle = () => {
  showArticle.value = false
  showHuman.value = true
  // 恢复数字人说话内容
  talkText.value = '亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。你可以点击课文名称打开课文哦。'
}

// 加载话术
const loadTalkText = async () => {
  talkText.value = '亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。你可以点击课文名称打开课文哦。'
}

// 语音播放
const playAudio = (text: string) => {
  console.log('播放语音：', text)
}
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  if (talkText.value) playAudio(talkText.value)
}

// ✅【关键】数字人说话，自动收起课文弹窗
watch(talkText, () => {
  isBubbleExpanded.value = false
  if(talkText.value){
    showArticle.value = false
  }
})

// ========== 录音逻辑：60s倒计时，最多2次机会 ==========
const startRecord = (stepNum: number) => {
  if (recordAttempt[stepNum] >= 2) return
  const cur = recordStatus[stepNum]
  if (cur.recording) return
  cur.recording = true
  cur.countdown = 60
  // 朗读动画钩子，后续接入动画资源
  playReadAnimate()
  cur.timer = window.setInterval(() => {
    cur.countdown -= 1
    if (cur.countdown <= 0) {
      endRecord(stepNum)
    }
  }, 1000)
}

const endRecord = (stepNum: number) => {
  const cur = recordStatus[stepNum]
  if (cur.timer) clearInterval(cur.timer)
  cur.recording = false
  cur.countdown = 60
  recordAttempt[stepNum] += 1

  // todo:这里替换为真实语音识别结果
  const mockResultList = ['美观', '这座桥不但坚固，而且美观', '桥面两侧有石栏，栏板上雕刻着精美的图案：有的刻着两条相互缠绕的龙，嘴里吐出美丽的水花']
  if (stepNum === 1) answer1.value = mockResultList[0]
  if (stepNum === 2) answer2.value = mockResultList[1]
  if (stepNum === 3) answer3.value = mockResultList[2]

  // 动画定格最后一帧
  pauseReadAnimate()
}

// 朗读动画预留插槽
const playReadAnimate = () => console.log('朗读动画开始播放')
const pauseReadAnimate = () => console.log('朗读动画定格最后一帧')

// ========== 提交校验逻辑，记录交互流水 ==========
const submitStep1 = () => {
  const startTime = Date.now()
  const correctAnswer = steps.value[0]?.correctAnswer || ''
  const flag = answer1.value.trim() === correctAnswer
  status1.value = flag ? 'correct' : 'wrong'

  // 写入交互流水
  studentRecord.records.push({
    interaction_id: 1,
    student_input: answer1.value,
    is_correct: flag,
    time_cost: Math.round((Date.now() - startTime) / 1000),
    attempt_count: recordAttempt[1]
  })

  if (flag) {
    // ✅合格，自动下一题，不管课文弹窗状态
    step.value = 2
    talkText.value = '很棒，我们来到第2题，请你朗读对应的句子。'
  } else {
    // ✅不合格：关闭课文，数字人播报提示
    showArticle.value = false
    const tipText = recordAttempt[1] >= 2 ? '次数用完，我们直接进入下一题。' : '这次朗读不对，请重新朗读。'
    talkText.value = tipText
    playAudio(tipText)

    // 2次机会用完自动放行
    if (recordAttempt[1] >= 2) {
      status1.value = 'correct'
      step.value = 2
    }
  }
  saveState()
}

const submitStep2 = () => {
  const startTime = Date.now()
  const correctAnswer = steps.value[1]?.correctAnswer || ''
  const flag = answer2.value.trim() === correctAnswer
  status2.value = flag ? 'correct' : 'wrong'

  studentRecord.records.push({
    interaction_id: 2,
    student_input: answer2.value,
    is_correct: flag,
    time_cost: Math.round((Date.now() - startTime) / 1000),
    attempt_count: recordAttempt[2]
  })

  if (flag) {
    step.value = 3
    talkText.value = '很好，来到第3题，请朗读段落体会写法。'
  } else {
    showArticle.value = false
    const tipText = recordAttempt[2] >= 2 ? '次数用完，我们直接进入下一题。' : '这次朗读不对，请重新朗读。'
    talkText.value = tipText
    playAudio(tipText)

    if (recordAttempt[2] >= 2) {
      status2.value = 'correct'
      step.value = 3
    }
  }
  saveState()
}

const submitStep3 = () => {
  const startTime = Date.now()
  // step3只校验长度，判断是否朗读完整
  const flag = answer3.value.trim().length > 10
  status3.value = flag ? 'correct' : 'wrong'

  studentRecord.records.push({
    interaction_id: 3,
    student_input: answer3.value,
    is_correct: flag,
    time_cost: Math.round((Date.now() - startTime) / 1000),
    attempt_count: recordAttempt[3]
  })

  if (flag || recordAttempt[3] >= 2) {
    status3.value = 'correct'
    talkText.value = '太棒啦，你已经完成全部任务！'
    // 提交给LLM接口预留
    submitRecordToLLM()
  } else {
    showArticle.value = false
    const tipText = '朗读内容不够完整，请重新朗读。'
    talkText.value = tipText
    playAudio(tipText)
  }
  saveState()
}

// 预留LLM点评接口
const submitRecordToLLM = async () => {
  console.log('提交交互流水给LLM', JSON.parse(JSON.stringify(studentRecord)))
  // todo: await axios.post('/api/xxx', studentRecord)
  // 拿到返回点评文案+音频，赋值talkText并播放
}

// 模拟按钮
const mockVoice = () => console.log('开启语音')
const mockVideo = () => console.log('回看视频')

// ========== 本地持久化，和写写感想完全一致 ==========
const STORAGE_KEY = 'zhaozhou-bridge-state'
const saveState = () => {
  const state = {
    step: step.value,
    answer1: answer1.value,
    answer2: answer2.value,
    answer3: answer3.value,
    status1: status1.value,
    status2: status2.value,
    status3: status3.value,
    showArticle: showArticle.value,
    showHuman: showHuman.value,
    talkText: talkText.value,
    recordAttempt: { ...recordAttempt },
    studentRecord: JSON.parse(JSON.stringify(studentRecord))
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
    step.value = s.step ?? 1
    answer1.value = s.answer1 ?? ''
    answer2.value = s.answer2 ?? ''
    answer3.value = s.answer3 ?? ''
    status1.value = s.status1 ?? ''
    status2.value = s.status2 ?? ''
    status3.value = s.status3 ?? ''
    showArticle.value = !!s.showArticle
    showHuman.value = s.showHuman ?? true
    talkText.value = s.talkText ?? ''
    Object.assign(recordAttempt, s.recordAttempt || { 1: 0, 2: 0, 3: 0 })
    Object.assign(studentRecord, s.studentRecord || { student_name: '', gender: '', records: [] })
  } catch {
    await loadTalkText()
  }
}

// 导航
const goBack = () => {
  saveState()
  router.back()
}
const goToReport = () => router.push('/report')
const goHome = () => {
  saveState()
  router.push('/')
}

// 生命周期
onMounted(async () => {
  updateScale()
  window.addEventListener('resize', updateScale)
  await restoreState()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  // 清除全部定时器，防止内存泄露
  Object.values(recordStatus).forEach(item => {
    if (item.timer) clearInterval(item.timer)
  })
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
  /* 只改宽度，其他全部保留原样，按钮拉长 */
  width: 150px;
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

/* ========== 课文tab 1:1复制写写感想 ========== */
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

/* ========== 数字人 位置完全保留 ========== */
.human-wrap {
  position: absolute;
  bottom: 320px;
  left: 890px;
  z-index: 5;
}
.human-img {
  width: 160px;
}

/* 气泡：箭头移到右侧 */
.human-talk-bubble {
  position: absolute;
  right: 170px;
  top: 10px;
  width: 300px;
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

/* ==========【重点】课文弹窗，完全复制写写感想 article-panel 的全部css，位置、大小、背景、关闭按钮一模一样 ========== */
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

/* ========== 右侧步骤：彻底删除连接线step-line ========== */
.step-flow {
  position: absolute;
  top: 140px;
  right: 80px;
  width: 340px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.step-item {
  display: flex;
  gap: 14px;
  position: relative;
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
  background: #f9f9fb;
  color: #f4a907;
}
.step-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  width: 100%;
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
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
  margin: 0 0 14px;
  line-height: 1.5;
}

.input-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.input-with-action {
  position: relative;
  width: 100%;
}
.read-input {
  width: 100%;
  border: 1px solid #bbbbbb;
  border-radius: 8px;
  padding: 9px 48px 9px 12px;
  box-sizing: border-box;
  font-size: 15px;
  background-color: #fff;
}
.read-input.input-wrong {
  border: 2px solid #c2185b;
}
.mic-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.mic-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* 提交按钮内置答题框内部 */
.submit-inner-btn {
  align-self: center;
  width: 120px;
  height: 36px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  background-color: #daa520;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}
/* 禁用态样式，灰色 */
.submit-inner-btn.submit-disable {
  background-color: #dddddd;
  color: #999999;
  cursor: not-allowed;
}
.error-tip {
  font-size: 13px;
  color: #c2185b;
}
.answer-result {
  width: 100%;
}
.green-tag {
  background: #39c757;
  color: white;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 14px;
}

/* 完成后按钮，和写写感想完全一致 */
.completion-action-bar {
  position: absolute;
  left: 190px;
  top: 280px;
  width: 300px;
  display: flex;
  gap: 12px;
  z-index: 6;
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
.home-btn {
  background: #f7c846;
  color: #fff;
}
</style>