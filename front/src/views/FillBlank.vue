<template>
  <ScaleCanvas background="/image/image 110.png">
    <PageHeader
      title="寻找文化：初步感悟"
      @back="goBack"
      voice-broadcast
      :voice-on="voiceBroadcastOn"
      @toggle-voice="playVoiceBroadcast"
      @video="openVideoModal"
    />

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

    <!-- 左侧区域：数字人 + 对话框 或 课文内容【复用组件】 -->
    <div class="left-area">
      <DigitalHumanBubble
        v-if="currentPanel === 'human' && !isAllCompleted"
        :image="'/image/小小_汉服 1.png'"
        :talk-text="talkText"
        :is-expanded="isBubbleExpanded"
        @play-bubble-audio="playBubbleAudio"
      >
        <template #feedback>
          <CompletionFeedback
            :show="isAllCompleted"
            :message="completionMessage"
            @go-report="goToReport"
            @go-home="goHome"
            @play-audio="playBubbleAudio"
          />
        </template>
      </DigitalHumanBubble>

      <ArticleReader
        v-if="currentPanel === 'lesson'"
        :visible="currentPanel === 'lesson'"
        :htmlContent="currentArticleContent"
        @close="closeArticle"
      />
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

        <!-- 可见的题目块：答完一道再显示下一道 -->
        <transition-group name="block-fade" tag="div" class="blocks-container">
          <div
            v-for="(block, bIdx) in visibleBlocks"
            :key="block.id"
            class="question-block"
            :class="{ 'current-block': block.id === activeBlockId }"
          >
            <div class="block-title">{{ block.title }}</div>
            <div class="sentence-line">
              <span v-for="(item, idx) in getRenderSentence(block.id)" :key="bIdx + '-' + idx">
                <span v-if="item.type === 'text'">{{ item.content }}</span>
                <span
                  v-if="item.type === 'input'"
                  class="fill-input-wrap"
                  :class="{
                    'input-correct': getBlankStatus(block.id, item.blankIndex!) === 'correct',
                    'input-wrong': getBlankStatus(block.id, item.blankIndex!) === 'wrong',
                    'input-autofilled': getBlankStatus(block.id, item.blankIndex!) === 'auto-filled',
                    'input-locked': isBlankLocked(block.id, item.blankIndex!)
                  }"
                  @click="onBlankClick(block.id, item.blankIndex!)"
                >
                  <input
                    v-if="!isBlankLocked(block.id, item.blankIndex!)"
                    ref="fillInputs"
                    :data-blank-index="item.blankIndex"
                    :data-block-id="block.id"
                    v-model="blankInputMap[block.id][item.blankIndex!]"
                    class="fill-input"
                    @keyup.enter="submitBlank(block.id, item.blankIndex!)"
                    placeholder="点击输入"
                  />
                  <span v-else class="locked-text" :class="{ 'locked-correct': getBlankStatus(block.id, item.blankIndex!) === 'correct', 'locked-autofilled': getBlankStatus(block.id, item.blankIndex!) === 'auto-filled' }">
                    {{ getBlankShowText(block.id, item.blankIndex!) || '点击输入' }}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </transition-group>
        <!-- 提交中提示：无背景、无边框 -->
        <div v-if="isSubmitting" class="submitting-hint">提交中…</div>
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

  </ScaleCanvas>

  <!-- 完成态：放在 ScaleCanvas 之外（视口级），fixed 相对视口、z-index 盖住整页含 header -->
  <CompletionOverlay :show="isAllCompleted">
      <div class="left-area">
        <DigitalHumanBubble
          :image="'/image/小小_汉服 1.png'"
          :talk-text="talkText"
          :is-expanded="isBubbleExpanded"
          @play-bubble-audio="playBubbleAudio"
        >
          <template #feedback>
            <CompletionFeedback
              :show="isAllCompleted"
              :message="completionMessage"
              @go-report="goToReport"
              @go-home="goHome"
            />
          </template>
        </DigitalHumanBubble>
      </div>
    </CompletionOverlay>

  <!-- 回看视频弹窗 -->
  <VideoModal v-model:show="showVideoModal" :url="apiParams?.introVideo?.url || ''" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import ScaleCanvas from '../components/ScaleCanvas.vue'
import PageHeader from '../components/PageHeader.vue'
import CompletionOverlay from '../components/CompletionOverlay.vue'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { lessonSource } from '../utils/lessonText'
import DigitalHumanBubble from '../components/DigitalHumanBubble.vue'
import CompletionFeedback from '../components/completion/CompletionFeedback.vue'
import VideoModal from '../components/VideoModal.vue'
import { useCompletionNav } from '../components/completion/useCompletionNav'
import ArticleReader from '../components/ArticleReader.vue'
import { getInitialInsightParams, getInitialInsightState, submitInitialInsight, getInitialInsightSubmitResult, getInitialInsightEnding , toUserFriendlyError } from '../api'
import { useCompletionPersistence } from '../composables/useCompletionPersistence'
import type { InitialImpressionsParams, InitialInsightState } from '../types'

const router = useRouter()
const rightContainerRef = ref<HTMLElement | null>(null)

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

// ========== Tab课文标签 ==========
const tabList = ref([
  { id: 'bridge', name: '赵州桥' },
  { id: 'painting', name: '一幅名扬中外的画' }
])

const articleContents: Record<string, string> = {
  bridge: lessonSource.zhaozhouqiao.html,
  painting: lessonSource.famous_painting.html
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

const talkText = ref('')
const conversationHistory = ref<Array<{ role: string; text: string }>>([])

const apiParams = ref<InitialImpressionsParams | null>(null)
const apiState = ref<InitialInsightState | null>(null)

// 提交中状态：回车提交时显示「提交中…」提示（无背景无边框）
const isSubmitting = ref(false)

const currentGuideText = computed(() => apiParams.value?.introBubbleText || '')

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

// 可见的题目块：已完成的 + 当前激活的（初始只显示第一道，答完一道后显示下一道）
const visibleBlocks = computed(() => {
  const blocks: BlockItem[] = []
  for (const b of blockList.value) {
    if (blockPassedMap[b.id] || b.id === activeBlockId.value) {
      blocks.push(b)
    }
  }
  return blocks
})

// 是否全部完成
const isAllCompleted = computed(() => blockList.value.every(b => blockPassedMap[b.id]))

// ========== 本地答题缓存（跨刷新持久化）==========
const {
  markCompleted: markFillBlankCompleted,
  loadProgress: loadFillBlankProgress,
  saveProgress: saveFillBlankProgress,
  isCompleted: isFillBlankCompleted,
} = useCompletionPersistence('fill-blank')

interface FillBlankSnapshot {
  blankInputMap: Record<string, string[]>
  blankStatusMap: Record<string, string[]>
  blankAttemptCount: Record<string, number[]>
  autoFilledMap: Record<string, boolean[]>
  blockAttemptMap: Record<string, number>
  blockPassedMap: Record<string, boolean>
}

const buildFillBlankSnapshot = (): FillBlankSnapshot => ({
  blankInputMap: JSON.parse(JSON.stringify(blankInputMap)),
  blankStatusMap: JSON.parse(JSON.stringify(blankStatusMap)),
  blankAttemptCount: JSON.parse(JSON.stringify(blankAttemptCount)),
  autoFilledMap: JSON.parse(JSON.stringify(autoFilledMap)),
  blockAttemptMap: { ...blockAttemptMap },
  blockPassedMap: { ...blockPassedMap }
})

const applyFillBlankSnapshot = (snap: FillBlankSnapshot | null): boolean => {
  if (!snap) return false
  ;(['blankInputMap', 'blankStatusMap', 'blankAttemptCount', 'autoFilledMap', 'blockAttemptMap', 'blockPassedMap'] as const).forEach(key => {
    const src = snap[key] as Record<string, unknown>
    const targets: Record<string, unknown> = {
      blankInputMap, blankStatusMap, blankAttemptCount, autoFilledMap, blockAttemptMap, blockPassedMap
    }
    const target = targets[key] as Record<string, unknown>
    Object.keys(src).forEach(k => { target[k] = src[k] })
  })
  return true
}

// 答题状态变化即存（输入/判定/通过情况），刷新后原样恢复
watch(
  () => [
    JSON.stringify(blankInputMap), JSON.stringify(blankStatusMap),
    JSON.stringify(autoFilledMap), JSON.stringify(blockPassedMap)
  ],
  () => { saveFillBlankProgress(buildFillBlankSnapshot() as unknown as Record<string, unknown>) }
)

const completionMessage = computed(() => {
  return '太棒啦！你已经掌握了围绕一个意思把一段话写清楚的阅读方法！'
})

// 是否允许提交按钮：当前激活块所有填空全部正确或已自动填入
const canSubmit = computed(() => {
  if (!activeBlockId.value) return false
  const statusArr = blankStatusMap[activeBlockId.value]
  return statusArr.every(s => s === 'correct' || s === 'auto-filled')
})

// 解析句子，把【BLANKx】转为渲染节点（通用函数）
const getRenderSentence = (blockId: string) => {
  const block = blockList.value.find(b => b.id === blockId)
  if (!block) return []
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
 * 已完成的题目块的所有填空框都锁定
 */
const isBlankLocked = (blockId:string, idx:number) => {
  // 如果整个题目块已完成，所有填空框都锁定
  if (blockPassedMap[blockId]) return true
  // 否则检查前面是否有未完成的填空
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
const submitBlank = async (blockId: string, blankIndex: number) => {
  if (isSubmitting.value) return
  const block = blockList.value.find(b => b.id === blockId)
  if (!block) return
  const userVal = blankInputMap[blockId][blankIndex].trim()
  if (!userVal) return

  blankAttemptCount[blockId][blankIndex] += 1
  blockAttemptMap[blockId] += 1
  isSubmitting.value = true

  try {
    // Find API question for this block
    const questionIdx = blockList.value.findIndex(b => b.id === blockId)
    const apiQuestion = apiState.value?.questions[questionIdx]

    if (apiQuestion) {
      // 后端要求 blankId 为题目 content 中填空项的真实 id（如 b1/b2…），
      // 不能用前端自造的 blank-{n}，否则会 400 QUESTION_NOT_FOUND。
      const blankItems = ((apiQuestion.content as Array<{ type?: string; id?: string }>) || [])
        .filter((c) => c && c.type === 'blank')
      const blankId = blankItems[blankIndex]?.id || `blank-${blankIndex}`
      const { submitId } = await submitInitialInsight(apiQuestion.id, blankId, userVal)

      // Poll for result
      let result = null
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000))
        result = await getInitialInsightSubmitResult(apiQuestion.id, submitId)
        if (!result.isProcessing) break
      }

      if (result && result.isPassed) {
        blankStatusMap[blockId][blankIndex] = 'correct'
        conversationHistory.value.push({ role: 'student', text: `填空${blankIndex + 1}: ${userVal}` })
        talkText.value = result.feedback || '回答正确，请继续填写下一个关键词！'
        playAudio(talkText.value)
      } else if (result) {
        // Wrong answer
        blankInputMap[blockId][blankIndex] = ''
        if (blankAttemptCount[blockId][blankIndex] >= MAX_WRONG_ATTEMPTS) {
          blankStatusMap[blockId][blankIndex] = 'auto-filled'
          autoFilledMap[blockId][blankIndex] = true
          blankInputMap[blockId][blankIndex] = result.referenceAnswer || block.blanks[blankIndex].answer
          talkText.value = result.feedback || `这个填空的正确答案是"${result.referenceAnswer}"。`
          playAudio(talkText.value)
        } else {
          blankStatusMap[blockId][blankIndex] = 'wrong'
          currentPanel.value = 'human'
          talkText.value = result.feedback || '回答不正确，请再仔细读一读课文。'
          playAudio(talkText.value)
        }
      }
    }

    // Check if block is complete
    const allOk = blankStatusMap[blockId].every(s => s === 'correct' || s === 'auto-filled')
    if (allOk) {
      blockPassedMap[blockId] = true
    }
    updateSubmitBtnPosition()
  } catch (e) {
    console.error('提交失败:', e)
    // Fallback to local validation if API fails
    const realAnswer = block.blanks[blankIndex].answer.trim()
    const isCorrect = userVal === realAnswer
    if (isCorrect) {
      blankStatusMap[blockId][blankIndex] = 'correct'
    } else {
      blankInputMap[blockId][blankIndex] = ''
      if (blankAttemptCount[blockId][blankIndex] >= MAX_WRONG_ATTEMPTS) {
        blankStatusMap[blockId][blankIndex] = 'auto-filled'
        autoFilledMap[blockId][blankIndex] = true
        blankInputMap[blockId][blankIndex] = realAnswer
      } else {
        blankStatusMap[blockId][blankIndex] = 'wrong'
      }
    }
  }
  finally {
    isSubmitting.value = false
  }
}

// ========== 提交按钮：切换下一课 ✅修复硬编码映射 ==========
const handleSubmitAll = async () => {
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
    talkText.value = '很好，我们继续练习，体会写清楚一段话的技巧。'
    playAudio(talkText.value)
    updateSubmitBtnPosition()
  }
  // 全部完成
  if(isAllCompleted.value){
    try {
      const ending = await getInitialInsightEnding()
      talkText.value = ending.comment
      playAudio(ending.comment)
    } catch (e) {
      console.error('获取结束语失败:', e)
    }
  }
}

// ========== 语音（复用 composable） ==========
const { isPlaying, playAudio, stop, playBubbleAudio: _playBubbleAudio } = useAudioPlayer()
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  if (talkText.value) playAudio(talkText.value)
}
watch(talkText, ()=>{
  isBubbleExpanded.value = false
}, {immediate:false})

watch(isAllCompleted, async (val) => {
  if (val) {
    // 写入本地完成态（含答题快照），刷新仍停留在完成屏；首页「初步感悟」变绿
    markFillBlankCompleted(buildFillBlankSnapshot() as unknown as Record<string, unknown>)
    const { useProgressStore } = await import('../stores/progress')
    useProgressStore().markTaskFinished('fill-blank')
    try {
      const ending = await getInitialInsightEnding()
      talkText.value = ending.comment
      playAudio(ending.comment)
    } catch (e) {
      console.error('获取结束语失败:', e)
    }
  }
})

// ========== 顶部导航功能 ==========
// 语音播报开关：开启时播报当前数字人引导语，关闭时停止（与 PromoteCulture 创作页一致）
const voiceBroadcastOn = ref(true)
const playVoiceBroadcast = () => {
  voiceBroadcastOn.value = !voiceBroadcastOn.value
  if (voiceBroadcastOn.value) {
    if (talkText.value) playAudio(talkText.value)
  } else {
    stop()
  }
}
// 回看视频：打开视频弹窗，播放后端 params.introVideo.url
const showVideoModal = ref(false)
const openVideoModal = () => {
  showVideoModal.value = true
}

// 导航
const goBack = ()=>{
  router.push('/')
}
const { goToReport, goHome } = useCompletionNav()

watch([()=>blankInputMap, currentPanel], ()=>{
  updateSubmitBtnPosition()
}, {deep:true})

onMounted(async () => {
  try {
    const [params, state] = await Promise.all([
      getInitialInsightParams(),
      getInitialInsightState()
    ])
    apiParams.value = params
    apiState.value = state
    talkText.value = params.introBubbleText
    // Map API questions to blocks if possible, or keep existing block structure
    // but use API for submit/validation
    if (!isAllCompleted.value && isFillBlankCompleted()) {
      // 本地已完成（后端未落库/数据不全）→ 以本地快照为准，停留在完成屏
      applyFillBlankSnapshot(loadFillBlankProgress<Record<string, unknown>>() as unknown as FillBlankSnapshot)
    }
    if (!isAllCompleted.value) {
      setTimeout(() => playAudio(params.introBubbleText), 500)
    }
    updateSubmitBtnPosition()
  } catch (e) {
    console.error('加载初步感悟数据失败:', e)
    // 后端不可用：用本地快照兜底恢复答题记录/完成态
    if (!applyFillBlankSnapshot(loadFillBlankProgress<Record<string, unknown>>() as unknown as FillBlankSnapshot)) {
      talkText.value = toUserFriendlyError(e)
    } else if (!isAllCompleted.value) {
      talkText.value = '后端服务暂不可用，已恢复你之前的答题记录。'
    }
  }
})
</script>

<style scoped>


/* ========== 顶部导航【和写写感想完全复用】 ========== */
/* ========== Tab标签【完全复用】 ========== */
.tab-wrapper {
  position: absolute;
  top: 130px;
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
  left: 2.5%;
  bottom: 20px;
  width: 47%;
  z-index: 5;
}

/* ========== 右侧填空面板 ========== */
.right-container {
  position: absolute;
  top: 170px;
  right: 2.5%;
  width: 47%;
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

.blocks-container {
  position: relative;
}

.block-fade-enter-active,
.block-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.block-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.block-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.block-fade-move {
  transition: transform 0.4s ease;
}

.question-block {
  margin-bottom: 18px;
  padding-bottom:14px;
  border-bottom:1px dashed #ddd;
}
.question-block.current-block {
  border-bottom-color: #ee7104;
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

.fill-input-wrap {
  display: inline-block;
  vertical-align: middle;
  margin: 10px 10px 10px 10px;
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
  background:#0ec126;
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
  border:1px solid #8d8a8a;
  border-radius:11px;
  padding:3px 8px;
  font-size:15px;
  width:80px;
  height:36px;
  box-sizing: border-box;
  background:#e9e8e8;
  color:#aca9a9;
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
.fill-input-wrap.input-locked.input-correct .locked-text{
  background:#2a9d3a;
  color:#fff;
  border-color:#1e7a2a;
}
.fill-input-wrap.input-locked.input-autofilled .locked-text{
  background:#ffd54f;
  color:#5d4037;
  border-color:#f9a825;
}

.reference-answer {
  margin-top:10px;
  padding: 10px 14px;
  background: #e3f2fd;
  border-radius: 10px;
  border-left: 3px solid #1976d2;
}

/* 提交中提示：无背景、无边框，仅文字 + 轻微呼吸动画 */
.submitting-hint {
  margin-top: 12px;
  padding: 4px 0;
  background: transparent;
  border: none;
  color: #ee7104;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
  animation: submittingPulse 1.1s ease-in-out infinite;
}
@keyframes submittingPulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
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

/* 提交按钮：紧跟答题框正下方 0.5cm，宽度与答题框一致 */
.submit-lesson-btn {
  position: absolute;
  right: 2.5%;
  width: 47%;
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
  box-sizing: border-box;
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

.completion-feedback-bubble {
  position: relative;
  width: 100%;
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
  position: relative;
  width: 100%;
  display: flex;
  gap: 12px;
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
</style>