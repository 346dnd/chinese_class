<template>
  <ScaleCanvas background="/image/image 4.png">
    <PageHeader
      title="宣传有法：学习《一幅名扬中外的画》的表达方法"
      @back="goBack"
      voice-broadcast
      :voice-on="voiceBroadcastOn"
      @toggle-voice="playVoiceBroadcast"
      @video="openVideoModal"
    />

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

    <!-- 左侧区域：数字人 + 课文弹窗【和赵州桥布局完全对齐】 -->
    <div class="left-area">
      <div class="digital-human-area" v-if="currentPanel === 'human' && !isAllCompleted">
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

          <CompletionFeedback
            :show="isAllCompleted"
            :show-bubble="false"
            @go-report="goToReport"
            @go-home="goHome"
          />
        </div>
      </div>

      <ArticleReader
        v-if="currentPanel === 'lesson'"
        :visible="currentPanel === 'lesson'"
        :htmlContent="currentArticleContent"
        @close="closeArticle"
      />
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
            <div class="col-left-header">{{ columnHeaders?.left || '怎么写' }}</div>
            <div class="col-right-header">{{ columnHeaders?.right || '《一幅名扬中外的画》第3自然段' }}</div>
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
                  :class="{ recording: recordStatus[idx]?.recording }"
                  @click="startRecord(idx)"
                >
                  <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                  <span class="mic-text">{{ recordStatus[idx]?.recording ? '停止' : '语音' }}</span>
                </button>
              </div>
              <div class="record-status" v-if="recordStatus[idx]?.recording || transcribingStep === idx">
                <span v-if="recordStatus[idx]?.recording" class="red-dot"></span>
                {{ recordStatus[idx]?.recording ? `录音中（${recordStatus[idx].countdown}秒）` : '识别中…' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 提交中提示：输入框下方 -->
        <div class="submitting-tip" v-if="submitting">提交中…</div>

        <button
          v-if="!isAllCompleted"
          class="submit-btn"
          :class="{ submitGold: canSubmit && allFilled }"
          :disabled="!canSubmit || !allFilled || submitting"
          @click="handleSubmit"
        >
          提交答案
        </button>
      </div>
    </div>

  </ScaleCanvas>

  <!-- 完成态：放在 ScaleCanvas 之外（视口级），fixed 相对视口、z-index 盖住整页含 header -->
  <CompletionOverlay :show="isAllCompleted">
      <div class="left-area">
        <div class="digital-human-area">
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

            <CompletionFeedback
              :show="true"
              :show-bubble="false"
              @go-report="goToReport"
              @go-home="goHome"
            />
          </div>
        </div>
      </div>
    </CompletionOverlay>

  <!-- 回看视频弹窗 -->
  <VideoModal v-model:show="showVideoModal" :url="apiParams?.introVideo?.url || ''" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ScaleCanvas from '../components/ScaleCanvas.vue'
import PageHeader from '../components/PageHeader.vue'
import CompletionOverlay from '../components/CompletionOverlay.vue'
import CompletionFeedback from '../components/completion/CompletionFeedback.vue'
import { useCompletionNav } from '../components/completion/useCompletionNav'
import VideoModal from '../components/VideoModal.vue'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import { useFile } from '../composables/useFile'
import { lessonSource } from '../utils/lessonText'
import ArticleReader from '../components/ArticleReader.vue'
import { getWenMingZhongWaiParams, getWenMingZhongWaiState, submitWenMingZhongWai, getWenMingZhongWaiSubmitResult , getTranscription, toUserFriendlyError } from '../api'
import { useCompletionPersistence } from '../composables/useCompletionPersistence'
import type { WenMingZhongWaiParams, WenMingZhongWaiState } from '../types'

const router = useRouter()

// 查看评价：统一跳转到学习报告页；回到首页：跳首页
const { goToReport, goHome } = useCompletionNav()

const isBubbleExpanded = ref(false)

const tabList = ref([{ id: 'painting', name: '一幅名扬中外的画' }])
const currentTabId = ref('painting')
const currentPanel = ref<'human' | 'lesson'>('human')

const articleHtmlRaw = ref(lessonSource.famous_painting.html)

const currentTabName = computed(() => {
  const tab = tabList.value.find(t => t.id === currentTabId.value)
  return tab ? tab.name : ''
})
const currentArticleContent = computed(() => articleHtmlRaw.value)

const questions = ref<Array<{ label: string; correctAnswer: string; allowModifier: string[] }>>([])
const columnHeaders = ref<{ left: string; right: string } | null>(null)
const answers = ref(['', '', ''])
const statusList = ref<Array<''|'correct'|'wrong'|'systemFill'>>(['', '', ''])
const attemptList = ref([0,0,0])
// 提交中状态：请求发出到结果返回期间为 true，展示「提交中…」提示并禁用按钮
const submitting = ref(false)

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

// ========== 本地答题缓存（跨刷新持久化）==========
const {
  markCompleted: markHuaCompleted,
  loadProgress: loadHuaProgress,
  saveProgress: saveHuaProgress,
  isCompleted: isHuaCompleted,
} = useCompletionPersistence('hua-express')

interface HuaSnapshot {
  answers: string[]
  statusList: string[]
  attemptList: number[]
}

const buildHuaSnapshot = (): HuaSnapshot => ({
  answers: [...answers.value],
  statusList: [...statusList.value],
  attemptList: [...attemptList.value]
})

const applyHuaSnapshot = (snap: HuaSnapshot | null): boolean => {
  if (!snap) return false
  if (Array.isArray(snap.answers) && snap.answers.length === 3) answers.value = [...snap.answers]
  if (Array.isArray(snap.statusList) && snap.statusList.length === 3) statusList.value = [...snap.statusList] as Array<''|'correct'|'wrong'|'systemFill'>
  if (Array.isArray(snap.attemptList) && snap.attemptList.length === 3) attemptList.value = [...snap.attemptList]
  return true
}

// 答题状态变化即存，刷新后原样恢复
watch([answers, statusList, attemptList], () => {
  saveHuaProgress(buildHuaSnapshot() as unknown as Record<string, unknown>)
}, { deep: true })

// 全部完成后写入本地完成态（含答题快照），刷新仍停留在完成屏；首页「一幅名扬中外的画」变绿
watch(isAllCompleted, async (val) => {
  if (val) {
    markHuaCompleted(buildHuaSnapshot() as unknown as Record<string, unknown>)
    const { useProgressStore } = await import('../stores/progress')
    useProgressStore().markTaskFinished('qingming')
  }
})

const talkText = ref('')

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

const { isPlaying, playAudio, stop } = useAudioPlayer()
const playBubbleAudio = () => {
  isBubbleExpanded.value = true
  if (talkText.value) playAudio(talkText.value)
}
watch(talkText, () => {
  isBubbleExpanded.value = false
})

// ========== 语音输入（后端 ASR，与 ZZQ 范本一致）==========
const { startRecording, stopRecordingAndUpload, stopRecording, isRecording: fileIsRecording } = useFile()
// 每题录音状态（只保留当前页生命周期内；不限制次数，答错可反复重录）
const recordStatus = reactive<Record<number, { recording: boolean; countdown: number; timer: number | null }>>({})
const recordingStep = ref<number | null>(null)
const transcribingStep = ref<number | null>(null)

const startRecord = async (idx: number) => {
  const cur = recordStatus[idx] || (recordStatus[idx] = { recording: false, countdown: 0, timer: null })
  if (cur.recording) {
    stopRecord(idx)
    return
  }
  // 避免多题同时录音
  if (recordingStep.value !== null && recordingStep.value !== idx) return

  try {
    await startRecording()
    recordingStep.value = idx
    cur.recording = true
    cur.countdown = 60
    talkText.value = '请清晰朗读，点击按钮可提前结束录音。'
    cur.timer = window.setInterval(() => {
      cur.countdown -= 1
      if (cur.countdown <= 0) {
        stopRecord(idx)
      }
    }, 1000)
  } catch (e) {
    console.error('启动录音失败:', e)
    talkText.value = (e as any)?.message || '无法启动麦克风，请检查浏览器权限设置。'
  }
}

const stopRecord = async (idx: number) => {
  const cur = recordStatus[idx]
  if (!cur?.recording) return
  if (cur.timer) clearInterval(cur.timer)
  cur.recording = false
  recordingStep.value = null
  transcribingStep.value = idx
  talkText.value = '正在识别语音，请稍候…'

  try {
    const { resp } = await stopRecordingAndUpload({ resource_info: `一幅名扬中外的画-第${idx + 1}题录音` })
    const resourceId = resp.resource_id ?? ''

    // 后端转写异步，轮询最多 6 次、每次间隔 500ms
    let text = ''
    for (let i = 0; i < 6; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 500))
      const res = await getTranscription(resourceId)
      if (res && res.text) {
        text = res.text
        break
      }
    }

    if (text) {
      answers.value[idx] = text
      talkText.value = `识别结果：${text}`
    } else {
      talkText.value = '未能识别到内容，请重新朗读或手动输入。'
    }
  } catch (e) {
    console.error('语音识别失败:', e)
    talkText.value = '语音识别失败，请手动输入。'
  } finally {
    transcribingStep.value = null
  }
}

onUnmounted(() => {
  Object.values(recordStatus).forEach(item => {
    if (item.timer) clearInterval(item.timer)
  })
  if (fileIsRecording.value) stopRecording()
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    // Find the API question ID (use first matrix row's rowId or a default)
    const questionId = apiParams.value?.matrix?.rows[0]?.rowId || 'q-wm-1'

    // Build answers map from current inputs
    const answerMap: Record<string, string> = {}
    answers.value.forEach((a, i) => {
      answerMap[`r${i + 1}`] = a
    })

    const { submitId } = await submitWenMingZhongWai(questionId, answerMap)

    // Poll for result
    let result = null
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      result = await getWenMingZhongWaiSubmitResult(submitId)
      if (!result.isProcessing) break
    }

    if (result) {
      // Apply results to each question
      for (let i = 0; i < questions.value.length; i++) {
        if (statusList.value[i] === 'correct' || statusList.value[i] === 'systemFill') continue

        const refAnswer = result.referenceAnswer?.[`r${i + 1}`] || ''
        if (refAnswer && answers.value[i].trim() === refAnswer) {
          statusList.value[i] = 'correct'
        } else {
          attemptList.value[i] += 1
          if (attemptList.value[i] >= 3) {
            statusList.value[i] = 'systemFill'
            answers.value[i] = refAnswer || answers.value[i]
          } else {
            statusList.value[i] = 'wrong'
            answers.value[i] = ''
          }
        }
      }

      talkText.value = result.feedback || ''
      if (talkText.value) playAudio(talkText.value)
    }
  } catch (e) {
    console.error('提交失败:', e)
    talkText.value = toUserFriendlyError(e)
    playAudio(talkText.value)
  } finally {
    submitting.value = false
  }
}

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

const goBack = () => {
  router.back()
}

const apiParams = ref<WenMingZhongWaiParams | null>(null)
const apiState = ref<WenMingZhongWaiState | null>(null)

onMounted(async () => {
  try {
    const [params, state] = await Promise.all([
      getWenMingZhongWaiParams(),
      getWenMingZhongWaiState()
    ])
    apiParams.value = params
    apiState.value = state
    // Map API matrix rows to questions
    if (params.matrix && params.matrix.rows) {
      // 后端 matrix 结构：第一个「全部 cell 都是 text」的行是列标题行（没有 input）；
      // 含 input 的行才是真正的题目行。这样无论后端是否发表头行，前端都能正确渲染
      // 3 道题，避免把列标题行误渲染为第 1 题。
      const headerRow = params.matrix.rows.find(row => row.cells.every(c => c.type === 'text'))
      const questionRows = params.matrix.rows.filter(row => row.cells.some(c => c.type === 'input'))
      if (headerRow) {
        const leftCell = headerRow.cells.find(c => c.columnKey === 'r1')
        const rightCell = headerRow.cells.find(c => c.columnKey === 'r2')
        columnHeaders.value = {
          left: leftCell?.content || '怎么写',
          right: rightCell?.content || '《一幅名扬中外的画》第3自然段'
        }
      }
      questions.value = questionRows.map(row => {
        const labelCell = row.cells.find(c => c.type === 'text')
        return {
          label: labelCell?.content || '',
          correctAnswer: '', // Will come from API submit results
          allowModifier: []
        }
      })
      // Restore any existing answers from state
      // 后端 submitLogs 为「最新在前」(id 降序)，先按 id 升序归一化为时间顺序，末尾即最新
      if (state.submitLogs && state.submitLogs.length > 0) {
        const sortedLogs = [...state.submitLogs].sort((a, b) => (a.id || '').localeCompare(b.id || ''))
        const lastLog = sortedLogs[sortedLogs.length - 1]
        if (lastLog.isCompleted) {
          // Restore completed state
          for (let i = 0; i < statusList.value.length; i++) {
            statusList.value[i] = 'correct'
          }
        }
      }
    }
    talkText.value = params.introBubbleText
    // 本地已完成但后端数据不全 → 以本地快照为准，停留在完成屏
    if (!isAllCompleted.value && isHuaCompleted()) {
      applyHuaSnapshot(loadHuaProgress<Record<string, unknown>>() as unknown as HuaSnapshot)
    }
    if (!isAllCompleted.value) {
      setTimeout(() => playAudio(params.introBubbleText), 500)
    }
  } catch (e) {
    console.error('加载一幅名扬中外的画数据失败:', e)
    // 后端不可用：用本地快照兜底恢复答题记录/完成态
    if (!applyHuaSnapshot(loadHuaProgress<Record<string, unknown>>() as unknown as HuaSnapshot)) {
      talkText.value = toUserFriendlyError(e)
    } else if (!isAllCompleted.value) {
      talkText.value = '后端服务暂不可用，已恢复你之前的答题记录。'
    }
  }
})
</script>

<style scoped>

.tab-wrapper {
  position: absolute;
  top: 130px;
  left: 2.5%;
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

/* 和赵州桥页面完全对齐 */
.left-area {
  position: absolute;
  top: 170px;
  left: 2.5%;
  bottom: 20px;
  width: 47%;
  z-index: 5;
}

.digital-human-area {
  position: absolute;
  bottom: 320px;
  right: 20px;
  left: auto;
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
  max-height: 60vh; /* 不固定长度：短文自适应，超长才限高滑动，滚动条隐藏 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  transition: max-height 0.3s ease;
}
.bubble-text::-webkit-scrollbar {
  display: none; /* WebKit/Blink 隐藏滚动条 */
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

/* 右侧答题面板 */
.right-container {
  position: absolute;
  top: 150px;
  right: 2.5%;
  width: 42%;
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
  flex-direction: column;
  justify-content: center;
  gap: 4px;
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
  flex: 1; /* 撑满整行剩余高度，与左侧题目背景格（col-left）等高 */
  min-height: 54px; /* 仅当下方出现"录音中/识别中"状态行时的兜底 */
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
.mic-btn.recording {
  background: #fff4e0;
  border-color: #ebaf36;
  color: #d27f01;
}
.record-status {
  font-size: 12px;
  color: #e07b39;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}
.red-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e53935;
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
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
  margin-top: 18.9px; /* 0.5cm gap */
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

/* 提交中提示：输入框下方，带旋转小圈 */
.submitting-tip {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #e8f0fe;
  border: 1px solid #1565c0;
  color: #1565c0;
  font-size: 14px;
}
.submitting-tip::before {
  content: '';
  width: 14px;
  height: 14px;
  border: 2px solid #1565c0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: submit-spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes submit-spin {
  to { transform: rotate(360deg); }
}
</style>