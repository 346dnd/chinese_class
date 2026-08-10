<template>
  <div class="page-container" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">{{ pageTitle }}</span>
      <div class="top-nav-buttons">
        <div class="nav-btn" @click="mockVoice">
          <img src="/image/语音 1.png" alt="语音播报" class="btn-icon" />
          {{ voiceBtnText }}
        </div>
      </div>
    </div>

    <!-- 底层场景背景 -->
    <div v-if="currentScene === 'donkey-question'" class="video-freeze-layer">
      <img src="/image/image 10.png" alt="视频暂停定格" class="freeze-img" />
    </div>
    <div v-if="currentScene === 'paper-sort'" class="video-freeze-layer">
      <img src="/image/image 14.png" alt="视频暂停定格" class="freeze-img" />
    </div>
    <div v-if="currentScene === 'finish-page'" class="video-freeze-layer">
      <img src="/image/image 16.png" alt="视频暂停定格" class="freeze-img" />
    </div>

    <!-- 答题遮罩层 -->
    <div v-if="showAnswerMask" class="answer-mask"></div>

    <!-- 评价浮层 -->
    <div v-if="showEvalOverlay" class="eval-overlay">
      <img src="/image/image 16.png" alt="评价页定格背景" class="eval-bg-img" />
      <div class="eval-popup-wrap">
        <div class="eval-popup">
          <h3>{{ evalTitle }}</h3>
          <p>{{ evalContent }}</p>
          <button class="eval-close-btn" @click="closeEvalOverlay">{{ evalCloseText }}</button>
        </div>
      </div>
    </div>

    <!-- 左侧数字人区域 -->
    <div class="left-area">
      <div class="digital-human-area">
        <div v-show="currentScene === 'donkey-question'" class="scene-donkey">
          <img src="/image/罗罗_汉服.psd 1 .png" alt="数字人罗罗" class="digital-human-img" />
          <div class="bubble-action-wrap" v-if="talkText">
            <div class="human-talk-bubble">
              <span class="bubble-text">{{ talkText }}</span>
              <img src="/image/语音朗读.png" alt="播放语音" class="bubble-voice-icon" @click="playBubbleAudio" />
              <span class="bubble-arrow"></span>
            </div>
          </div>
        </div>
        <div v-show="currentScene === 'paper-sort'" class="scene-paper">
          <img src="/image/罗罗_汉服.psd 1 .png" alt="数字人罗罗" class="digital-human-img" />
          <div class="bubble-action-wrap" v-if="talkText">
            <div class="human-talk-bubble">
              <span class="bubble-text">{{ talkText }}</span>
              <img src="/image/语音朗读.png" alt="播放语音" class="bubble-voice-icon" @click="playBubbleAudio" />
              <span class="bubble-arrow"></span>
            </div>
          </div>
          <button v-if="showContinueBtn" class="continue-btn" @click="nextPaperStep">{{ continueBtnText }} {{continueCountdown}}S</button>
        </div>
        <div v-show="currentScene === 'finish-page'" class="scene-finish">
          <img src="/image/小小_汉服 1.png" alt="数字人小小" class="digital-human-img" />
          <div class="bubble-action-wrap">
            <div class="human-talk-bubble">
              <span class="bubble-text">{{finishTalkText}}</span>
              <img src="/image/语音朗读.png" alt="播放语音" class="bubble-voice-icon" @click="playBubbleAudio" />
              <span class="bubble-arrow"></span>
            </div>
            <div class="completion-action-bar">
              <button class="completion-action-btn report-btn" @click="openEvalOverlay">
                <img src="/image/矢量 69.png" alt="图标" class="bar-btn-icon" />
                {{ checkEvalBtnText }}
              </button>
              <button class="completion-action-btn home-btn" @click="goHome">
                <img src="/image/back 1.png" alt="图标" class="bar-btn-icon" />
                {{ goHomeBtnText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====两套独立答题容器，定位互不干扰===== -->
    <!-- 交互1：选择题容器 -->
    <div v-show="currentScene === 'donkey-question'" class="right-container-donkey">
      <div class="question-panel">
        <div class="panel-title">{{ donkeyPanelTitle }} {{countdownNum}}S</div>
        <div class="option-list">
          <div
            v-for="item in donkeyOptionList"
            :key="item.id"
            class="option-item"
            @click="selectDonkeyOption(item)"
          >
            {{item.label}}
          </div>
        </div>
      </div>
    </div>

    <!-- 交互2：拖拽排序容器 -->
    <div v-show="currentScene === 'paper-sort'" class="right-container-paper">
      <div class="sort-panel">
        <div class="panel-title">{{ sortPanelTitle }}</div>
        <div class="sort-desc">{{ sortDescText }}</div>
        <div class="sort-row">
          <span class="sort-label">{{ sortLabelFirst }}</span>
          <div
            class="sort-input-box"
            @dragover.prevent
            @drop="handleDrop('first')"
          >
            <span v-if="sortResult.first" class="sort-item">{{sortResult.first}}</span>
          </div>
        </div>
        <div class="sort-row">
          <span class="sort-label">{{ sortLabelThen }}</span>
          <div
            class="sort-input-box"
            @dragover.prevent
            @drop="handleDrop('then')"
          >
            <span v-if="sortResult.then" class="sort-item">{{sortResult.then}}</span>
          </div>
        </div>
        <div class="sort-row">
          <span class="sort-label">{{ sortLabelAgain }}</span>
          <div
            class="sort-input-box"
            @dragover.prevent
            @drop="handleDrop('again')"
          >
            <span v-if="sortResult.again" class="sort-item">{{sortResult.again}}</span>
          </div>
        </div>
        <div class="sort-row">
          <span class="sort-label">{{ sortLabelLast }}</span>
          <div
            class="sort-input-box"
            @dragover.prevent
            @drop="handleDrop('last')"
          >
            <span v-if="sortResult.last" class="sort-item">{{sortResult.last}}</span>
          </div>
        </div>
        <div class="tip-text">{{ sortTipText }}</div>
        <div class="drag-source-box">
          <!-- 已经拖拽到上方的选项，底部过滤隐藏 -->
          <div
            v-for="step in paperStepList.filter(item=>!usedStepIds.includes(item.id))"
            :key="step.id"
            class="drag-item"
            draggable="true"
            @dragstart="handleDragStart($event, step)"
          >
            {{step.text}}
          </div>
        </div>
        <!-- 绑定disabled，未填完 / 超过重试次数置灰不可点击 -->
        <button
          class="submit-sort-btn"
          :class="{disabled:!canSubmitSort}"
          :disabled="!canSubmitSort"
          @click="checkPaperSort"
        >
          {{ submitSortBtnText }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

// 缩放逻辑
const pageStyle = ref({
  transform: 'scale(1)',
  transformOrigin: 'top left',
  width: DESIGN_WIDTH + 'px',
  height: DESIGN_HEIGHT + 'px',
  marginLeft: '0px',
  marginTop: '0px'
})
const updateScale = () => {
  const scaleX = window.innerWidth / DESIGN_WIDTH
  const scaleY = window.innerHeight / DESIGN_HEIGHT
  pageStyle.value = {
    transform: `scale(${scaleX}, ${scaleY})`,
    transformOrigin: 'top left',
    width: DESIGN_WIDTH + 'px',
    height: DESIGN_HEIGHT + 'px',
    marginLeft: '0px',
    marginTop: '0px'
  }
}
let resizeTimer: number | null = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(updateScale, 100)
}

// 本地缓存key：仅做页面刷新视图降级
const pageLocalKey = 'culture-paper-page-status'
type PageStatus = {
  currentScene: string
  sortResult: Record<string, string>
  selectDonkeyRes: string
  usedStepIds: string[]
}
const defaultStatus: PageStatus = {
  currentScene: 'donkey-question',
  sortResult: { first: '', then: '', again: '', last: '' },
  selectDonkeyRes: '',
  usedStepIds: []
}
const currentScene = ref('donkey-question')
const sortResult = ref<Record<string, string>>({ first: '', then: '', again: '', last: '' })
const selectDonkeyRes = ref('')
const usedStepIds = ref<string[]>([])

// 读取本地缓存
function loadLocalStatus() {
  const raw = localStorage.getItem(pageLocalKey)
  if (!raw) {
    currentScene.value = defaultStatus.currentScene
    sortResult.value = { ...defaultStatus.sortResult }
    selectDonkeyRes.value = defaultStatus.selectDonkeyRes
    usedStepIds.value = [...defaultStatus.usedStepIds]
    return
  }
  try {
    const obj: PageStatus = JSON.parse(raw)
    currentScene.value = obj.currentScene
    sortResult.value = { ...obj.sortResult }
    selectDonkeyRes.value = obj.selectDonkeyRes
    usedStepIds.value = Array.isArray(obj.usedStepIds) ? [...obj.usedStepIds] : []
  } catch (e) {
    currentScene.value = defaultStatus.currentScene
    sortResult.value = { ...defaultStatus.sortResult }
    selectDonkeyRes.value = defaultStatus.selectDonkeyRes
    usedStepIds.value = [...defaultStatus.usedStepIds]
  }
}
const saveStatus = () => {
  const payload: PageStatus = {
    currentScene: currentScene.value,
    sortResult: { ...sortResult.value },
    selectDonkeyRes: selectDonkeyRes.value,
    usedStepIds: [...usedStepIds.value]
  }
  localStorage.setItem(pageLocalKey, JSON.stringify(payload))
}

// 遮罩开关
const showAnswerMask = ref(false)
watch(currentScene,(scene)=>{
  showAnswerMask.value = ['donkey-question','paper-sort','finish-page'].includes(scene)
},{immediate:true})

// 评价浮层
const showEvalOverlay = ref(false)
const openEvalOverlay = () => showEvalOverlay.value = true
const closeEvalOverlay = () => showEvalOverlay.value = false

// ========== 页面文案变量 ==========
const pageTitle = ref('')
const voiceBtnText = ref('')
const evalTitle = ref('')
const evalContent = ref('')
const evalCloseText = ref('')
const talkText = ref('')
const finishTalkText = ref('')
const continueBtnText = ref('')
const checkEvalBtnText = ref('')
const goHomeBtnText = ref('')
const countdownNum = ref(15)
const donkeyPanelTitle = ref('')
const donkeyOptionList = ref<Array<{id:string,label:string}>>([])
const sortPanelTitle = ref('')
const sortDescText = ref('')
const sortLabelFirst = ref('')
const sortLabelThen = ref('')
const sortLabelAgain = ref('')
const sortLabelLast = ref('')
const sortTipText = ref('')
const submitSortBtnText = ref('')
const paperStepList = ref<Array<{id:string,text:string}>>([])

// 错误重试计数
const currentErrorCount = ref(0)
const maxRetryCount = ref(1)

// 提交判断
const isSortAllFilled = computed(()=>{
  return !!sortResult.value.first && !!sortResult.value.then && !!sortResult.value.again && !!sortResult.value.last
})
const canSubmitSort = computed(()=>{
  return isSortAllFilled.value && currentErrorCount.value < maxRetryCount.value
})

// ========== 前端Mock模拟数据 ==========
const loadPageConfig = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  const cfg = {
    "pageTitle":"重温文化：探秘“纸的逆袭”",
    "voiceBtnText":"语音播报",
    "evalTitle":"查看评价",
    "evalContent":"这里放置评价内容区域",
    "evalCloseText":"关闭",
    "initTalkText":"嗨，翻翻你的书包，如果我们现在还用竹简书写字的话，如果1本书承载的信息需要1头驴来背，今天你需要牵几头驴来上学呢？",
    "finishTalkText":"小雅真棒！刚才算‘牵几头驴’时你反应超快，造纸步骤也是一次就排对啦！逻辑清晰又准确，为你点赞！",
    "continueBtnText":"继续观看",
    "checkEvalBtnText":"查看评价",
    "goHomeBtnText":"回到首页",
    "donkeyPanelTitle":"思考时刻",
    "donkeyOptionList":[
      {"id":"opt1","label":"3头驴"},
      {"id":"opt2","label":"5头驴"},
      {"id":"opt3","label":"8头驴"},
      {"id":"opt4","label":"10头驴"},
      {"id":"opt5","label":"更多驴"}
    ],
    "sortPanelTitle":"思考时刻",
    "sortDescText":"读一读《纸的发明》第4自然段，将造纸步骤按先后顺序拖拽排好。",
    "sortLabelFirst":"先",
    "sortLabelThen":"然后",
    "sortLabelAgain":"再",
    "sortLabelLast":"最后",
    "sortTipText":"就成了一种既轻便又好用的纸。",
    "submitSortBtnText":"就这样，开始干吧",
    "paperStepList":[
      {"id":"s1","text":"把树皮、麻头、破布、旧渔网剪碎或切断"},
      {"id":"s2","text":"浸在水里捣烂成浆"},
      {"id":"s3","text":"把浆捞出来"},
      {"id":"s4","text":"晒干"}
    ],
    "maxRetryCount":1
  }

  pageTitle.value = cfg.pageTitle
  voiceBtnText.value = cfg.voiceBtnText
  evalTitle.value = cfg.evalTitle
  evalContent.value = cfg.evalContent
  evalCloseText.value = cfg.evalCloseText
  talkText.value = cfg.initTalkText
  finishTalkText.value = cfg.finishTalkText
  continueBtnText.value = cfg.continueBtnText
  checkEvalBtnText.value = cfg.checkEvalBtnText
  goHomeBtnText.value = cfg.goHomeBtnText
  donkeyPanelTitle.value = cfg.donkeyPanelTitle
  donkeyOptionList.value = cfg.donkeyOptionList
  sortPanelTitle.value = cfg.sortPanelTitle
  sortDescText.value = cfg.sortDescText
  sortLabelFirst.value = cfg.sortLabelFirst
  sortLabelThen.value = cfg.sortLabelThen
  sortLabelAgain.value = cfg.sortLabelAgain
  sortLabelLast.value = cfg.sortLabelLast
  sortTipText.value = cfg.sortTipText
  submitSortBtnText.value = cfg.submitSortBtnText
  paperStepList.value = cfg.paperStepList
  maxRetryCount.value = cfg.maxRetryCount
}

// 拖拽逻辑
let dragTarget: {id:string, text:string} | null = null
const handleDragStart = (e: DragEvent, step: {id:string, text:string}) => {
  dragTarget = step
}
const handleDrop = (slotKey:string)=>{
  if(!dragTarget) return
  sortResult.value[slotKey] = dragTarget.text
  if(!usedStepIds.value.includes(dragTarget.id)){
    usedStepIds.value.push(dragTarget.id)
  }
  dragTarget = null
  saveStatus()
}

// 选择题点击
const selectDonkeyOption = async (item: {id:string, label:string}) => {
  selectDonkeyRes.value = item.id
  await new Promise(resolve=>setTimeout(resolve,100))
  const mockResp = {
    isCorrect: item.id === 'opt2',
    talkText: item.id === 'opt2' ? '回答正确！真棒，我们继续来看看古代造纸的工序吧。' : '这个答案不对哦，再想一想吧！'
  }
  talkText.value = mockResp.talkText
  if(mockResp.isCorrect) {
    setTimeout(()=>{
      currentScene.value = 'paper-sort'
      saveStatus()
    }, 2000)
  }
  saveStatus()
}

// 排序提交校验
const checkPaperSort = async () => {
  await new Promise(resolve=>setTimeout(resolve,100))
  const mockRight = {
    first:"把树皮、麻头、破布、旧渔网剪碎或切断",
    then:"浸在水里捣烂成浆",
    again:"把浆捞出来",
    last:"晒干"
  }
  const isCorrect = sortResult.value.first === mockRight.first
    && sortResult.value.then === mockRight.then
    && sortResult.value.again === mockRight.again
    && sortResult.value.last === mockRight.last

  let mockResp
  if(isCorrect){
    mockResp = {
      isCorrect:true,
      talkText:"排序完全正确！太厉害了！",
      currentErrorCount: currentErrorCount.value
    }
  }else{
    currentErrorCount.value +=1
    if(currentErrorCount.value < maxRetryCount.value){
      mockResp = {
        isCorrect:false,
        talkText:"你这个顺序不对哦，如果你没有讲清楚，大家的劳动会浪费哦，你还有一次机会，请再仔细阅读课文第四自然段。",
        currentErrorCount: currentErrorCount.value
      }
    }else{
      mockResp = {
        isCorrect:false,
        talkText:"修改机会已用完，仔细对照课文重新梳理步骤吧。",
        currentErrorCount: currentErrorCount.value
      }
    }
  }
  talkText.value = mockResp.talkText
  currentErrorCount.value = mockResp.currentErrorCount

  if(mockResp.isCorrect){
    setTimeout(()=>{
      currentScene.value = 'finish-page'
      saveStatus()
    },2000)
  }
  saveStatus()
}

const showContinueBtn = ref(false)
const continueCountdown = ref(20)
const nextPaperStep = () => {
  talkText.value = '跳过当前，进入下一环节'
  setTimeout(()=>{
    currentScene.value = 'finish-page'
    saveStatus()
  },2000)
}

// 通用方法
const mockVoice = () => {
  talkText.value = ''
  nextTick(()=>{
    talkText.value = '模拟语音播报话术'
  })
}
const playBubbleAudio = () => {
  console.log('执行语音播放逻辑')
}
const goHome = () => router.push('/')
const goBack = () => {
  saveStatus()
  router.back()
}

// 生命周期
onMounted(async () => {
  loadLocalStatus()
  await loadPageConfig()
  updateScale()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  saveStatus()
})
</script>

<style scoped>
.page-container {
  width: 1920px;
  height: 1080px;
  background-color: #000;
  position: relative;
  overflow: hidden;
}
.video-freeze-layer{
  position:absolute;
  inset:0;
  z-index:2;
}
.freeze-img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.answer-mask{
  position:absolute;
  inset:0;
  background-color:rgba(0,0,0,0.45);
  z-index:4;
}
.eval-overlay{
  position:absolute;
  inset:0;
  z-index:99;
}
.eval-bg-img{
  width:100%;
  height:100%;
  object-fit:cover;
  position:absolute;
  inset:0;
}
.eval-popup-wrap{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
}
.eval-popup{
  background:#fff;
  padding:32px;
  border-radius:12px;
  min-width:420px;
}
.eval-close-btn{
  margin-top:20px;
  padding:8px 24px;
  cursor:pointer;
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
.nav-title {
  flex: 1;
}
.top-nav-buttons {
  display: flex;
  gap: 12px;
}
.nav-btn {
  width: 120px;
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
.left-area {
  position: absolute;
  top: 170px;
  left: 60px;
  bottom: 20px;
  width: 500px;
  z-index: 5;
}
.digital-human-area {
  position: absolute;
  left: 230px;
  bottom: 30px;
}
.scene-donkey {
  position: absolute;
  top: -530px;
  left: -120px;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.scene-donkey .bubble-action-wrap {
    position: absolute;
    left: 190px;
    top: 20px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 19px;
}
.scene-paper {
  position: absolute;
  top: -600px;
  left: 220px;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.scene-paper .bubble-action-wrap {
    position: absolute;
    left: 190px;
    top: 20px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 19px;
}
.digital-human-img {
  width: 200px;
  height: 540px;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.bubble-action-wrap {
  position: absolute;
  left: 190px;
  top: 20px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 19px;
}
.human-talk-bubble {
  position: relative;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.bubble-text {
  flex: 1;
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
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid #fff;
}
.continue-btn {
  margin-top: 20px;
  padding: 12px 32px;
  background: #F7D76B;
  border: none;
  border-radius: 8px;
  font-size: 22px;
  cursor: pointer;
}
.completion-action-bar {
  width:100%;
  display:flex;
  gap:12px;
}
.bar-btn-icon {
  width:18px;
  height:18px;
  object-fit:contain;
}
.completion-action-btn {
  flex:1;
  height:44px;
  border:none;
  border-radius:22px;
  font-size:16px;
  cursor:pointer;
  transition:all 0.2s;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
}
.report-btn {
  background:#daa520;
  color:#ffffff;
}
.report-btn:hover {
  background:#c4941c;
}
.home-btn {
  background:#ffffff;
  color:#daa520;
  border:1px solid #daa520;
}
.home-btn:hover {
  background:#fff8e6;
}

.right-container-donkey {
  position: absolute;
  top: 480px;
  right: 400px;
  width: 600px;
  z-index: 10;
}
.question-panel {
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid #e69e03;
  border-radius: 12px;
  padding: 24px;
}

.right-container-paper {
  position: absolute;
  top: 150px;
  right: 125px;
  width: 630px;
  z-index: 10;
}
.sort-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #f2bc2b;
  border-radius: 12px;
  padding: 24px;
}

.panel-title {
  padding: 0 0 12px 0;
  font-size: 24px;
  font-weight: bold;
  color:#222;
  margin-bottom: 8px;
}

.option-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.option-item {
  padding: 12px;
  background: #e69e03;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  margin: 10px 4px;
}
.option-item:hover {
  background: #f7d76b;
  color: #000;
}
.sort-desc {
  font-size:17px;
  color:#222222;
  margin-bottom:30px;
}
.sort-row {
  display: flex;
  align-items: center;
  margin: 14px 0;
  gap:12px;
}
.sort-label {
  min-width: 90px;
  padding:4px 10px;
  background:#f6f4db;
  border-radius:20px;
  font-size: 20px;
  text-align:center;
  color:#c98805;
}
.sort-input-box {
  flex: 1;
  min-height: 48px;
  border: 1px dashed #e77111;
  border-radius: 8px;
  padding: 0 14px;
  line-height: 48px;
  box-sizing: border-box;
}
/* 和drag-item完全相同样式 */
.sort-item {
  padding: 10px 18px;
  background: #f6f4db;
  border:none;
  border-radius: 24px;
  cursor: grab;
  font-size: 17px;
  color:#c98805;
}
.tip-text {
  margin:20px 0 30px 20px;
  font-size:17px;
  color:#222;
}
.drag-source-box {
  border: 1px dashed #c98805;
  padding: 18px;
  border-radius: 12px;
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 17px;
}
.drag-item {
  padding: 10px 18px;
  background: #f6f4db;
  border:none;
  border-radius: 24px;
  cursor: grab;
  font-size: 17px;
  color:#c98805;
}
.drag-item:active{
  background:#b8860b;
  color:#ffffff;
}
.submit-sort-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  margin-top: 28px;
  width:300px;
  padding: 14px 0;
  background: #ffdd67;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-sort-btn.disabled,
.submit-sort-btn:disabled {
  background:#e4e2e2;
  color:#b7b3b3;
  cursor:not-allowed;
}
</style>