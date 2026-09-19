<template>
  <ScaleCanvas :background="canvasBackground">
    <!-- 标题栏与其它固定画布页（FillBlank/TalkCulture/HUA）完全一致：作为 ScaleCanvas 子节点，
         跟随画布等比缩放、样式统一；视频层 z-index 低于 sc-page-canvas(z:1)，故标题恒在视频上方 -->
    <PageHeader
      :title="pageTitle"
      @back="goBack"
      voice-broadcast
      :voice-on="voiceBroadcastOn"
      :show-video="true"
      @toggle-voice="playVoiceBroadcast"
      @video="openVideoModal"
    />
  </ScaleCanvas>

  <!-- 互动视频层：自动播放导入视频，到交互节点(第 10 秒 选择题 / 第 20 秒 拖拽排序)自动暂停并弹出对应交互。
       视频始终在最底层(z:0)：标题(sc-page-canvas z:1)与 CompletionOverlay(z:1000+) 均在其上方，交互遮罩能盖住它。 -->
  <div v-if="introVideoUrl" class="intro-video-layer">
    <video
      ref="introVideoEl"
      class="intro-video"
      :src="introVideoUrl"
      playsinline
      @timeupdate="onVideoTimeUpdate"
      @ended="onVideoEnded"
      @error="onVideoError"
    ></video>
    <!-- 结尾页：视频已播放完并暂停，最后一帧作为背景；黑遮罩覆盖视频，数字人+标题在其上方 -->
    <div v-if="currentScene === 'finish-page'" class="video-paused-mask"></div>
    <!-- 返回按钮已移除：重温文化页仅保留顶部 PageHeader 的返回箭头，避免与圆形黑底返回按钮重复 -->
  </div>

  <!-- 黑色遮罩 + 数字人舞台：放在 ScaleCanvas 之外（视口级），fixed 相对视口、z-index 盖住整页含 header -->
  <CompletionOverlay :show="showAnswerMask" :always-render="true">
    <!-- 左侧数字人区域 -->
    <div class="left-area">
      <div class="digital-human-area">
        <div v-show="currentScene === 'donkey-question'" class="scene-donkey">
          <img src="/image/罗罗_汉服 1.png" alt="数字人罗罗" class="digital-human-img" />
          <div class="bubble-action-wrap" v-if="talkText">
            <div class="human-talk-bubble">
              <span class="bubble-text">{{ talkText }}</span>
              <img src="/image/语音朗读.png" alt="播放语音" class="bubble-voice-icon" @click="playBubbleAudio" />
              <span class="bubble-arrow"></span>
            </div>
          </div>
        </div>
        <div v-show="currentScene === 'paper-sort'" class="scene-paper">
          <img src="/image/罗罗_汉服 1.png" alt="数字人罗罗" class="digital-human-img" />
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
            <CompletionFeedback
              :show="true"
              :show-bubble="false"
              :report-text="checkEvalBtnText"
              :home-text="goHomeBtnText"
              @go-report="goToReport"
              @go-home="goHome"
            />
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
    </CompletionOverlay>

    <!-- 回看视频弹窗：播放后端 params.introVideo.url（与其他固定画布页一致） -->
    <VideoModal v-model:show="showVideoModal" :url="apiParams?.introVideo?.url || ''" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ScaleCanvas from '../components/ScaleCanvas.vue'
import PageHeader from '../components/PageHeader.vue'
import VideoModal from '../components/VideoModal.vue'
import CompletionOverlay from '../components/CompletionOverlay.vue'
import CompletionFeedback from '../components/completion/CompletionFeedback.vue'
import { useCompletionNav } from '../components/completion/useCompletionNav'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import {
  getCulturalStyleParams,
  getCulturalStyleState,
  getCulturalStyleEnding,
  getQuickSelectParams,
  submitQuickSelect,
  getDragSortParams,
  getDragSortState,
  submitDragSort,
  getDragSortSubmitResult
, toUserFriendlyError } from '../api'
import { useCompletionPersistence } from '../composables/useCompletionPersistence'
import type { CulturalStyleParams, CulturalStyleState, CSBpDragSortSubmitResult, CSBpQuickSelectParams, CSBpDragSortParams } from '../types'

const router = useRouter()

// 缩放交由 ScaleCanvas 标准自动处理（autoScale 默认 true：挂载即算、随窗口 resize 自动重算）

// 场景与交互状态
const currentScene = ref('')
const sortResult = ref<Record<string, string>>({ first: '', then: '', again: '', last: '' })
// 每个槽位放入的步骤 id（en-1~en-4），提交 answer 时用步骤 id 而非槽位名，供后端按 id 判序
const sortResultIds = ref<Record<string, string>>({ first: '', then: '', again: '', last: '' })
const selectDonkeyRes = ref('')
const usedStepIds = ref<string[]>([])

// ========== 本地答题缓存（跨刷新持久化）==========
const {
  markCompleted: markWarmupCompleted,
  loadProgress: loadWarmupProgress,
  saveProgress: saveWarmupProgress,
  isCompleted: isWarmupCompleted,
} = useCompletionPersistence('warmup-game')

interface WarmupSnapshot {
  currentScene: string
  sortResult: Record<string, string>
  sortResultIds: Record<string, string>
  selectDonkeyRes: string
  usedStepIds: string[]
  currentErrorCount: number
  /** 视频暂停位置（秒）：做题/完成态退出再进时，视频恢复到此时间点暂停 */
  videoTime?: number
}

const buildWarmupSnapshot = (): WarmupSnapshot => ({
  currentScene: currentScene.value,
  sortResult: { ...sortResult.value },
  sortResultIds: { ...sortResultIds.value },
  selectDonkeyRes: selectDonkeyRes.value,
  usedStepIds: [...usedStepIds.value],
  currentErrorCount: currentErrorCount.value,
  videoTime: introVideoEl.value?.currentTime || 0
})

const applyWarmupSnapshot = (snap: WarmupSnapshot | null): boolean => {
  if (!snap) return false
  selectDonkeyRes.value = snap.selectDonkeyRes || ''
  if (snap.sortResult) sortResult.value = { ...snap.sortResult }
  if (snap.sortResultIds) sortResultIds.value = { ...snap.sortResultIds }
  if (Array.isArray(snap.usedStepIds)) usedStepIds.value = [...snap.usedStepIds]
  if (typeof snap.currentErrorCount === 'number') currentErrorCount.value = snap.currentErrorCount
  if (snap.currentScene) currentScene.value = snap.currentScene
  return true
}

// 错误重试计数（需在 watch 之前声明，否则 setup 中 watch getter 即时求值会触发 TDZ）
const currentErrorCount = ref(0)
const maxRetryCount = ref(1)

// 答题状态变化即存（场景推进/选项/排序结果），刷新后原样恢复
watch(
  () => [currentScene.value, selectDonkeyRes.value, JSON.stringify(sortResult.value), JSON.stringify(sortResultIds.value), currentErrorCount.value],
  () => { saveWarmupProgress(buildWarmupSnapshot() as unknown as Record<string, unknown>) }
)

// 离开快选题场景时停止倒计时
watch(currentScene, (scene) => {
  if (scene !== 'donkey-question') stopCountdown()
})

// 遮罩开关：仅在两个答题节点（选择题 第10秒 / 拖拽排序 第20秒）显示黑色遮罩 + 数字人 + 题目。
// 最终"查看评价/回到首页"页不再盖黑遮罩，改为以暂停的视频作背景（数字人/按钮仍由 CompletionOverlay alwaysRender 渲染）。
const showAnswerMask = computed(() => ['donkey-question', 'paper-sort'].includes(currentScene.value))

// 查看评价：统一跳转到学习报告页
const { goToReport, goHome } = useCompletionNav()

// API 数据
const apiParams = ref<CulturalStyleParams | null>(null)
const apiState = ref<CulturalStyleState | null>(null)

// ========== 页面文案变量 ==========
const pageTitle = ref('')
const talkText = ref('')
const finishTalkText = ref('')
const continueBtnText = ref('继续观看')
const checkEvalBtnText = ref('查看评价')
const goHomeBtnText = ref('回到首页')
const countdownNum = ref(15)
const countdownInitial = ref(15)
let countdownTimer: ReturnType<typeof setInterval> | null = null
const currentQuickSelectBpId = ref('')
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

// ========== 互动视频：导入视频自动播放，按时间点弹出交互 ==========
// 交互节点时间轴（秒）：第 10 秒 选择题、第 20 秒 拖拽排序（按需求写死）
const BP_FIRST = 10
const BP_SECOND = 20
// 互动视频固定走 storage(8088) 的 /assets/style-interact.mp4：相对路径，由 dev proxy 的 /assets 转发到 8088
const introVideoUrl = ref('/assets/style-interact.mp4')

// 视频阶段让视频成为唯一背景（ScaleCanvas 背景透明），避免与原背景图割裂；
// 视频缺失/加载出错时回退原背景图（onVideoError 会把 introVideoUrl 清空）
const canvasBackground = computed(() => (introVideoUrl.value ? '' : '/image/image 14.png'))

const introVideoEl = ref<HTMLVideoElement | null>(null)
const paperBubbleText = ref('读一读《纸的发明》第4自然段，把造纸步骤按顺序排好。')
const breakpoints = ref<{ t: number; key: 'donkey-question' | 'paper-sort'; done: boolean }[]>([
  { t: BP_FIRST, key: 'donkey-question', done: false },
  { t: BP_SECOND, key: 'paper-sort', done: false }
])

/** 到达交互节点：暂停视频并弹出对应交互 */
const triggerBreakpoint = (key: 'donkey-question' | 'paper-sort') => {
  introVideoEl.value?.pause()
  if (key === 'donkey-question') {
    currentScene.value = 'donkey-question'
    startCountdown()
    // 视频暂停时让数字人罗罗读出选择题引导语
    if (voiceBroadcastOn.value && talkText.value) playAudio(talkText.value)
  } else if (key === 'paper-sort') {
    talkText.value = paperBubbleText.value
    currentScene.value = 'paper-sort'
  }
}
/** 进入页面即尝试自动播放（带声）；若被浏览器拦截则降级为静音自动播放，
 *  保证视频继续推进、第10秒 / 第20秒 交互节点仍能按时触发。不显示任何播放/暂停按钮。 */
const tryAutoPlay = () => {
  const v = introVideoEl.value
  if (!v) return
  const p = v.play()
  if (p && typeof p.catch === 'function') {
    p.catch(() => {
      v.muted = true
      v.play().catch(() => {})
    })
  }
}
/** 恢复视频到指定时间点并暂停（做题中/完成态退出再进时用）。
 *  等待元数据就绪后 seek；目标时间超过视频总长则落到末尾前一帧（完成页以末帧作背景）。 */
const restoreVideoPaused = async (t: number) => {
  const v = introVideoEl.value
  if (!v) return
  v.pause()
  if (v.readyState < 1) {
    await new Promise<void>((resolve) => {
      const onMeta = () => { v.removeEventListener('loadedmetadata', onMeta); resolve() }
      v.addEventListener('loadedmetadata', onMeta)
      // 元数据加载异常兜底：2s 后仍继续
      setTimeout(resolve, 2000)
    })
  }
  const dur = v.duration && isFinite(v.duration) ? v.duration : 0
  let target = t
  if (dur > 0 && target > dur) target = dur - 0.05
  try { v.currentTime = Math.max(0, target) } catch (_) { /* seek 失败忽略 */ }
  v.pause()
}
const resumeIntroVideo = () => {
  const v = introVideoEl.value
  if (!v) return
  const p = v.play()
  if (p && typeof p.catch === 'function') {
    p.catch(() => { v.muted = true; v.play().catch(() => {}) })
  }
}
const onVideoTimeUpdate = () => {
  const v = introVideoEl.value
  if (!v) return
  const t = v.currentTime
  for (const bp of breakpoints.value) {
    if (!bp.done && t >= bp.t) {
      bp.done = true
      triggerBreakpoint(bp.key)
      break
    }
  }
}
const onVideoEnded = () => {
  // 视频播放完但仍有未触发的交互：直接弹出（避免视频过短导致节点不出现）
  const next = breakpoints.value.find((b) => !b.done)
  if (next) {
    next.done = true
    triggerBreakpoint(next.key)
    return
  }
  if (currentScene.value !== 'finish-page') currentScene.value = 'finish-page'
}
const onVideoError = () => {
  // 视频加载失败：退化为「直接显示选择题」的旧流程，避免卡在播放入口
  if (currentScene.value === '') {
    introVideoUrl.value = '' // 防止再次渲染视频层
    currentScene.value = 'donkey-question'
    startCountdown()
    if (voiceBroadcastOn.value && talkText.value) playAudio(talkText.value)
  }
}

// 提交判断
const isSortAllFilled = computed(()=>{
  return !!sortResult.value.first && !!sortResult.value.then && !!sortResult.value.again && !!sortResult.value.last
})
const canSubmitSort = computed(()=>{
  return isSortAllFilled.value && currentErrorCount.value < maxRetryCount.value
})

// 拖拽逻辑
let dragTarget: {id:string, text:string} | null = null
const handleDragStart = (e: DragEvent, step: {id:string, text:string}) => {
  dragTarget = step
}
const handleDrop = (slotKey:string)=>{
  if(!dragTarget) return
  sortResult.value[slotKey] = dragTarget.text
  sortResultIds.value[slotKey] = dragTarget.id
  if(!usedStepIds.value.includes(dragTarget.id)){
    usedStepIds.value.push(dragTarget.id)
  }
  dragTarget = null
}

// 选择题点击
const selectDonkeyOption = async (item: { id: string, label: string }) => {
  selectDonkeyRes.value = item.id
  stopCountdown()
  const bpId = currentQuickSelectBpId.value
  try {
    // 仅在成功拉到快选参数（拿到有效断点 bpId）时才提交后端；
    // 若后端未配置该断点（QUESTION_NOT_FOUND 等），本地已记录选项，不阻断后续流程。
    if (bpId) {
      await submitQuickSelect(bpId, item.id)
    }
  } catch (err) {
    console.warn('快选后端提交未成功（已本地记录选项，继续后续流程）：', err)
  }

  // 拖拽排序数据已在挂载时预加载，这里不再重复拉取

  breakpoints.value[0].done = true
  talkText.value = '回答完成！我们继续来看看古代造纸的工序吧。'
  setTimeout(() => {
    // 视频模式：回到视频继续播放，待第 20 秒 自动弹出拖拽排序；无视频模式直接进排序题
    if (introVideoUrl.value) {
      currentScene.value = ''
      resumeIntroVideo()
    } else {
      currentScene.value = 'paper-sort'
      talkText.value = paperBubbleText.value
    }
  }, 2000)
}

/** 加载第二场景（拖拽排序题）数据：API 有数据用 API，否则用原型图兜底 */
const loadDragSortScene = async () => {
  const secondQuestion = apiState.value?.questions?.[1]
  if (secondQuestion) {
    try {
      const dragParams = await getDragSortParams(secondQuestion.id)
      applyDragSortData(dragParams)
      // 拉取该拖拽题的历史作答状态
      try {
        const st = await getDragSortState(secondQuestion.id)
        if (st?.submitLogs?.length) {
          sortTipText.value =
            (sortTipText.value ? sortTipText.value + ' ' : '') +
            `（你之前已作答 ${st.submitLogs.length} 次）`
        }
      } catch (_) {
        /* 历史状态不可用时忽略 */
      }
    } catch (err) {
      console.error('加载拖拽排序参数失败:', err)
      applyDragSortData(null) // API 失败用兜底
    }
  } else {
    // 后端 questions 不足 2 个时直接用兜底
    applyDragSortData(null)
  }
}

// 排序提交校验
const checkPaperSort = async () => {
  try {
    const questionId = apiState.value?.questions?.[1]?.id || 'bp-ds-001'

    // 用 sortResult 组装答案（id 用步骤 id en-1~en-4，text 为用户排入该槽位的步骤文本）
    const answer = [
      { id: sortResultIds.value.first || 'en-1', text: sortResult.value.first },
      { id: sortResultIds.value.then || 'en-2', text: sortResult.value.then },
      { id: sortResultIds.value.again || 'en-3', text: sortResult.value.again },
      { id: sortResultIds.value.last || 'en-4', text: sortResult.value.last }
    ]

    const { submitId } = await submitDragSort(questionId, answer)

    // 轮询结果
    let result: CSBpDragSortSubmitResult | null = null
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      result = await getDragSortSubmitResult(questionId, submitId)
      if (!result.isProcessing) break
    }

    if (result) {
      if (result.isPassed) {
        talkText.value = result.feedback || '排序完全正确！太厉害了！'
        breakpoints.value[1].done = true
        setTimeout(() => {
          currentScene.value = 'finish-page'
          introVideoEl.value?.pause()
        }, 2000)
      } else {
        currentErrorCount.value += 1
        if (currentErrorCount.value < maxRetryCount.value) {
          talkText.value = result.feedback || '顺序不对，请再试一次。'
        } else {
          talkText.value = result.feedback || '修改机会已用完，仔细对照课文重新梳理步骤吧。'
          // 展示正确答案
          if (result.referenceAnswer) {
            const ref = result.referenceAnswer
            sortResult.value = {
              first: ref[0]?.text || '',
              then: ref[1]?.text || '',
              again: ref[2]?.text || '',
              last: ref[3]?.text || ''
            }
            sortResultIds.value = {
              first: ref[0]?.id || sortResultIds.value.first || '',
              then: ref[1]?.id || sortResultIds.value.then || '',
              again: ref[2]?.id || sortResultIds.value.again || '',
              last: ref[3]?.id || sortResultIds.value.last || ''
            }
          }
          breakpoints.value[1].done = true
          setTimeout(() => {
            currentScene.value = 'finish-page'
            introVideoEl.value?.pause()
          }, 2000)
        }
      }
    }
  } catch (err) {
    console.error('提交排序失败:', err)
    talkText.value = toUserFriendlyError(err)
  }
}

const showContinueBtn = ref(false)
const continueCountdown = ref(20)
const nextPaperStep = () => {
  talkText.value = '跳过当前，进入下一环节'
  setTimeout(()=>{
    currentScene.value = 'finish-page'
  },2000)
}

// 语音播报：调后端 TTS 接口播放当前数字人引导语
const { playAudio, stop } = useAudioPlayer()
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
const playBubbleAudio = () => {
  if (talkText.value) playAudio(talkText.value)
}
const goBack = () => {
  router.back()
}

// 回看视频：打开视频弹窗，播放后端 params.introVideo.url
const showVideoModal = ref(false)
const openVideoModal = () => {
  showVideoModal.value = true
}

// 进入完成页时：标记本地完成态（刷新仍停在完成页）+ 获取结束语
watch(currentScene, async (scene) => {
  if (scene === 'finish-page') {
    markWarmupCompleted(buildWarmupSnapshot() as unknown as Record<string, unknown>)
    const { useProgressStore } = await import('../stores/progress')
    useProgressStore().markTaskFinished('warmup-game')
    try {
      const ending = await getCulturalStyleEnding()
      finishTalkText.value = ending.comment || '完成文化采风！'
      setTimeout(() => playAudio(finishTalkText.value), 500)
    } catch (err) {
      console.error('获取结束语失败:', err)
      finishTalkText.value = '完成文化采风！'
    }
  }
})

// 生命周期
onMounted(async () => {
  try {
    const [params, state] = await Promise.all([
      getCulturalStyleParams(),
      getCulturalStyleState()
    ])
    apiParams.value = params
    apiState.value = state

    // 互动视频固定地址（storage 8088 的 /assets/style-interact.mp4），不依赖后端返回，避免被清空导致不播
    introVideoUrl.value = '/assets/style-interact.mp4'

    // 设置页面标题
    pageTitle.value = params.title || '重温文化采风'

    // 设置导入气泡话术（原型图兜底：后端 desc 为空时使用默认文案）
    if (state.desc) {
      talkText.value = state.desc
    } else {
      talkText.value = '观看视频，了解古人的书写方式。'
    }

    // 加载快选问题（donkey-question 场景）
    if (state.questions && state.questions.length > 0) {
      const firstQ = state.questions[0]
      try {
        const quickParams = await getQuickSelectParams(firstQ.id)
        currentQuickSelectBpId.value = firstQ.id
        applyQuickSelectData(quickParams)
      } catch (err) {
        console.error('加载快选参数失败:', err)
        applyQuickSelectData(null) // 用兜底数据
      }
    } else {
      // 后端 questions 为空时直接用原型图兜底
      applyQuickSelectData(null)
    }

    // 预加载第二场景（拖拽排序）数据，供 1:08 节点即时弹出
    try {
      await loadDragSortScene()
    } catch (_) {
      /* 失败用兜底 */
    }

    // ========== 场景恢复：已完成→完成页；做到一半→拖拽排序页 ==========
    const snap = loadWarmupProgress<Record<string, unknown>>() as unknown as WarmupSnapshot | null
    if (snap && snap.currentScene === 'finish-page' && isWarmupCompleted()) {
      // 已完成：刷新后直接停在带「查看评价/回到首页」的完成页
      applyWarmupSnapshot(snap)
    } else if (snap && snap.selectDonkeyRes) {
      // 已答完选择题（无论快照里当前场景记的是 video/paper-sort）：直接进排序题，
      // 并标记首节点已完成，避免视频回到第 10 秒 重复弹出选择题
      breakpoints.value[0].done = true
      selectDonkeyRes.value = snap.selectDonkeyRes
      if (snap.sortResult) sortResult.value = { ...snap.sortResult }
      if (Array.isArray(snap.usedStepIds)) usedStepIds.value = [...snap.usedStepIds]
      if (typeof snap.currentErrorCount === 'number') currentErrorCount.value = snap.currentErrorCount
      currentScene.value = 'paper-sort'
      talkText.value = paperBubbleText.value
    }

    // ========== 初始交互流程决策 ==========
    if (introVideoUrl.value) {
      await nextTick()
      if (currentScene.value === '') {
        // 全新进入：从头自动播放，由 timeupdate 在 10s/20s 弹出交互
        tryAutoPlay()
      } else {
        // 恢复场景（做题中/完成态退出再进）：视频 seek 到对应时间戳暂停，不再从头自动播放。
        // 优先用快照保存的 videoTime；老快照无该字段时按场景回退到交互节点时间。
        let target = 0
        if (snap?.videoTime && snap.videoTime > 1) {
          target = snap.videoTime
        } else if (currentScene.value === 'donkey-question') {
          target = BP_FIRST
        } else if (currentScene.value === 'paper-sort') {
          target = BP_SECOND
        } else {
          target = 999999 // finish-page：落到视频末尾（末帧作背景）
        }
        await restoreVideoPaused(target)
      }
    } else if (!currentScene.value) {
      // 无视频回退：直接显示选择题并启动倒计时
      currentScene.value = 'donkey-question'
      startCountdown()
      if (voiceBroadcastOn.value && talkText.value) playAudio(talkText.value)
    }
  } catch (err) {
    console.error('加载文化采风数据失败:', err)
    // 后端不可用：本地已完成的仍停完成页，避免被退回答题场景
    const snap = loadWarmupProgress<Record<string, unknown>>() as unknown as WarmupSnapshot | null
    if (snap && snap.currentScene === 'finish-page' && isWarmupCompleted()) {
      applyWarmupSnapshot(snap)
    } else {
      talkText.value = toUserFriendlyError(err)
    }
  }
})

// 倒计时：进入快选题时从时限开始每秒递减；归零即停（不强制提交，避免打断作答）
const stripCountdownSuffix = (t: string) =>
  t ? t.replace(/\s*\d+\s*[sS秒]\s*$/, '').trim() : t
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}
const startCountdown = () => {
  stopCountdown()
  countdownNum.value = countdownInitial.value
  if (countdownNum.value > 0) {
    countdownTimer = setInterval(() => {
      countdownNum.value -= 1
      if (countdownNum.value <= 0) {
        countdownNum.value = 0
        stopCountdown()
      }
    }, 1000)
  }
}

/** 应用快选问题数据（API 或兜底），匹配原型图 "思考时刻 15S" */
const applyQuickSelectData = (quickParams: CSBpQuickSelectParams | null) => {
  if (quickParams) {
    // 标题可能已含 "15S" 之类的时限后缀，剥离后再由下方倒计时动态显示，避免重复
    donkeyPanelTitle.value = stripCountdownSuffix(quickParams.title)
    talkText.value = quickParams.introBubbleText || talkText.value
    donkeyOptionList.value = quickParams.selections.map(s => ({ id: s.id, label: s.text }))
    countdownInitial.value = quickParams.timeLimit || 15
  } else {
    // 兜底：原型图 1（探秘纸的逆袭 - 蔡伦）
    donkeyPanelTitle.value = stripCountdownSuffix('思考时刻 15S')
    if (!talkText.value || talkText.value === '观看视频，了解古人的书写方式。') {
      talkText.value = '嗨，翻翻你的书包，如果我们现在还在用竹简书写字的话，如果1本书承载的信息需要1头驴来背，今天你需要拿几头驴来上学呢？'
    }
    donkeyOptionList.value = [
      { id: 'opt-3', label: '3头驴' },
      { id: 'opt-5', label: '5头驴' },
      { id: 'opt-8', label: '8头驴' },
      { id: 'opt-10', label: '10头驴' },
      { id: 'opt-more', label: '更多驴' }
    ]
    countdownInitial.value = 15
  }
  countdownNum.value = countdownInitial.value
  // 倒计时在「进入选择题场景」时才启动：视频模式需等第 10 秒 弹出；无视频模式在挂载后启动
}

/** 应用拖拽排序数据（API 或兜底），匹配原型图 2 */
const applyDragSortData = (dragParams: CSBpDragSortParams | null) => {
  if (dragParams) {
    sortPanelTitle.value = dragParams.title
    sortDescText.value = dragParams.description
    sortLabelFirst.value = dragParams.blanks?.[0]?.leadingText || '先'
    sortLabelThen.value = dragParams.blanks?.[1]?.leadingText || '然后'
    sortLabelAgain.value = dragParams.blanks?.[2]?.leadingText || '再'
    sortLabelLast.value = dragParams.blanks?.[3]?.leadingText || '最后'
    sortTipText.value = dragParams.trailingText || ''
    paperBubbleText.value = dragParams.introBubbleText || '读一读《纸的发明》第4自然段，把造纸步骤按顺序排好。'
    submitSortBtnText.value = '提交'
    paperStepList.value = dragParams.entries.map(e => ({ id: e.id, text: e.text }))
  } else {
    // 兜底：原型图 2（造纸步骤拖拽）
    sortPanelTitle.value = '思考时刻'
    sortDescText.value = '读一读《纸的发明》第4自然段，将下面的造纸步骤按先后顺序拖拽排好。'
    sortLabelFirst.value = '先'
    sortLabelThen.value = '然后'
    sortLabelAgain.value = '再'
    sortLabelLast.value = '最后'
    sortTipText.value = '就选好，开始干吧'
    paperBubbleText.value = '读一读《纸的发明》第4自然段，把造纸步骤按顺序排好。'
    submitSortBtnText.value = '提交'
    paperStepList.value = [
      { id: 'en-4', text: '晒干' },
      { id: 'en-1', text: '把树皮、麻头、破布、旧渔网剪碎或切断' },
      { id: 'en-3', text: '把浆捞出来' },
      { id: 'en-2', text: '浸在水里捣烂成浆' }
    ]
  }
}
</script>

<style scoped>
.left-area {
  position: absolute;
  top: 170px;
  left: 2.5%;
  bottom: 20px;
  width: 45%;
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
  /* 与第一题 scene-donkey(left:-120px) 对齐：上一轮改 20px 后仍比 donkey 右移 140px，
     气泡(left:190px)右缘会压到右侧排序答题框，故对齐 donkey 彻底避开 */
  left: -120px;
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
.right-container-donkey {
  position: absolute;
  top: 480px;
  right: 2.5%;
  width: 45%;
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
  right: 2.5%;
  width: 45%;
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
  width: 100%;
  margin-top: 18.9px; /* 0.5cm gap */
  padding: 14px 0;
  background: #ffdd67;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
  box-sizing: border-box;
}
.submit-sort-btn.disabled,
.submit-sort-btn:disabled {
  background:#e4e2e2;
  color:#b7b3b3;
  cursor:not-allowed;
}

/* ===== 互动视频层（视频始终在最底层 z:0，低于 sc-page-canvas z:1，故标题恒在视频上方；
       CompletionOverlay z:1000+ 在视频上方承载数字人与交互遮罩） ===== */
.intro-video-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: #000;
}
/* 结尾页(视频播放完并暂停)：黑遮罩覆盖视频，数字人+标题在其上方 */
.video-paused-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2;
}
.intro-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 圆形黑底返回按钮(.intro-back-btn)已移除，避免与顶部 PageHeader 返回箭头重复 */
</style>