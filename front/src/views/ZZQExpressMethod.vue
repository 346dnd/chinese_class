<template>
    <ScaleCanvas background="/image/image 116.png">
    <PageHeader
      title="宣传有法：学习《赵州桥》的表达方法"
      @back="goBack"
      voice-broadcast
      :voice-on="voiceBroadcastOn"
      @toggle-voice="playVoiceBroadcast"
      @video="openVideoModal"
    />

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

    <!-- 左侧数字人+对话气泡 【位置固定不变，完成后依旧显示】 -->
    <div class="human-wrap" v-if="!isAllCompleted" v-show="!hideHumanWhenArticleOpen">
      <img src="/image/罗罗_汉服 1.png" alt="数字人" class="human-img" />
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

        <CompletionFeedback
          :show="isAllCompleted"
          :show-bubble="false"
          :message="completionMessage"
          @go-report="goToReport"
          @go-home="goHome"
        />
      </div>
    </div>

    <!-- ==========课文弹窗 ========== -->
    <div class="left-area">
      <ArticleReader
        v-if="showArticle"
        :visible="showArticle"
        :htmlContent="articleHtml"
        @close="closeArticle"
      />
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
            'card-wrong': status1 === 'wrong' || status1 === 'wrong-locked'
          }"
        >
          <p class="step-question">{{ steps[0]?.question }}</p>
          <div class="input-box" v-if="step === 1">
            <div class="input-with-action">
              <textarea
                class="read-input"
                :class="{ 'input-wrong': status1 === 'wrong' }"
                v-model="answer1"
                placeholder="点击窗口输入或语音输入"
                rows="2"
              ></textarea>
              <button class="mic-btn" @click="startRecord(1)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[1].recording ? '停止' : '语音' }}
              </button>
            </div>
            <div class="record-status" v-if="recordStatus[1].recording || transcribingStep === 1">
              <span v-if="recordStatus[1].recording" class="red-dot"></span>
              {{ recordStatus[1].recording ? `录音中（${recordStatus[1].countdown}秒）` : '识别中…' }}
            </div>
            <button
              class="submit-inner-btn"
              :class="{ 'submit-disable': !answer1.trim() || submitting[1] }"
              @click="submitStep1"
              :disabled="!answer1.trim() || submitting[1]"
            >
              提交答案
            </button>
            <div class="submitting-tip" v-if="submitting[1]">提交中…</div>
            <div class="error-tip" v-if="status1 === 'wrong'">
              内容不完整，请{{ submitCount[1] >= 3 ? '自动进入下一题' : '重新输入或朗读' }}，剩余次数：{{ Math.max(0, 3 - submitCount[1]) }}次
            </div>
          </div>
          <div class="answer-result" v-if="step >= 2">
            <div class="green-tag" :class="{fold: !answerExpand[1], 'wrong-tag': status1 === 'wrong-locked'}">
              {{ answer1 }}
            </div>
            <div class="ref-tag" v-if="referenceAnswers[1]" :class="{fold: !answerExpand[1]}">
              {{ referenceAnswers[1] }}
            </div>
            <span v-if="(isTextOverflow(answer1) || isTextOverflow(referenceAnswers[1])) && step >=2" class="more-btn" @click="toggleExpand(1)">
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
            'card-wrong': status2 === 'wrong' || status2 === 'wrong-locked'
          }"
        >
          <p class="step-question">{{ steps[1]?.question }}</p>
          <div class="input-box" v-if="step === 2">
            <div class="input-with-action">
              <textarea
                class="read-input"
                :class="{ 'input-wrong': status2 === 'wrong' }"
                v-model="answer2"
                placeholder="点击窗口输入或语音输入"
                rows="2"
              ></textarea>
              <button class="mic-btn" @click="startRecord(2)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[2].recording ? '停止' : '语音' }}
              </button>
            </div>
            <div class="record-status" v-if="recordStatus[2].recording || transcribingStep === 2">
              <span v-if="recordStatus[2].recording" class="red-dot"></span>
              {{ recordStatus[2].recording ? `录音中（${recordStatus[2].countdown}秒）` : '识别中…' }}
            </div>
            <button
              class="submit-inner-btn"
              :class="{ 'submit-disable': !answer2.trim() || submitting[2] }"
              @click="submitStep2"
              :disabled="!answer2.trim() || submitting[2]"
            >
              提交答案
            </button>
            <div class="submitting-tip" v-if="submitting[2]">提交中…</div>
            <div class="error-tip" v-if="status2 === 'wrong'">
              内容不完整，请{{ submitCount[2] >= 3 ? '自动进入下一题' : '重新输入或朗读' }}，剩余次数：{{ Math.max(0, 3 - submitCount[2]) }}次
            </div>
          </div>
          <div class="answer-result" v-if="step >= 3">
            <div class="green-tag" :class="{fold: !answerExpand[2], 'wrong-tag': status2 === 'wrong-locked'}">
              {{ answer2 }}
            </div>
            <div class="ref-tag" v-if="referenceAnswers[2]" :class="{fold: !answerExpand[2]}">
              {{ referenceAnswers[2] }}
            </div>
            <span v-if="(isTextOverflow(answer2) || isTextOverflow(referenceAnswers[2])) && step >=3" class="more-btn" @click="toggleExpand(2)">
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
            'card-wrong': status3 === 'wrong' || status3 === 'wrong-locked'
          }"
        >
          <p class="step-question">{{ steps[2]?.question }}</p>
          <div class="input-box" v-if="step === 3">
            <div class="input-with-action" :class="{ 'voice-only': isVoiceOnly(3) }">
              <textarea
                v-if="!isVoiceOnly(3)"
                class="read-input"
                :class="{ 'input-wrong': status3 === 'wrong' }"
                v-model="answer3"
                placeholder="点击窗口输入或语音输入"
                rows="2"
              ></textarea>
              <button v-if="!isVoiceOnly(3)" class="mic-btn" @click="startRecord(3)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
                {{ recordStatus[3].recording ? '停止' : '语音' }}
              </button>
              <button v-else class="mic-btn-round" :class="{ recording: recordStatus[3].recording }" @click="startRecord(3)">
                <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
              </button>
            </div>
            <div class="record-status" v-if="recordStatus[3].recording || transcribingStep === 3">
              <span v-if="recordStatus[3].recording" class="red-dot"></span>
              {{ recordStatus[3].recording ? `录音中（${recordStatus[3].countdown}秒）` : '识别中…' }}
            </div>
            <button
              class="submit-inner-btn"
              :class="{ 'submit-disable': !answer3.trim() || submitting[3] }"
              @click="submitStep3"
              :disabled="!answer3.trim() || submitting[3]"
            >
              提交答案
            </button>
            <div class="submitting-tip" v-if="submitting[3]">提交中…</div>
            <div class="error-tip" v-if="status3 === 'wrong'">
              内容不完整，请{{ submitCount[3] >= 3 ? '自动完成关卡' : '重新输入或朗读' }}，剩余次数：{{ Math.max(0, 3 - submitCount[3]) }}次
            </div>
          </div>
          <div class="answer-result" v-if="step >= 4">
            <div class="green-tag" :class="{fold: !answerExpand[3], 'wrong-tag': status3 === 'wrong-locked'}">
              {{ answer3 }}
            </div>
            <div class="ref-tag" v-if="referenceAnswers[3]" :class="{fold: !answerExpand[3]}">
              {{ referenceAnswers[3] }}
            </div>
            <span v-if="(isTextOverflow(answer3) || isTextOverflow(referenceAnswers[3])) && step >=4" class="more-btn" @click="toggleExpand(3)">
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
            'card-wrong': status4 === 'wrong' || status4 === 'wrong-locked'
          }"
        >
          <p class="step-question">{{ steps[3]?.question }}</p>
          <div class="error-tip" v-if="status4 === 'wrong' && step === 4">
            朗读内容不完整，请{{ submitCount[4] >= 3 ? '自动完成关卡' : '在弹窗中重新朗读' }}，剩余次数：{{ Math.max(0, 3 - submitCount[4]) }}次
          </div>
          <div class="answer-result" v-if="step > 4 || status4 === 'correct'">
            <div class="green-tag" :class="{fold: !answerExpand[4], 'wrong-tag': status4 === 'wrong-locked'}">
              {{ answer4 }}
            </div>
            <div class="ref-tag" v-if="referenceAnswers[4]" :class="{fold: !answerExpand[4]}">
              {{ referenceAnswers[4] }}
            </div>
            <span v-if="(isTextOverflow(answer4) || isTextOverflow(referenceAnswers[4])) && (step > 4 || status4 === 'correct')" class="more-btn" @click="toggleExpand(4)">
              {{ answerExpand[4] ? '收起' : '更多' }}
            </span>
          </div>
        </div>
      </div>
    </div>

  </ScaleCanvas>

  <!-- 完成态：放在 ScaleCanvas 之外（视口级），fixed 相对视口、z-index 盖住整页含 header -->
  <CompletionOverlay :show="isAllCompleted">
      <div class="human-wrap">
        <img src="/image/罗罗_汉服 1.png" alt="数字人" class="human-img" />
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
          <CompletionFeedback
            :show="true"
            :show-bubble="false"
            :message="completionMessage"
            @go-report="goToReport"
            @go-home="goHome"
          />
        </div>
      </div>
    </CompletionOverlay>

  <!-- 第4题朗读视频弹窗：跳出页面，黑透背景覆盖全屏 -->
  <Teleport to="body">
    <div class="video-modal" v-if="showVideoModal">
      <div class="video-modal-card">
        <p class="modal-prompt">{{ steps[3]?.question }}</p>
        <video
          v-if="stepVideoUrl"
          :src="stepVideoUrl"
          autoplay
          muted
          loop
          class="modal-video"
        ></video>
        <img
          v-else-if="stepImageUrl"
          :src="stepImageUrl"
          class="modal-video modal-image"
          alt="朗读示范动图"
        />
        <div v-else class="modal-video-placeholder">视频加载中…</div>
        <button
          class="mic-btn-round"
          :class="{ recording: recordStatus[4].recording }"
          @click="startRecord(4)"
        >
          <img src="/image/矢量 62.png" alt="语音" class="mic-icon" />
        </button>
        <div class="record-status" v-if="recordStatus[4].recording || transcribingStep === 4">
          <span v-if="recordStatus[4].recording" class="red-dot"></span>
          {{ recordStatus[4].recording ? `录音中（${recordStatus[4].countdown}秒）` : '识别中…' }}
        </div>
        <div class="record-status record-hint" v-else>
          {{ isVoiceOnly(4) ? '点击上方按钮开始朗读' : '点击上方按钮开始朗读，或在下方输入框打字' }}
        </div>
        <textarea
          v-if="!isVoiceOnly(4)"
          class="modal-text-input"
          v-model="answer4"
          placeholder="也可以在这里打字输入…"
          rows="2"
        ></textarea>
        <button
          class="submit-inner-btn"
          :class="{ 'submit-disable': !answer4.trim() || submitting[4] }"
          @click="submitStep4"
          :disabled="!answer4.trim() || submitting[4]"
          style="margin-top: 10px;"
        >
          提交答案
        </button>
        <div class="submitting-tip" v-if="submitting[4]">提交中…</div>
        <div class="error-tip" v-if="status4 === 'wrong'">
          内容不完整，请{{ submitCount[4] >= 3 ? '自动完成关卡' : '重新输入或朗读' }}，剩余次数：{{ Math.max(0, 3 - submitCount[4]) }}次
        </div>
      </div>
    </div>
  </Teleport>

  <!-- 回看视频弹窗：播放后端 params.introVideo.url -->
  <VideoModal v-model:show="showIntroVideoModal" :url="apiParams?.introVideo?.url || ''" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import ScaleCanvas from '../components/ScaleCanvas.vue'
import { lessonSource } from '../utils/lessonText'
import PageHeader from '../components/PageHeader.vue'
import ArticleReader from '../components/ArticleReader.vue'
import CompletionOverlay from '../components/CompletionOverlay.vue'
import CompletionFeedback from '../components/completion/CompletionFeedback.vue'
import VideoModal from '../components/VideoModal.vue'
import { useCompletionNav } from '../components/completion/useCompletionNav'
import { DefaultService } from '../api/generated'
import { call, toUserFriendlyError, resolveDownloadUrl } from '../api/helpers'
import { useFile } from '../composables/useFile'
import type {
  ZhaoZhouQiaoState,
  ZhaoZhouQiaoSumbitResp,
  ZhaozhouBridgeParams as ZhaoZhouQiaoParams,
} from '../api/generated'
type ZhaoZhouQiaoCard = ZhaoZhouQiaoState['cards'][number]
import { useCompletionPersistence } from '../composables/useCompletionPersistence'

// 跨刷新持久化：答完「赵州桥表达方法」后，刷新仍停在完成屏；做到一半也有答题缓存
const {
  markCompleted: markZzqCompleted,
  loadProgress: loadZzqProgress,
  saveProgress: saveZzqProgress,
  isCompleted: isZzqCompleted,
} = useCompletionPersistence('zzq-express')

const router = useRouter()
// nodeId / classId 优先取路由参数（route.params 或 route.query），缺省回退到已知正确值
// 本页对应 zhaozhouqiao 模块，默认 node 17
const route = useRoute()
const NODE_ID = computed(() => Number(route.params.nodeId) || Number(route.query.nodeId) || 17)
const CLASS_ID = computed(() => Number(route.params.classId) || Number(route.query.classId) || 127)

const isBubbleExpanded = ref(false)
const hideHumanWhenArticleOpen = ref(false)

const showArticle = ref(false)
const articleHtml = ref(lessonSource.zhaozhouqiao.html)

const answerExpand = reactive<Record<number, boolean>>({1:false,2:false,3:false,4:false})
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

const recordAttempt = reactive<Record<number, number>>({ 1: 0, 2: 0, 3: 0,4:0 })
// 每题提交次数（打字/语音提交都计入），与后端最大提交次数对齐；recordAttempt 仅限制录音
const submitCount = reactive<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 })
// 未答对达上限时后端返回的参考答案，step 1-4
const referenceAnswers = reactive<Record<number, string>>({})
const recordStatus = reactive<Record<number, { recording: boolean; countdown: number; timer: number | null }>>({
  1: { recording: false, countdown: 60, timer: null },
  2: { recording: false, countdown: 60, timer: null },
  3: { recording: false, countdown: 60, timer: null },
  4: { recording: false, countdown: 60, timer: null }
})

// 每题提交中（用于输入框下方展示「提交中…」并禁用按钮防止重复提交）
const submitting = reactive<Record<number, boolean>>({ 1: false, 2: false, 3: false, 4: false })

const steps = ref<Array<{ step: number; question: string; correctAnswer: string }>>([])

const status1 = ref('')
const status2 = ref('')
const status3 = ref('')
const status4 = ref('')

const talkText = ref('')
const stepVideoUrl = ref('')
const stepImageUrl = ref('')
const recordingStep = ref<number | null>(null)
const transcribingStep = ref<number | null>(null)
const stepAudioResourceId = reactive<Record<number, string>>({})
const { startRecording, stopRecordingAndUpload, stopRecording, isRecording: fileIsRecording } = useFile()
const showVideoModal = computed(() => step.value === 4 && status4.value !== 'correct' && !isAllCompleted.value)

const tabList = ref([{ id: 'zhaozhou', name: '赵州桥' }])
const currentTabId = ref('zhaozhou')

const apiParams = ref<ZhaoZhouQiaoParams | null>(null)
const apiState = ref<ZhaoZhouQiaoState | null>(null)
const apiCards = ref<ZhaoZhouQiaoCard[]>([])

// 朗读题（voiceOnly）：只允许语音输入，隐藏打字框
const isVoiceOnly = (stepNum: number): boolean => {
  const card = apiCards.value[stepNum - 1]
  return !!card?.voiceOnly
}

// 第4题资源 URL 规范化：后端可能返回 `assets\xxx.gif`（反斜杠、无前导 /），
// 实际由 storage 服务(8088) 在 /assets 下提供 → 统一转成 /assets/xxx.gif，走 vite /assets 代理
const resolveAssetUrl = (src: string): string => {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  const norm = src.replace(/\\/g, '/').replace(/^\/+/, '') // 反斜杠转正斜杠、去前导 /
  if (norm.startsWith('assets/')) return '/' + norm
  return resolveDownloadUrl(src)
}

// 完成态：每题要么答对(correct)，要么答错达上限(wrong-locked)。'wrong'(仍在校正中)和空值不算完成。
const isFinished = (s: string) => s === 'correct' || s === 'wrong-locked'
const isAllCompleted = computed(() => isFinished(status1.value) && isFinished(status2.value) && isFinished(status3.value) && isFinished(status4.value))

// ========== 本地答题缓存（快照）==========
interface ZzqSnapshot {
  step: number
  answers: string[]
  statuses: string[]
  submitCount: Record<number, number>
  referenceAnswers: Record<number, string>
}

const buildZzqSnapshot = (): ZzqSnapshot => ({
  step: step.value,
  answers: [answer1.value, answer2.value, answer3.value, answer4.value],
  statuses: [status1.value, status2.value, status3.value, status4.value],
  submitCount: { ...submitCount },
  referenceAnswers: { ...referenceAnswers }
})

const applyZzqSnapshot = (snap: ZzqSnapshot | null): boolean => {
  if (!snap) return false
  step.value = Math.min(Math.max(1, snap.step || 1), 5)
  const ansRefs = [answer1, answer2, answer3, answer4]
  const stRefs = [status1, status2, status3, status4]
  snap.answers?.forEach((a, i) => { if (ansRefs[i]) ansRefs[i].value = a || '' })
  snap.statuses?.forEach((s, i) => { if (stRefs[i]) stRefs[i].value = s || '' })
  if (snap.submitCount) {
    Object.keys(snap.submitCount).forEach(k => { submitCount[Number(k)] = snap.submitCount?.[Number(k)] ?? 0 })
  }
  if (snap.referenceAnswers) {
    Object.keys(snap.referenceAnswers).forEach(k => { referenceAnswers[Number(k)] = snap.referenceAnswers?.[Number(k)] ?? '' })
  }
  return true
}

// 答题状态变化即存（含每题答案/判定/参考答案/当前题号），刷新后原样恢复
watch(
  () => [
    step.value,
    answer1.value, answer2.value, answer3.value, answer4.value,
    status1.value, status2.value, status3.value, status4.value,
    JSON.stringify(referenceAnswers), JSON.stringify(submitCount)
  ],
  () => { saveZzqProgress(buildZzqSnapshot() as unknown as Record<string, unknown>) }
)

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

const { playAudio, stop } = useAudioPlayer()
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
  if (recordAttempt[stepNum] >= 2 && !recordStatus[stepNum].recording) return
  const cur = recordStatus[stepNum]
  if (cur.recording) {
    stopRecord(stepNum)
    return
  }
  // 避免多题同时录音
  if (recordingStep.value !== null && recordingStep.value !== stepNum) return

  try {
    await startRecording()
    recordingStep.value = stepNum
    cur.recording = true
    cur.countdown = 60
    talkText.value = '请清晰朗读，点击按钮可提前结束录音。'
    cur.timer = window.setInterval(() => {
      cur.countdown -= 1
      if (cur.countdown <= 0) {
        stopRecord(stepNum)
      }
    }, 1000)
  } catch (e) {
    console.error('启动录音失败:', e)
    talkText.value = (e as any)?.message || '无法启动麦克风，请检查浏览器权限设置。'
  }
}

const stopRecord = async (stepNum: number) => {
  const cur = recordStatus[stepNum]
  if (!cur.recording) return
  if (cur.timer) clearInterval(cur.timer)
  cur.recording = false
  recordingStep.value = null
  cur.countdown = 60
  recordAttempt[stepNum] += 1
  transcribingStep.value = stepNum
  talkText.value = '正在识别语音，请稍候…'

  try {
    const { resp } = await stopRecordingAndUpload({ resource_info: `赵州桥表达方法-第${stepNum}题录音` })
    const resourceId = resp.resource_id ?? ''
    if (resourceId) stepAudioResourceId[stepNum] = resourceId

    let text = ''
    for (let i = 0; i < 6; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 500))
      const res = await call(DefaultService.getApiUtilsTranscriptions(resourceId))
      if (res && res.text) {
        text = res.text
        break
      }
    }

    if (text) {
      if (stepNum === 1) answer1.value = text
      else if (stepNum === 2) answer2.value = text
      else if (stepNum === 3) answer3.value = text
      else if (stepNum === 4) answer4.value = text
      talkText.value = `识别结果：${text}`
    } else {
      talkText.value = '未能识别到内容，请重新朗读或手动输入。'
    }

    // 第4题为朗读题，识别完成后自动提交
    if (stepNum === 4) {
      if (answer4.value.trim()) {
        await submitStep(4)
      }
      if (status4.value !== 'correct' && recordAttempt[4] >= 2) {
        status4.value = 'correct'
        onComplete()
      }
    }
  } catch (e) {
    console.error('语音上传/识别失败:', e)
    talkText.value = '语音上传失败，请检查网络或麦克风权限。'
    // 第4题达到尝试上限后兜底完成，避免卡关
    if (stepNum === 4 && recordAttempt[4] >= 2) {
      status4.value = 'correct'
      onComplete()
    }
  } finally {
    transcribingStep.value = null
  }
}

const onComplete = async () => {
  talkText.value = '太棒啦！你已经完成全部学习任务。'
  playAudio(talkText.value)
}

/** 达上限但提交结果未带参考答案时，主动走 get-answer 流程向后端获取 */
const fetchReferenceAnswer = async (cardId: string): Promise<string> => {
  try {
    const { submitId } = await call(DefaultService.postApiV1StuClassNodeZhaozhouqiaoSubmissions(
      CLASS_ID.value, NODE_ID.value, cardId,
      { cardId, type: 'get-answer', text: null, audio: null }
    ))
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      const res = await call(DefaultService.getApiV1StuClassNodeZhaozhouqiaoSubmissions(CLASS_ID.value, NODE_ID.value, submitId))
      if (res && !res.isProcessing) return res.referenceAnswer || ''
    }
  } catch (e) {
    console.error('获取参考答案失败:', e)
  }
  return ''
}

const submitStep = async (stepNum: number) => {
  const answer = (stepNum === 1 ? answer1 : stepNum === 2 ? answer2 : stepNum === 3 ? answer3 : answer4)
  if (!answer.value.trim()) return

  const card = apiCards.value[stepNum - 1]
  if (!card) return

  submitting[stepNum] = true
  submitCount[stepNum] += 1

  try {
    const audioId = stepAudioResourceId[stepNum]
    const { submitId } = await call(DefaultService.postApiV1StuClassNodeZhaozhouqiaoSubmissions(CLASS_ID.value, NODE_ID.value, card.id, { cardId: card.id, type: 'submit', text: answer.value, audio: audioId ? { id: audioId } : null }))

    let result: ZhaoZhouQiaoSumbitResp | null = null
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      result = await call(DefaultService.getApiV1StuClassNodeZhaozhouqiaoSubmissions(CLASS_ID.value, NODE_ID.value, submitId))
      if (result && !result.isProcessing) break
    }

    // 轮询超时（10 次仍在处理）也视为未拿到判定，落入下方失败提示，不放行
    const statusRef = stepNum === 1 ? status1 : stepNum === 2 ? status2 : stepNum === 3 ? status3 : status4

    if (result && !result.isProcessing && result.isPassed) {
      console.log('[ZZQ] 后端判定：答对', { step: stepNum, feedback: result.feedback })
      // 答对：上一题展示学生自己的答案
      statusRef.value = 'correct'
      step.value = stepNum + 1
      talkText.value = result.feedback || `很棒，我们来到第${stepNum + 1}题。`
      playAudio(talkText.value)
    } else if (result && !result.isProcessing) {
      console.log('[ZZQ] 后端判定：答错', { step: stepNum, isPassed: result.isPassed, isCompleted: result.isCompleted, feedback: result.feedback })
      statusRef.value = 'wrong'
      showArticle.value = false
      talkText.value = result.feedback || '这次朗读不对，请重新朗读。'
      playAudio(talkText.value)

      // 达上限（后端 isCompleted=true 或本地累计 3 次答错）：
      // 展示后端返回的正确答案，卡片保持红色(wrong-locked)不转绿，进入下一题，避免卡在红色错误态。
      // 这样「答错 3 次 → 一直是红色 + 显示正确答案」的诉求得到满足。
      if (result.isCompleted || submitCount[stepNum] >= 3) {
        const ref = result.referenceAnswer
          || (result.offerReferenceAnswer ? await fetchReferenceAnswer(card.id) : '')
        if (ref) referenceAnswers[stepNum] = ref
        statusRef.value = 'wrong-locked' // 关键：保持红色，不置 correct
        step.value = stepNum + 1
        if (!result.feedback) {
          talkText.value = '已达到尝试次数上限，为你展示正确答案，我们继续下一题。'
          playAudio(talkText.value)
        }
      }
    } else {
      // 轮询超时仍在处理：不判定、不放行，提示稍后重试
      console.warn('[ZZQ] 判定超时：后端仍在处理中')
      submitCount[stepNum] = Math.max(0, submitCount[stepNum] - 1)
      talkText.value = '判定的AI老师还在思考，请稍等几秒再重新提交。'
      playAudio(talkText.value)
    }
  } catch (e) {
    console.error('提交失败:', e)
    // 判定必须以后端为准：接口失败（后端未启动/网络异常/服务报错）一律不放行，
    // 回滚本次提交计数，停留在本题提示重试，等待拿到后端真实判定结果
    submitCount[stepNum] = Math.max(0, submitCount[stepNum] - 1)
    talkText.value = '提交失败，没有拿到判定结果，请确认后端服务已启动后重试。'
    playAudio(talkText.value)
  } finally {
    submitting[stepNum] = false
  }
}

const submitStep1 = () => submitStep(1)
const submitStep2 = () => submitStep(2)
const submitStep3 = () => submitStep(3)
const submitStep4 = () => submitStep(4)

// ========== 顶部导航功能 ==========
// 语音播报：调后端 TTS 接口播放当前数字人引导语
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
const showIntroVideoModal = ref(false)
const openVideoModal = () => {
  showIntroVideoModal.value = true
}

const goBack = () => {
  router.back()
}
const { goToReport: navToReport, goHome } = useCompletionNav()
const goToReport = () => navToReport({ classId: CLASS_ID.value, nodeId: NODE_ID.value })

onMounted(async () => {
  try {
    const [params, state] = await Promise.all([
      call(DefaultService.getApiV1StuClassNodeZhaozhouqiaoParams(CLASS_ID.value, NODE_ID.value)),
      call(DefaultService.getApiV1StuClassNodeZhaozhouqiaoState(CLASS_ID.value, NODE_ID.value))
    ])
    apiParams.value = params
    apiState.value = state
    apiCards.value = state.cards
    steps.value = state.cards.map((card, i) => ({
      step: i + 1,
      question: card.title || card.description || '',
      correctAnswer: ''
    }))
    // 第4题资源：优先 video；后端配置只有 image（gif 动图）时回退用图片展示
    const c4Assets = state.cards[3]?.assets || []
    const videoAsset = c4Assets.find(a => a.type === 'video')
    const imageAsset = videoAsset ? undefined : c4Assets.find(a => a.type === 'image')
    stepVideoUrl.value = videoAsset ? resolveAssetUrl(videoAsset.src) : ''
    stepImageUrl.value = imageAsset ? resolveAssetUrl(imageAsset.src) : ''
    talkText.value = params.introBubbleText || ''
    // 以后端 submitLogs 为准恢复完成态（不再用 localStorage 强制全 correct）
    state.cards.forEach((card, i) => {
      if (card.submitLogs && card.submitLogs.length > 0) {
        const lastLog = card.submitLogs[card.submitLogs.length - 1]
        const statusRef = i === 0 ? status1 : i === 1 ? status2 : i === 2 ? status3 : status4
        const answerRef = i === 0 ? answer1 : i === 1 ? answer2 : i === 2 ? answer3 : answer4
        // 恢复提交次数（get-answer 类记录不计入）
        submitCount[i + 1] = card.submitLogs.filter(l => String(l.type) === 'submit').length
        if (lastLog?.isPassed || lastLog?.isCompleted) {
          // 答对 → 绿色；完成但没答对(达上限) → 红色 wrong-locked，保持与实时答题一致
          statusRef.value = lastLog?.isPassed ? 'correct' : 'wrong-locked'
        }
        if (lastLog?.submittedText) {
          answerRef.value = lastLog.submittedText
        }
        // 未答对达上限的题：恢复后端参考答案，刷新后仍能展示
        if (lastLog && !lastLog.isPassed && (lastLog.isCompleted || submitCount[i + 1] >= 3) && lastLog.referenceAnswer) {
          referenceAnswers[i + 1] = lastLog.referenceAnswer
        }
      }
    })
    // step 推进到第一个未完成的题
    const completedCount = state.cards.filter(c => c.submitLogs?.some(l => l.isPassed || l.isCompleted)).length
    step.value = Math.min(completedCount + 1, 5)
    // 后端数据不全但本地已完成 → 以本地快照为准，停留在完成屏
    if (!isAllCompleted.value && isZzqCompleted()) {
      applyZzqSnapshot(loadZzqProgress<Record<string, unknown>>() as unknown as ZzqSnapshot)
    }
    if (!isAllCompleted.value) {
      setTimeout(() => playAudio(params.introBubbleText || ''), 500)
    }
  } catch (e) {
    console.error('加载赵州桥数据失败:', e)
    // 后端不可用：用本地快照兜底恢复答题记录/完成态
    if (!applyZzqSnapshot(loadZzqProgress<Record<string, unknown>>() as unknown as ZzqSnapshot)) {
      talkText.value = toUserFriendlyError(e)
    } else if (!isAllCompleted.value) {
      talkText.value = '后端服务暂不可用，已恢复你之前的答题记录。'
    }
  }
})

onUnmounted(() => {
  Object.values(recordStatus).forEach(item => {
    if (item.timer) clearInterval(item.timer)
  })
  if (fileIsRecording.value) stopRecording()
})

// 全部完成后写入本地完成态 + 设置结束语气泡
watch(isAllCompleted, async (val) => {
  if (val) {
    // 写入本地完成态，首页「赵州桥」变绿（未完成保持白）
    const { useProgressStore } = await import('../stores/progress')
    useProgressStore().markTaskFinished('zhaozhouqiao')
    markZzqCompleted(buildZzqSnapshot() as unknown as Record<string, unknown>)
    talkText.value = completionMessage.value
    isBubbleExpanded.value = true
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

/* ✅按钮：气泡正下方，由flex布局自动定位 */
.left-area {
  position: absolute;
  top: 170px;
  left: 2.5%;
  bottom: 20px;
  width: 55%;
  z-index: 5;
}

.step-flow {
  position: absolute;
  top: 150px;
  right: 2.5%;
  width: 38%;
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
/* 朗读题（voiceOnly）：无打字框，圆形麦克风按钮居中 */
.input-with-action.voice-only {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}
.read-input {
  width: 100%;
  border: 1px solid #bbbbbb;
  border-radius: 8px;
  padding: 9px 48px 9px 12px;
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  background-color: #fff;
  resize: none;
  outline: none;
  line-height: 1;
}
.read-input:focus {
  border-color: #daa520;
}
.read-input.input-wrong {
  border: 2px solid #c2185b;
}
.mic-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
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
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  background-color: #daa520;
  color: #ffffff;
  cursor: pointer;
  margin-top: 18.9px; /* 0.5cm gap */
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
/* 提交中提示：输入框下方展示，带旋转小圈 */
.submitting-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
  min-height: 18px;
}
.submitting-tip::before {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid #ccc;
  border-top-color: #daa520;
  border-radius: 50%;
  animation: submit-spin 0.8s linear infinite;
}
@keyframes submit-spin {
  to { transform: rotate(360deg); }
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
/* 答错锁定(wrong-locked)：3 次都错后学生答案标签变红色，与答对的绿色区分 */
.green-tag.wrong-tag {
  background: #ffb3ba;
  border: 1px solid #c2185b;
  color: #6d0f2c;
}
/* 参考答案（后端正确答案）标签：浅蓝底与学生的绿色答案区分 */
.ref-tag {
  background: #e3f2fd;
  border: 1px solid #42a5f5;
  color: #0d47a1;
  padding: 7px 10px;
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 6px;
}
.ref-tag.fold{
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

.record-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #c2185b;
  min-height: 18px;
}
.record-status.record-hint {
  color: #666;
}
.modal-text-input {
  width: 100%;
  margin-top: 12px;
  border: 1px solid #bbbbbb;
  border-radius: 8px;
  padding: 9px 12px;
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  background-color: #fff;
  resize: none;
  outline: none;
  line-height: 1.5;
}
.modal-text-input:focus {
  border-color: #daa520;
}
.red-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f44336;
  animation: pulse-dot 1s infinite;
}
@keyframes pulse-dot {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* 第4题朗读视频弹窗 */
.video-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-modal-card {
  width: 800px;
  max-width: 90vw;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transform: scale(var(--page-scale, 1));
  transform-origin: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
}
.modal-prompt {
  font-size: 17px;
  line-height: 1.6;
  color: #333;
  text-align: center;
  max-width: 720px;
  margin: 0;
}
.modal-video {
  width: 640px;
  max-width: 100%;
  height: 360px;
  border-radius: 12px;
  object-fit: cover;
  background: #000;
}
/* 第4题后端只配了 gif 动图时：保持宽高展示、白底 */
.modal-video.modal-image {
  object-fit: contain;
  background: #f5f5f5;
}
.modal-video-placeholder {
  width: 640px;
  max-width: 100%;
  height: 360px;
  border-radius: 12px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 15px;
}
.mic-btn-round {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: #2196f3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(33, 150, 243, 0.4);
  transition: all 0.2s;
}
.mic-btn-round:hover {
  background: #1e88e5;
}
.mic-btn-round.recording {
  background: #f44336;
  box-shadow: 0 4px 14px rgba(244, 67, 54, 0.4);
  animation: pulse-dot 1.2s infinite;
}
.mic-btn-round .mic-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

</style>