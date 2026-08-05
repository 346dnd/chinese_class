<template>
  <div class="page-container" :style="pageStyle">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="back-icon" @click="goBack">&lt;</span>
      <span class="nav-title">寻找文化：初步感悟</span>
      <div class="top-nav-buttons">
        <div class="nav-btn" @click="mockVoice">
          <img src="/image/语音 1.png" alt="开启语音" class="btn-icon" />
          语音播报
        </div>
        <div class="nav-btn" @click="mockVideo">
          <img src="/image/视频 2.png" alt="回看视频" class="btn-icon" />
          回看视频
        </div>
      </div>
    </div>

    <!-- 课文标签切换 -->
    <div class="tab-wrapper">
      <div
        v-for="(tab, idx) in tabList"
        :key="tab.id"
        class="tab-item"
        :class="getTabClass(tab.id)"
        @click="handleTabClick(tab.id)"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 左侧区域：数字人 + 对话框 或 课文内容【完全copy写写感想】 -->
    <div class="left-area">
      <div class="digital-human-area" v-if="currentPanel === 'human'">
        <img
          src="/image/小小_汉服 1.png"
          alt="数字人"
          class="digital-human-img"
        />
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

        <div class="completion-feedback-bubble" v-if="isAllCompleted">
          <div class="feedback-message">{{ completionMessage }}</div>
          <span class="bubble-arrow"></span>
        </div>
        <div class="completion-action-bar" v-if="isAllCompleted">
          <button class="completion-action-btn report-btn" @click="goToReport">查看评价</button>
          <button class="completion-action-btn home-btn" @click="goHome">回到首页</button>
        </div>
      </div>

      <div class="article-close-btn" v-if="currentPanel === 'lesson'" @click="closeArticle">×</div>
      <div class="article-panel" v-if="currentPanel === 'lesson'">
        <div class="article-content">
          <h3 class="article-title">{{ currentTabName }}</h3>
          <div class="article-body" v-html="currentArticleContent"></div>
        </div>
      </div>
    </div>

    <!-- 右侧答题容器：填空题型 -->
    <div class="right-container" ref="rightContainerRef">
      <div class="fill-blank-modal">
        <h3 class="modal-title">
          初步感悟
          <img
            src="/image/语音朗读.png"
            alt="语音"
            class="title-voice-icon"
            @click="playAudio(currentGuideText)"
          />
        </h3>
        <p class="guide-desc">{{ currentGuideText }}</p>

        <!-- 已完成的题目块 -->
        <div
          v-for="(block, bIdx) in completedBlocks"
          :key="'block-' + block.id"
          class="completed-block"
        >
          <div class="block-title">{{ block.title }}</div>
          <div class="sentence-line" v-html="renderSentence(block)"></div>
        </div>

        <!-- 当前激活答题块 -->
        <div class="current-block" v-if="activeBlockId">
          <div class="block-title">{{ getBlockTitle(activeBlockId) }}</div>
          <div class="sentence-line">
            <span v-for="(item, idx) in currentRenderSentence" :key="'cur-' + idx">
              <span v-if="item.type === 'text'">{{ item.content }}</span>
              <span
                v-if="item.type === 'input'"
                class="fill-input-wrap"
                :class="{
                  'input-correct': getBlankStatus(activeBlockId, item.blankIndex) === 'correct',
                  'input-wrong': getBlankStatus(activeBlockId, item.blankIndex) === 'wrong',
                  'input-autofilled': getBlankStatus(activeBlockId, item.blankIndex) === 'auto-filled',
                  'input-locked': isBlankLocked(activeBlockId, item.blankIndex)
                }"
                @click="onBlankClick(activeBlockId, item.blankIndex)"
              >
                <input
                  v-if="!isBlankLocked(activeBlockId, item.blankIndex)"
                  ref="fillInputs"
                  :data-blank-index="item.blankIndex"
                  v-model="blankInputMap[activeBlockId][item.blankIndex]"
                  class="fill-input"
                  @keyup.enter="submitBlank(activeBlockId, item.blankIndex)"
                  placeholder="点击输入"
                />
                <span v-else class="locked-text" :class="{ 'locked-correct': getBlankStatus(activeBlockId, item.blankIndex) === 'correct', 'locked-autofilled': getBlankStatus(activeBlockId, item.blankIndex) === 'auto-filled' }">
                  {{ getBlankShowText(activeBlockId, item.blankIndex) || '点击输入' }}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!isAllCompleted"
      class="submit-lesson-btn"
      :class="{ 'gold-bg': canSubmit }"
      :style="{ top: submitBtnTop + 'px' }"
      @click="handleSubmitAll"
    >
      <img src="/image/矢量 67.png" alt="箭头" class="btn-arrow-icon" />
      提交答案
    </div>

    <div class="completion-overlay" v-if="isAllCompleted"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rightContainerRef = ref<HTMLElement | null>(null)

// ========== 自适应缩放（和写写感想完全一样） ==========
const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

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

// ========== 提交按钮位置计算 ==========
const submitBtnTop = ref(0)
const updateSubmitBtnPosition = () => {
  nextTick(() => {
    if (rightContainerRef.value) {
      const container = rightContainerRef.value
      const containerTop = container.offsetTop
      const containerHeight = container.offsetHeight
      const gap = 18.9
      submitBtnTop.value = containerTop + containerHeight + gap
    }
  })
}

// ========== 气泡折叠 ==========
const isBubbleExpanded = ref(true)
const hasAutoPlayed = ref(false)

// ========== Tab课文标签 ==========
const tabList = ref([
  { id: 'bridge', name: '赵州桥' },
  { id: 'painting', name: '一幅名扬中外的画' }
])

const articleContents: Record<string, string> = {
  bridge: '《赵州桥》课文文本...',
  painting: '《一幅名扬中外的画》课文文本...'
}

// ========== 填空业务数据 ==========
type BlankItem = {
  answer: string
}
type BlockItem = {
  id: string
  title: string
  sentence: string
  blanks: BlankItem[]
}

// 页面两组填空题目，对应截图
const blockList = ref<BlockItem[]>([
  {
    id: 'block-bridge',
    title: '一、在《赵州桥》的课文中',
    sentence: '作者详细介绍了桥面【BLANK0】上精美的【BLANK1】，把各种【BLANK2】的【BLANK3】写得活灵活现。',
    blanks: [
      { answer: '石栏' },
      { answer: '图案' },
      { answer: '姿态' },
      { answer: '龙' }
    ]
  },
  {
    id: 'block-painting',
    title: '二、在《一幅名扬中外的画》的课文中',
    sentence: '作者先写【BLANK0】，再用上【BLANK1】的修辞手法写来来往往、【BLANK2】的人。',
    blanks: [
      { answer: '店铺' },
      { answer: '排比' },
      { answer: '形态各异' }
    ]
  }
])

const currentTabId = ref('bridge')
const currentPanel = ref<'human' | 'lesson'>('human')

// 用户输入
const blankInputMap = reactive<Record<string, string[]>>({
  'block-bridge': ['', '', '', ''],
  'block-painting': ['', '', '']
})

// 每一个空状态：'' / correct / wrong / auto-filled
const blankStatusMap = reactive<Record<string, string[]>>({
  'block-bridge': ['', '', '', ''],
  'block-painting': ['', '', '']
})
// 每个空的尝试次数（per-blank）
const blankAttemptCount = reactive<Record<string, number[]>>({
  'block-bridge': [0, 0, 0, 0],
  'block-painting': [0, 0, 0]
})
// 系统自动填入标记（黄色样式）
const autoFilledMap = reactive<Record<string, boolean[]>>({
  'block-bridge': [false, false, false, false],
  'block-painting': [false, false, false]
})
// 每块尝试次数（用于整体统计）
const blockAttemptMap = reactive<Record<string, number>>({
  'block-bridge': 0,
  'block-painting': 0
})
// 块是否全部通过
const blockPassedMap = reactive<Record<string, boolean>>({
  'block-bridge': false,
  'block-painting': false
})
// 是否显示参考答案
const showRefMap = reactive<Record<string, boolean>>({
  'block-bridge': false,
  'block-painting': false
})

const talkText = ref('')
const conversationHistory = ref<Array<{ role: string; text: string }>>([])

const currentGuideText = '亲爱的某某某同学，来体会“围绕一个意思把一段话写清楚”的表达方法吧。'

// ========== computed ==========
const currentTabName = computed(() => {
  const tab = tabList.value.find(t => t.id === currentTabId.value)
  return tab ? tab.name : ''
})
const currentArticleContent = computed(() => articleContents[currentTabId.value] || '')

// 当前激活题目块，找第一个没通过的
const activeBlockId = computed(() => {
  for (const b of blockList.value) {
    if (!blockPassedMap[b.id]) return b.id
  }
  return null
})

// 已经完成的块
const completedBlocks = computed(() => {
  return blockList.value.filter(b => blockPassedMap[b.id])
})

// 当前块的尝试次数
const currentBlockAttempts = computed(() => {
  if (!activeBlockId.value) return 0
  return blockAttemptMap[activeBlockId.value]
})

// 当前块提交状态
const currentBlockSubmitStatus = computed(() => {
  if (!activeBlockId.value) return ''
  const arr = blankStatusMap[activeBlockId.value]
  if(arr.includes('wrong')) return 'wrong'
  return ''
})

const showBlockReference = computed(() => {
  if (!activeBlockId.value) return false
  return showRefMap[activeBlockId.value]
})

// 是否全部完成
const isAllCompleted = computed(() => blockList.value.every(b => blockPassedMap[b.id]))

const completionMessage = computed(() => {
  return '太棒啦！你已经掌握了围绕一个意思把一段话写清楚的阅读方法！'
})

// 是否允许提交按钮：当前激活块所有填空全部正确或已自动填入
const canSubmit = computed(() => {
  if (!activeBlockId.value) return false
  const statusArr = blankStatusMap[activeBlockId.value]
  return statusArr.every(s => s === 'correct' || s === 'auto-filled')
})

// 解析句子，把【BLANKx】转为渲染节点
const currentRenderSentence = computed(() => {
  if (!activeBlockId.value) return []
  const block = blockList.value.find(b => b.id === activeBlockId.value)!
  const parts: Array<{ type:'text'|'input'; content?: string; blankIndex?: number }> = []
  const regex = /【BLANK(\d+)】/g
  let lastIdx = 0
  let match
  while ((match = regex.exec(block.sentence)) !== null) {
    parts.push({ type:'text', content:block.sentence.slice(lastIdx, match.index) })
    const blankIdx = Number(match[1])
    parts.push({ type:'input', blankIndex: blankIdx })
    lastIdx = regex.lastIndex
  }
  parts.push({ type:'text', content:block.sentence.slice(lastIdx) })
  return parts
})

// ✅修复：已经完成块的html渲染，入参传完整block，读取本block的autoFilledMap，不要拿activeBlockId
const renderSentence = (block:BlockItem) => {
  let html = block.sentence
  const answers = blankInputMap[block.id]
  for(let i=0;i<answers.length;i++){
    const isAuto = autoFilledMap[block.id]?.[i]
    const cls = isAuto ? 'fill-autofilled' : 'fill-correct'
    html = html.replace(`【BLANK${i}】`,`<span class="fill-static ${cls}">${answers[i]}</span>`)
  }
  return html
}

// ========== 工具函数 ==========
const getBlockTitle = (bid:string) => {
  const b = blockList.value.find(x=>x.id===bid)
  return b?.title || ''
}
const getBlockRefAnswer = (bid:string) => {
  const b = blockList.value.find(x=>x.id===bid)
  if(!b) return ''
  return b.blanks.map(x=>x.answer).join(' / ')
}

const getBlankStatus = (blockId:string, idx:number) => {
  return blankStatusMap[blockId]?.[idx] ?? ''
}
/**
 * 实现需求：上一空没有完成，后面输入框锁定灰色不可输入
 * auto-filled 也算完成（系统自动填入后解锁下一空）
 */
const isBlankLocked = (blockId:string, idx:number) => {
  const arr = blankStatusMap[blockId]
  for(let i=0;i<idx;i++){
    if(arr[i] !== 'correct' && arr[i] !== 'auto-filled') return true
  }
  return false
}
const getBlankShowText = (blockId:string, idx:number) => {
  const arr = blankStatusMap[blockId]
  if(arr[idx]==='correct') return blankInputMap[blockId][idx]
  if(arr[idx]==='auto-filled') return blankInputMap[blockId][idx]
  return ''
}
const isAutoFilled = (blockId:string, idx:number) => {
  return autoFilledMap[blockId]?.[idx] ?? false
}
const getBlankAttempts = (blockId:string, idx:number) => {
  return blankAttemptCount[blockId]?.[idx] ?? 0
}
// 点击输入框区域时自动聚焦
const onBlankClick = (blockId:string, idx:number) => {
  if(isBlankLocked(blockId, idx)) return
  nextTick(() => {
    const inputs = document.querySelectorAll('.fill-input-wrap:not(.input-locked) .fill-input')
    inputs.forEach((el) => {
      if((el as HTMLInputElement).dataset.blankIndex === String(idx)) {
        ;(el as HTMLInputElement).focus()
      }
    })
  })
}

// tab样式
const getTabClass = (tabId: string) => {
  const idx = tabList.value.findIndex(t => t.id === tabId)
  const isActive = tabId === currentTabId.value
  // 绑定对应block
  const mapTabToBlock:Record<string,string> = {
    bridge:'block-bridge',
    painting:'block-painting'
  }
  const blockId = mapTabToBlock[tabId]
  const isPassed = blockPassedMap[blockId]
  const firstUnpassedBlockIdx = blockList.value.findIndex(b=>!blockPassedMap[b.id])
  const lockTabIndex = tabList.value.findIndex(t=>{
    const bid = mapTabToBlock[t.id]
    return bid === blockList.value[firstUnpassedBlockIdx]?.id
  })
  const isLocked = !isPassed && idx>lockTabIndex

  return {
    'tab-active': isActive && !isLocked,
    'tab-passed': isPassed,
    'tab-locked': isLocked,
    'tab-unlocked': !isLocked && !isActive && !isPassed
  }
}

const handleTabClick = (tabId:string) => {
  const idx = tabList.value.findIndex(t => t.id === tabId)
  const mapTabToBlock:Record<string,string> = {
    bridge:'block-bridge',
    painting:'block-painting'
  }
  const firstUnpassedBlockIdx = blockList.value.findIndex(b=>!blockPassedMap[b.id])
  const lockTabIndex = tabList.value.findIndex(t=>{
    const bid = mapTabToBlock[t.id]
    return bid === blockList.value[firstUnpassedBlockIdx]?.id
  })
  if(idx>lockTabIndex) return

  if(tabId === currentTabId.value){
    openArticle()
  }else{
    switchToTab(tabId)
  }
}

const switchToTab = (tabId:string) => {
  currentTabId.value = tabId
  currentPanel.value = 'human'
  updateSubmitBtnPosition()
  saveState()
}

const openArticle = () => {
  currentPanel.value = 'lesson'
}
const closeArticle = () => {
  currentPanel.value = 'human'
}

// 最大错误次数（达到后自动填入正确答案，便于后端后续调整）
const MAX_WRONG_ATTEMPTS = 2

// ========== 填空提交单个空 ==========
const submitBlank = async (blockId:string, blankIndex:number) => {
  const block = blockList.value.find(b=>b.id===blockId)
  if(!block) return
  const userVal = blankInputMap[blockId][blankIndex].trim()
  if(!userVal) return

  blankAttemptCount[blockId][blankIndex] += 1
  blockAttemptMap[blockId] += 1
  const realAnswer = block.blanks[blankIndex].answer.trim()
  const isCorrect = userVal === realAnswer

  if(isCorrect){
    blankStatusMap[blockId][blankIndex] = 'correct'
    conversationHistory.value.push({role:'student', text:`填空${blankIndex+1}:${userVal}`})
    talkText.value = '回答正确，请继续填写下一个关键词！'
    playAudio(talkText.value)
  }else{
    // 不显示错误答案，清空输入框
    blankInputMap[blockId][blankIndex] = ''

    if(blankAttemptCount[blockId][blankIndex] >= MAX_WRONG_ATTEMPTS){
      // 达到最大错误次数：AI自动填入正确答案（黄色样式）
      blankStatusMap[blockId][blankIndex] = 'auto-filled'
      autoFilledMap[blockId][blankIndex] = true
      blankInputMap[blockId][blankIndex] = realAnswer
      const explainText = `这个填空的正确答案是"${realAnswer}"。请对照课文理解这个关键词的用法。`
      talkText.value = explainText
      playAudio(explainText)
    }else{
      // 第一次错误：红色提示，AI讲解
      blankStatusMap[blockId][blankIndex] = 'wrong'
      currentPanel.value = 'human'
      const feedbackText = `回答不正确，请再仔细读一读课文，重新填写。你还有 ${MAX_WRONG_ATTEMPTS - blankAttemptCount[blockId][blankIndex]} 次机会。`
      talkText.value = feedbackText
      playAudio(feedbackText)
    }
  }

  // 检查本块是否全部完成
  const allOk = blankStatusMap[blockId].every(s=>s==='correct' || s==='auto-filled')
  if(allOk){
    blockPassedMap[blockId] = true
  }
  saveState()
  updateSubmitBtnPosition()
}

// ========== 提交按钮：切换下一课 ✅修复硬编码映射 ==========
const handleSubmitAll = () => {
  if(!canSubmit.value) return
  const nextBid = activeBlockId.value
  if(!nextBid) return

  const idx = blockList.value.findIndex(b=>b.id === nextBid)
  // 还有下一题
  if(idx+1 < blockList.value.length){
    const nextBlock = blockList.value[idx+1]
    // block-id -> tab-id
    const blockToTab:Record<string,string> = {
      'block-bridge':'painting',
      'block-painting':'painting'
    }
    currentTabId.value = blockToTab[nextBlock.id]
    currentPanel.value = 'human'
    const text = fetchTalkText(nextBlock.id)
    talkText.value = text
    playAudio(text)
    updateSubmitBtnPosition()
    saveState()
  }
  // 全部完成
  if(isAllCompleted.value){
    talkText.value = '太棒啦！你已经完成全部填空练习。'
    playAudio(talkText.value)
    saveState()
  }
}

// ========== 语音 ==========
const playAudio = (text:string) => {
  console.log('播放TTS语音', text)
}
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  if(talkText.value) playAudio(talkText.value)
}
watch(talkText, ()=>{
  isBubbleExpanded.value = false
}, {immediate:false})

const mockVoice = ()=>{}
const mockVideo = ()=>{}

const fetchTalkText = async (blockId:string):Promise<string>=>{
  const map:Record<string,string> = {
    'block-bridge':'亲爱的某某同学，我们来梳理“围绕一个意思把一段话写清楚”的表达方法吧。你可以点击课文名称打开课文哦。',
    'block-painting':'很好，我们继续练习，体会写清楚一段话的技巧。'
  }
  return map[blockId] || '请完成填空练习。'
}

// ========== 本地持久化保存状态 ==========
const STORAGE_KEY = 'fill-blank-state'
const saveState = () => {
  const state = {
    currentTabId:currentTabId.value,
    currentPanel:currentPanel.value,
    blankInputMap:JSON.parse(JSON.stringify(blankInputMap)),
    blankStatusMap:JSON.parse(JSON.stringify(blankStatusMap)),
    blankAttemptCount:JSON.parse(JSON.stringify(blankAttemptCount)),
    autoFilledMap:JSON.parse(JSON.stringify(autoFilledMap)),
    blockAttemptMap:{...blockAttemptMap},
    blockPassedMap:{...blockPassedMap},
    showRefMap:{...showRefMap},
    talkText:talkText.value,
    conversationHistory:JSON.parse(JSON.stringify(conversationHistory.value)),
    hasAutoPlayed:hasAutoPlayed.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const restoreState = () => {
  const str = localStorage.getItem(STORAGE_KEY)
  if(!str) return false
  try{
    const s = JSON.parse(str)
    currentTabId.value = s.currentTabId || 'bridge'
    currentPanel.value = s.currentPanel || 'human'
    Object.assign(blankInputMap, s.blankInputMap || {})
    Object.assign(blankStatusMap, s.blankStatusMap || {})
    Object.assign(blankAttemptCount, s.blankAttemptCount || {})
    Object.assign(autoFilledMap, s.autoFilledMap || {})
    Object.assign(blockAttemptMap, s.blockAttemptMap || {})
    Object.assign(blockPassedMap, s.blockPassedMap || {})
    Object.assign(showRefMap, s.showRefMap || {})
    talkText.value = s.talkText || ''
    conversationHistory.value = s.conversationHistory || []
    hasAutoPlayed.value = s.hasAutoPlayed || false

    // 如果缓存读到全部任务完成，清空缓存重置
    const allDone = blockList.value.every(b => blockPassedMap[b.id])
    if(allDone) {
      localStorage.removeItem(STORAGE_KEY)
      blockList.value.forEach(b=>{
        blockPassedMap[b.id] = false
        blockAttemptMap[b.id] = 0
        showRefMap[b.id] = false
        blankInputMap[b.id] = b.blanks.map(()=>'')
        blankStatusMap[b.id] = b.blanks.map(()=>'')
        blankAttemptCount[b.id] = b.blanks.map(()=>0)
        autoFilledMap[b.id] = b.blanks.map(()=>false)
      })
      return false
    }
    return true
  }catch{
    localStorage.removeItem(STORAGE_KEY)
    return false
  }
}


// 导航
const goBack = ()=>{
  saveState()
  router.push('/preview/write-feel')
}
const goToReport = ()=>router.push('/report')
const goHome = ()=>{
  saveState()
  router.push('/')
}

watch([()=>blankInputMap, currentPanel], ()=>{
  saveState()
  updateSubmitBtnPosition()
}, {deep:true})

onMounted(async ()=>{
  updateScale()
  window.addEventListener('resize', updateScale)
  const restored = restoreState()
  if(!restored){
    const firstBid = blockList.value[0].id
    const text = await fetchTalkText(firstBid)
    talkText.value = text
    setTimeout(()=>playAudio(text), 500)
    hasAutoPlayed.value = true
    saveState()
  }else if(!hasAutoPlayed.value && talkText.value){
    // ✅修复变量名bug
    setTimeout(()=>playAudio(talkText.value), 500)
    hasAutoPlayed.value = true
    saveState()
  }
  updateSubmitBtnPosition()
})

onUnmounted(()=>{
  window.removeEventListener('resize', updateScale)
  saveState()
})
</script>

<style scoped>
.page-container {
  width: 1920px;
  height: 1080px;
  background: url('/image/image 110.png') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

/* ========== 顶部导航【和写写感想完全复用】 ========== */
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

/* ========== Tab标签【完全复用】 ========== */
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
.tab-item.tab-passed {
  background: #d27f01;
  color: #fff;
  border-color: #d27f01;
}
.tab-item.tab-locked {
  background: #e9e8e8;
  color: #a19d9d;
  border-color: #c5c5c5;
  cursor: not-allowed;
}
.tab-item.tab-unlocked {
  background: #fff;
  color: #333;
  border-color: #ddd;
}

/* ========== 左侧数字人、课文面板【100%复制写写感想】 ========== */
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
.digital-human-area {
  position: absolute;
  left: 80px;
  bottom: 20px;
}
.digital-human-img {
  width: 180px;
  height: auto;
  display: block;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
}
.human-talk-bubble {
  position: absolute;
  left: 190px;
  top: 20px;
  width: 300px;
  background: #fff;
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

/* ========== 右侧填空面板 ========== */
.right-container {
  position: absolute;
  top: 170px;
  right: 70px;
  width: 580px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 18px;
  border-color: #d27f01;
  border-width: 2px;
  border-style: solid;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 20px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.modal-title {
  font-size: 25px;
  font-weight: 600;
  color: #111;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-voice-icon {
  width: 22px;
  height: 22px;
  cursor: pointer;
  object-fit: contain;
}
.guide-desc {
  font-size: 20px;
  color: #333;
  line-height: 1.6;
  margin-bottom:14px;
}

.completed-block {
  margin-bottom: 18px;
  padding-bottom:14px;
  border-bottom:1px dashed #ddd;
}
.block-title {
  font-size:17px;
  font-weight:600;
  color:#121213;
  margin-bottom:8px;
}
.sentence-line {
  font-size:16px;
  line-height:1.8;
}
.fill-static.fill-correct{
  background:#2a9d3a;
  color:#fff;
  border:1px solid #1e7a2a;
  padding:2px 8px;
  border-radius:11px;
  margin:0 4px;
  line-height: 24px;
}
.fill-static.fill-autofilled{
  background:#ffd54f;
  color:#5d4037;
  border:1px solid #f9a825;
  padding:2px 8px;
  border-radius:11px;
  margin:0 4px;
  line-height: 24px;
}

.fill-input-wrap {
  display: inline-block;
  vertical-align: middle;
  margin: 0 4px;
}
.fill-input {
 display: inline-block;
  vertical-align: middle;
  border:1px solid #ee7104;
  border-radius:11px;
  padding:3px 8px;
  font-size:16px;
  width:80px;
  height:36px;
  box-sizing: border-box;
  background:#fff;
  color:#333;
  line-height: 28px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}
.fill-input-wrap.input-correct .fill-input{
  background:#2a9d3a;
  border-color:#1e7a2a;
  color:#fff;
}
.fill-input-wrap.input-wrong .fill-input{
  background:#fde2e2;
  border-color:#b42020;
  color:#b42020;
}
.fill-input-wrap.input-autofilled .fill-input{
  background:#ffd54f;
  border-color:#f9a825;
  color:#5d4037;
}
.fill-input-wrap.input-locked .locked-text{
  display: inline-block;
  vertical-align: middle;
  border:1px solid #ee7104;
  border-radius:11px;
  padding:3px 8px;
  font-size:16px;
  width:80px;
  height:36px;
  box-sizing: border-box;
  background:#cfcece;
  color:#888;
  line-height: 28px;
  text-align:center;
  cursor: not-allowed;
  user-select: none;
}
.fill-input-wrap.input-locked .locked-text.locked-correct{
  background:#2a9d3a;
  color:#fff;
  border-color:#1e7a2a;
}
.fill-input-wrap.input-locked .locked-text.locked-autofilled{
  background:#ffd54f;
  color:#5d4037;
  border-color:#f9a825;
}
.fill-input-wrap.input-autofilled .locked-text{
  background:#ffd54f;
  color:#5d4037;
  border:1px solid #f9a825;
}

.reference-answer {
  margin-top:10px;
  padding: 10px 14px;
  background: #e3f2fd;
  border-radius: 10px;
  border-left: 3px solid #1976d2;
}
.ref-label {
  font-size:13px;
  color:#1976d2;
  font-weight:600;
  margin-bottom:4px;
}
.ref-content {
  font-size:14px;
  color:#333;
}

/* 提交按钮 */
.submit-lesson-btn {
  position: absolute;
  right: 70px;
  width: 580px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  font-size: 16px;
  color: #888;
  cursor: not-allowed;
  transition: background 0.3s;
}
.submit-lesson-btn.gold-bg {
  background: #daa520;
  color: #fff;
  cursor: pointer;
}
.submit-lesson-btn.gold-bg .btn-arrow-icon {
  filter: brightness(0) invert(1);
}
.btn-arrow-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 完成遮罩、数字人反馈气泡，完全复用写写感想 */
.completion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
}
.completion-feedback-bubble {
  position: absolute;
  left: 190px;
  top: 100px;
  width: 300px;
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.feedback-message {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0;
}
.completion-action-bar {
  position: absolute;
  left: 190px;
  top: 280px;
  width: 300px;
  display: flex;
  gap: 12px;
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
.report-btn:hover {
  background: #1e3d8f;
}
.home-btn {
  background: #f7c846;
  color: #fff;
}
.home-btn:hover {
  background: #e5b535;
}
</style>