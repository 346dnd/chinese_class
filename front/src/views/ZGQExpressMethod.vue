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

    <!-- 左侧数字人+对话气泡 【位置固定不变，完成后依旧显示】 -->
    <div class="human-wrap" v-show="!hideHumanWhenArticleOpen">
      <img src="/image/罗罗_汉服.psd 1 .png" alt="数字人" class="human-img" />
      <div class="bubble-action-wrap" v-if="talkText">
        <div
          class="human-talk-bubble"
          :class="{ expanded: isBubbleExpanded }"
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

        <!-- ✅按钮在气泡正下方，跟随气泡高度 -->
        <div class="completion-action-bar" v-if="isAllCompleted">
          <button class="completion-action-btn report-btn" @click="goToReport">
            <img src="/image/矢量 69.png" alt="图标" class="bar-btn-icon" />
            查看评价
          </button>
          <button class="completion-action-btn home-btn" @click="goHome">
            <img src="/image/back 1.png" alt="图标" class="bar-btn-icon" />
            回到首页
          </button>
        </div>
      </div>
    </div>

    <!-- ==========课文弹窗 ========== -->
    <div class="left-area">
      <div class="article-close-btn" v-if="showArticle" @click="closeArticle">×</div>
      <div class="article-panel" v-if="showArticle">
        <div class="article-content">
          <h3 class="article-title">{{ tabList[0].name }}</h3>
          <div class="article-body" v-html="articleHtml"></div>
        </div>
      </div>
    </div>

    <!-- 右侧分步流程 -->
    <div class="step-flow">
      <!-- 步骤1 -->
      <div class="step-item" v-if="step >= 1">
        <div class="step-num" :class="{
          active: step === 1 && status1 !== 'correct',
          passed: status1 === 'correct'
        }">1</div>
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
              <div class="read-input" :class="{ 'input-wrong': status1 === 'wrong' }">
                {{ answer1 || '点击窗口输入' }}
              </div>
              <button class="mic-btn" @click="startRecord(1)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[1].recording ? `录音中(${recordStatus[1].countdown}s)` : '语音' }}
              </button>
            </div>
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
            <div class="green-tag" :class="{fold: !answerExpand[1]}">
              {{ steps[0]?.correctAnswer }}
            </div>
            <span v-if="isTextOverflow(steps[0]?.correctAnswer) && step >=2" class="more-btn" @click="toggleExpand(1)">
              {{ answerExpand[1] ? '收起' : '更多' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 步骤2 -->
      <div class="step-item" v-if="step >= 2">
        <div class="step-num" :class="{
          active: step === 2 && status2 !== 'correct',
          passed: status2 === 'correct'
        }">2</div>
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
            <div class="green-tag" :class="{fold: !answerExpand[2]}">
              {{ steps[1]?.correctAnswer }}
            </div>
            <span v-if="isTextOverflow(steps[1]?.correctAnswer) && step >=3" class="more-btn" @click="toggleExpand(2)">
              {{ answerExpand[2] ? '收起' : '更多' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 步骤3 -->
      <div class="step-item" v-if="step >= 3">
        <div class="step-num" :class="{
          active: step === 3 && status3 !== 'correct',
          passed: status3 === 'correct'
        }">3</div>
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
          <div class="answer-result" v-if="step >= 4">
            <div class="green-tag" :class="{fold: !answerExpand[3]}">
              {{ answer3 }}
            </div>
            <span v-if="isTextOverflow(answer3) && step >=4" class="more-btn" @click="toggleExpand(3)">
              {{ answerExpand[3] ? '收起' : '更多' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 第4题，带视频 -->
      <div class="step-item" v-if="step >= 4">
        <div class="step-num" :class="{
          active: step === 4 && status4 !== 'correct',
          passed: status4 === 'correct'
        }">4</div>
        <div
          class="step-card"
          v-if="step >= 4"
          :class="{
            'card-correct': status4 === 'correct',
            'card-wrong': status4 === 'wrong'
          }"
        >
          <p class="step-question">{{ steps[3]?.question }}</p>
          <div class="video-wrap" v-if="recordStatus[4].recording || (step === 4 && status4 !== 'correct')">
            <video
              ref="videoRef"
              v-if="humanVideoUrl"
              :src="humanVideoUrl"
              autoplay
              muted
              @ended="onVideoEnd"
              class="step-video"
            ></video>
          </div>
          <div class="input-box" v-if="step === 4 && status4 !== 'correct'">
            <div class="input-with-action">
              <div class="read-input" :class="{ 'input-wrong': status4 === 'wrong' }">
                {{ answer4 || '点击窗口输入' }}
              </div>
              <button class="mic-btn" @click="startRecord(4)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[4].recording ? `录音中(${recordStatus[4].countdown}s)` : '朗读' }}
              </button>
            </div>
            <div class="error-tip" v-if="status4 === 'wrong'">
              朗读内容不完整，请{{ recordAttempt[4] >= 2 ? '自动完成关卡' : '重新朗读' }}，剩余次数：{{ 2 - recordAttempt[4] }}次
            </div>
          </div>
          <div class="answer-result" v-if="step > 4 || status4 === 'correct'">
            <div class="green-tag" :class="{fold: !answerExpand[4]}">
              {{ answer4 }}
            </div>
            <span v-if="isTextOverflow(answer4) && (step > 4 || status4 === 'correct')" class="more-btn" @click="toggleExpand(4)">
              {{ answerExpand[4] ? '收起' : '更多' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成遮罩层 -->
    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoRef = ref<HTMLVideoElement | null>(null)

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
const hideHumanWhenArticleOpen = ref(false)

const showArticle = ref(false)
const articleHtml = ref(`赵州桥，又称安济桥，位于河北省石家庄市。<br>赵州桥建于隋朝年间，由著名匠师李春设计建造，距今已有1400多年的历史。<br>赵州桥的桥洞不是普通的半圆形，而是像一张弓。<br>赵州桥非常雄伟。桥长五十多米，有九米多宽。<br>赵州桥体现了劳动人民的智慧和才干，是我国宝贵的历史文化遗产。`)

const answerExpand = reactive({1:false,2:false,3:false,4:false})
const toggleExpand = (idx:number)=>{
  answerExpand[idx] = !answerExpand[idx]
}
const isTextOverflow = (text:string)=>{
  if(!text) return false
  return text.length > 32
}

const step = ref(1)
const answer1 = ref('')
const answer2 = ref('')
const answer3 = ref('')
const answer4 = ref('')

const recordAttempt = reactive({ 1: 0, 2: 0, 3: 0,4:0 })
const recordStatus = reactive({
  1: { recording: false, countdown: 60, timer: null as number | null },
  2: { recording: false, countdown: 60, timer: null as number | null },
  3: { recording: false, countdown: 60, timer: null as number | null },
  4: { recording: false, countdown: 60, timer: null as number | null }
})

const steps = ref([
  { step: 1, question: '在《赵州桥》的第3自然段里，一个意思指的是：', correctAnswer: '美观' },
  { step: 2, question: '根据这一个意思写一句中心句：', correctAnswer: '这座桥不但坚固，而且美观' },
  { step: 3, question: '围绕这中心句，后面每一句话写的内容都跟这个意思有关。可以用上修辞手法，可以用事例或细节来写具体。请你读读中心句后面的句子，体会这种写法。', correctAnswer: '' },
  { step: 4, question: '请再读一次，更好的去体会赵州桥的美观。', correctAnswer: '' }
])

const status1 = ref('')
const status2 = ref('')
const status3 = ref('')
const status4 = ref('')

const talkText = ref('')
const humanVideoUrl = ref('')

const tabList = ref([{ id: 'zhaozhou', name: '赵州桥' }])
const currentTabId = ref('zhaozhou')

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

const isAllCompleted = computed(() => status1.value === 'correct' && status2.value === 'correct' && status3.value === 'correct' && status4.value === 'correct')

const completionMessage = computed(() => {
  return '太棒啦！你已经完成全部学习任务，你认真朗读课文，体会到赵州桥围绕一个意思写段落的写作方法。'
})

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
  talkText.value = ''
  hideHumanWhenArticleOpen.value = true
}
const closeArticle = () => {
  showArticle.value = false
  hideHumanWhenArticleOpen.value = false
  talkText.value = '亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。你可以点击课文名称打开课文哦。'
}

const loadTalkText = async () => {
  talkText.value = '亲爱的某某同学，我们来梳理"围绕一个意思把一段话写清楚"的表达方法吧。你可以点击课文名称打开课文哦。'
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
  if(talkText.value){
    showArticle.value = false
  }
})

const startRecord = async (stepNum: number) => {
  if (recordAttempt[stepNum] >= 2) return
  const cur = recordStatus[stepNum]
  if (cur.recording) return
  cur.recording = true
  cur.countdown = 60

  if(stepNum ===4){
    humanVideoUrl.value = ''
    await nextTick()
    if(videoRef.value){
      videoRef.value.currentTime = 0
      videoRef.value.play().catch(()=>{})
    }
  }

  playReadAnimate()
  cur.timer = window.setInterval(() => {
    cur.countdown -= 1
    if (cur.countdown <= 0) {
      endRecord(stepNum)
    }
  }, 1000)
}

const onVideoEnd = ()=>{
  if(videoRef.value){
    videoRef.value.pause()
  }
}

const endRecord = (stepNum: number) => {
  const cur = recordStatus[stepNum]
  if (cur.timer) clearInterval(cur.timer)
  cur.recording = false
  cur.countdown = 60
  recordAttempt[stepNum] += 1

  const mockResultList = [
    '美观',
    '这座桥不但坚固，而且美观',
    '桥面两侧有石栏，栏板上雕刻着精美的图案：有的刻着两条相互缠绕的龙，嘴里吐出美丽的水花',
    '桥面两侧有石栏，栏板上雕刻着精美的图案：有的刻着两条相互缠绕的龙，嘴里吐出美丽的水花；有的刻着两条飞龙，前爪相互抵着，各自回首遥望；还有的刻着双龙戏珠。所有的龙似乎都在游动，真像活了一样。'
  ]
  if (stepNum === 1) answer1.value = mockResultList[0]
  if (stepNum === 2) answer2.value = mockResultList[1]
  if (stepNum === 3) answer3.value = mockResultList[2]
  if (stepNum === 4) answer4.value = mockResultList[3]

  pauseReadAnimate()

  if(stepNum === 4 && recordAttempt[4] < 2){
    setTimeout(()=>{
      startRecord(4)
    },800)
  }

  if(stepNum === 4 && recordAttempt[4] >= 2){
    status4.value = 'correct'
    submitRecordToLLM()
    saveState()
  }
}

const playReadAnimate = () => console.log('朗读动画开始播放')
const pauseReadAnimate = () => console.log('朗读动画定格最后一帧')

const submitStep1 = () => {
  const startTime = Date.now()
  const correctAnswer = steps.value[0]?.correctAnswer || ''
  const flag = answer1.value.trim() === correctAnswer
  status1.value = flag ? 'correct' : 'wrong'

  studentRecord.records.push({
    interaction_id: 1,
    student_input: answer1.value,
    is_correct: flag,
    time_cost: Math.round((Date.now() - startTime) / 1000),
    attempt_count: recordAttempt[1]
  })

  if (flag) {
    step.value = 2
    talkText.value = '很棒，我们来到第2题，请你朗读对应的句子。'
  } else {
    showArticle.value = false
    const tipText = recordAttempt[1] >= 2 ? '次数用完，我们直接进入下一题。' : '这次朗读不对，请重新朗读。'
    talkText.value = tipText
    playAudio(tipText)
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
    step.value = 4
    talkText.value = '接下来第4题，请你再朗读一遍，感受赵州桥的美观。'
  } else {
    showArticle.value = false
    const tipText = '朗读内容不够完整，请重新朗读。'
    talkText.value = tipText
    playAudio(tipText)
  }
  saveState()
}

const submitStep4 = () => {
  const startTime = Date.now()
  const flag = answer4.value.trim().length > 20
  status4.value = flag ? 'correct' : 'wrong'

  studentRecord.records.push({
    interaction_id: 4,
    student_input: answer4.value,
    is_correct: flag,
    time_cost: Math.round((Date.now() - startTime) / 1000),
    attempt_count: recordAttempt[4]
  })

  if (flag || recordAttempt[4] >= 2) {
    status4.value = 'correct'
    submitRecordToLLM()
  } else {
    showArticle.value = false
    const tipText = '朗读内容不够完整，请重新朗读。'
    talkText.value = tipText
    playAudio(tipText)
  }
  saveState()
}

const submitRecordToLLM = async () => {
  console.log('提交全部学生交互流水给LLM', JSON.parse(JSON.stringify(studentRecord)))
  talkText.value = '太棒啦！你已经完成全部学习任务，你认真朗读课文，体会到赵州桥围绕一个意思写段落的写作方法。'
  playAudio(talkText.value)
}

const mockVoice = () => console.log('开启语音')
const mockVideo = () => console.log('回看视频')

const STORAGE_KEY = 'zhaozhou-bridge-state'
const saveState = () => {
  const state = {
    step: step.value,
    answer1: answer1.value,
    answer2: answer2.value,
    answer3: answer3.value,
    answer4: answer4.value,
    status1: status1.value,
    status2: status2.value,
    status3: status3.value,
    status4: status4.value,
    showArticle: showArticle.value,
    hideHumanWhenArticleOpen: hideHumanWhenArticleOpen.value,
    talkText: talkText.value,
    recordAttempt: { ...recordAttempt },
    studentRecord: JSON.parse(JSON.stringify(studentRecord)),
    answerExpand:{...answerExpand}
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
    answer4.value = s.answer4 ?? ''
    status1.value = s.status1 ?? ''
    status2.value = s.status2 ?? ''
    status3.value = s.status3 ?? ''
    status4.value = s.status4 ?? ''
    showArticle.value = !!s.showArticle
    hideHumanWhenArticleOpen.value = !!s.hideHumanWhenArticleOpen
    talkText.value = s.talkText ?? ''
    Object.assign(recordAttempt, s.recordAttempt || { 1: 0, 2: 0, 3: 0,4:0 })
    Object.assign(studentRecord, s.studentRecord || { student_name: '', gender: '', records: [] })
    Object.assign(answerExpand, s.answerExpand || {1:false,2:false,3:false,4:false})
  } catch {
    await loadTalkText()
  }
}

const goBack = () => {
  saveState()
  router.back()
}
const goToReport = () => router.push('/report')
const goHome = () => {
  saveState()
  router.push('/')
}

onMounted(async () => {
  updateScale()
  window.addEventListener('resize', updateScale)
  await restoreState()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
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

/* 数字人【位置固定不变，完成任务依旧保留】 */
.human-wrap {
  position: absolute;
  bottom: 320px;
  left: 890px;
  z-index: 5;
}
.human-img {
  width: 160px;
}

/* 气泡+按钮容器：flex列布局，按钮跟随气泡高度 */
.bubble-action-wrap {
  position: absolute;
  right: 170px;
  top: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 19px; /* 0.5cm */
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

/* ✅按钮：气泡正下方，由flex布局自动定位 */
.completion-action-bar {
  position: relative;
  width: 100%;
  display: flex;
  gap: 12px;
  z-index: 6;
}
.bar-btn-icon {
  width:18px;
  height:18px;
  object-fit:contain;
}
.completion-action-btn {
  flex: 1;
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
.home-btn {
  background: #ffffff;
  color: #daa520;
  border:1px solid #daa520;
}
.home-btn:hover {
  background: #fff8e6;
}

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

.step-flow {
  position: absolute;
  top: 150px;
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
.step-num.passed {
  background: #2a9d3a;
  color: #fff;
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

.video-wrap{
  width:100%;
  margin-bottom:12px;
}
.step-video{
  width:100%;
  border-radius:8px;
  object-fit:cover;
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
  bottom: 5px;
  padding: 5px 14px;
  border: 1px solid #eff1f5;
  background: #fff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #333;
}
.mic-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

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
  margin-top:8px;
}
.green-tag {
  background: #a9f07d;
  border: 1px solid #39c757;
  color: rgb(5, 5, 5);
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 14px;
  line-height:1.5;
}
.green-tag.fold{
  display: -webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.more-btn{
  color:#0066ff;
  font-size:13px;
  cursor:pointer;
  margin-top:4px;
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