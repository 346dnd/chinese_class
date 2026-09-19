<template>
  <div class="report-container">
    <PageHeader :title="classReport?.title || '璀璨的中华文化'" @back="$router.back()" position="fixed" transparent />

    <!-- 顶部 5 个全局统计卡片（严格按 GetStuClassReport.summary 渲染） -->
    <div class="global-stat-wrap">
      <div class="stat-card">
        <div class="stat-label">已完成/学习活动</div>
        <div class="stat-value">{{ finishedNodeCount }}<span class="stat-add">/{{ nodeCount }}</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">我的获赞</div>
        <div class="stat-value">{{ likeCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">评论我的</div>
        <div class="stat-value">{{ commentReceivedCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">学习用时</div>
        <div class="stat-value stat-value-blue">{{ studyDurationText }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">学习积分</div>
        <div class="stat-value">
          {{ points }}<span class="stat-add stat-add-red" v-if="pointsChangeText">{{ pointsChangeText }}</span>
        </div>
      </div>
    </div>

    <!-- 活动标签栏（按 GetStuClassReport.nodes[] 渲染） -->
    <div class="activity-tab-wrap">
      <div
        class="tab-item"
        :class="{ active: currentActKey === String(node.id) }"
        v-for="node in nodeList"
        :key="node.id"
        @click="switchActivity(String(node.id))"
      >
        {{ node.title }}
        <span v-if="node.status === 'Finished'" class="tab-check">✓</span>
      </div>
    </div>

    <!-- 主体三栏布局 -->
    <div class="main-three-column">
      <!-- 左侧：用时统计 + 数字人 -->
      <div class="left-col">
        <div class="col-title">你的用时统计 <span class="tip-icon">i</span></div>
        <div class="time-item">
          <span class="item-name">你的用时：</span>
          <span class="item-value">{{ useTimeText }}</span>
        </div>
        <div class="score-item">
          <span class="item-name">获得积分：</span>
          <span class="item-value score-text">{{ pointsEarned }}</span>
        </div>
        <div class="human-box">
          <img src="/image/制片人 1.png" alt="数字人形象" class="human-img" />
        </div>
      </div>

      <!-- 中间：学习过程（按 process.data 的 type 派发） -->
      <div class="center-col">
        <div class="col-title">{{ processTitle || '你的学习过程' }}</div>
        <div class="desc-tip" v-if="processDescription">{{ processDescription }}</div>

        <!-- 1a. 初步感悟 initial-impressions: content 词级高亮（text 段 + 空位 chip），下挂提交历史 -->
        <div v-if="processType === 'initial-impressions'" class="process-list">
          <div class="process-item" v-for="q in initialInsightQuestions" :key="q.id">
            <div class="question-title">{{ q.title }}</div>
            <div class="sentence-line">
              <template v-for="(seg, si) in q.segments" :key="si">
                <span v-if="seg.kind === 'text'" class="seg-text">{{ seg.text }}</span>
                <span
                  v-else
                  class="blank-chip"
                  :class="'blank-' + seg.state.toLowerCase()"
                >{{ seg.answer || seg.placeholder }}</span>
              </template>
            </div>
            <div v-if="q.referenceSentence" class="ref-sentence">
              <span class="ref-label">参考答案</span>
              <span class="ref-text">{{ q.referenceSentence }}</span>
            </div>
            <div class="submit-log" v-for="(log, i) in q.submitLogs" :key="(log.id || 'ilog') + '-' + i">
              <div class="status-row">
                <span v-if="log.isPassed === true" class="status-tag pass-tag">通过</span>
                <span v-else-if="log.isCompleted" class="status-tag fail-tag">未通过</span>
                <span v-else class="status-tag pending-tag">待批改</span>
                <span class="row-time" v-if="log.duration != null">用时 {{ formatDurationClock(log.duration) }}</span>
              </div>
              <div v-if="log.submittedText" class="answer-chip-row">
                <span class="answer-chip" :class="log.isPassed === true ? 'chip-pass' : 'chip-fail'">{{ log.submittedText }}</span>
              </div>
              <div v-if="log.feedback" class="comment-block">
                <div class="block-label">AI 反馈</div>
                <div class="block-content">{{ log.feedback }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 1b. 赵州桥 / 一幅名扬中外的画(cards): 每题 submitLogs 提交 chip -->
        <div
          v-else-if="['expression-methods-zhaozhou-bridge','expression-methods-famous-painting'].includes(processType || '')"
          class="process-list"
        >
          <div class="process-item" v-for="(card, ci) in expressionCards" :key="card.id">
            <div class="question-title">{{ card.title }}</div>
            <div class="submit-log" v-for="(log, i) in card.logs" :key="(log.id || 'clog') + '-' + i">
              <div class="status-row">
                <span v-if="log.isPassed === true" class="status-tag pass-tag">通过</span>
                <span v-else-if="log.isCompleted" class="status-tag fail-tag">未通过</span>
                <span v-else class="status-tag pending-tag">待批改</span>
                <span class="row-time" v-if="log.type === 'get-answer'">查看参考答案</span>
                <span class="row-time" v-else-if="log.duration != null">用时 {{ formatDurationClock(log.duration) }}</span>
              </div>
              <div v-if="log.submittedText" class="answer-chip-row">
                <span class="answer-chip" :class="log.isPassed === true ? 'chip-pass' : 'chip-fail'">{{ log.submittedText }}</span>
              </div>
              <!-- get-answer 提交：直接展示参考答案 -->
              <div v-else-if="log.type === 'get-answer' && log.referenceAnswer" class="comment-block">
                <div class="block-label">参考答案</div>
                <div class="block-content">{{ log.referenceAnswer }}</div>
              </div>
              <div v-if="log.feedback" class="comment-block">
                <div class="block-label">AI 反馈</div>
                <div class="block-content">{{ log.feedback }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 1c. 一幅名扬中外的画(matrix): params.matrix 题干 + 每次提交各空位 chip -->
        <div
          v-else-if="processType === 'expression-methods-famous-painting' && wenMingRows.length"
          class="process-list"
        >
          <div class="process-item" v-for="(row, ri) in wenMingRows" :key="'wm-row-' + ri">
            <div class="question-title">{{ row.title }}</div>
            <div class="submit-log" v-for="(log, li) in row.logs" :key="(log.id || 'wlog') + '-' + li">
              <div class="status-row">
                <span v-if="wenMingLogPassed(log)" class="status-tag pass-tag">通过</span>
                <span v-else-if="log.isCompleted" class="status-tag fail-tag">未通过</span>
                <span v-else class="status-tag pending-tag">待批改</span>
                <span class="row-time" v-if="log.duration != null">用时 {{ formatDurationClock(log.duration) }}</span>
              </div>
              <div class="answer-chip-row" v-if="row.blanks.length">
                <template v-for="(blank, bi) in row.blanks" :key="blank.blankId">
                  <span
                    class="blank-chip"
                    :class="getWenMingBlankClass(log, blank.blankId)"
                  >{{ log.answers?.[blank.blankId] || blank.placeholder }}</span>
                </template>
              </div>
              <div v-if="log.feedback" class="comment-block">
                <div class="block-label">AI 反馈</div>
                <div class="block-content">{{ log.feedback }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 1d. 写写感想 write-reflections: questions[] 整句 answer-box -->
        <div
          v-else-if="processType === 'write-reflections'"
          class="process-list"
        >
          <div
            class="process-item"
            v-for="q in questionsList"
            :key="q.id"
          >
            <div class="question-title">{{ q.title }}</div>
            <div
              class="submit-log"
              v-for="(log, i) in q.submitLogs"
              :key="(log.id || 'log') + '-' + i"
            >
              <div class="status-row">
                <span v-if="log.isPassed === true" class="status-tag pass-tag">通过</span>
                <span v-else-if="log.isCompleted" class="status-tag fail-tag">未通过</span>
                <span v-else class="status-tag pending-tag">待批改</span>
                <span class="row-time" v-if="log.type === 'get-answer'">查看参考答案</span>
                <button
                  v-if="log.offerReferenceAnswer || (log.isCompleted && log.referenceAnswer)"
                  class="explain-btn"
                  @click="showReference = showReference === (q.id + '#' + i) ? '' : (q.id + '#' + i)"
                >
                  <span class="explain-icon" aria-hidden="true">👁</span>
                  {{ showReference === (q.id + '#' + i) ? '收起讲解' : '查看讲解' }}
                </button>
              </div>
              <div class="answer-box" :class="log.isPassed === true ? 'answer-pass' : 'answer-fail'" v-if="log.submittedText">
                <span class="answer-label">学生作答：</span>{{ log.submittedText }}
              </div>
              <div
                v-if="(showReference === (q.id + '#' + i) || showReference === q.id) && log.referenceAnswer"
                class="comment-block"
              >
                <div class="block-label">参考答案</div>
                <div class="block-content">{{ log.referenceAnswer }}</div>
              </div>
              <div v-if="log.feedback" class="comment-block">
                <div class="block-label">AI 反馈</div>
                <div class="block-content">{{ log.feedback }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. presenting-cultural-heritage: 没有 questions，直接是 submitLogs[] (HeritageCulturalSubmitResult) -->
        <div
          v-else-if="processType === 'presenting-cultural-heritage'"
          class="process-list"
        >
          <div
            class="process-item"
            v-for="(log, i) in heritageSubmitLogs"
            :key="(log.id || 'hlog') + '-' + i"
          >
            <div class="status-row">
              <span v-if="log.isPassed === true" class="status-tag pass-tag">通过</span>
              <span v-else-if="log.isCompleted" class="status-tag fail-tag">未通过</span>
              <span v-else class="status-tag pending-tag">待批改</span>
              <span class="row-time" v-if="log.duration != null">用时 {{ formatDurationClock(log.duration) }}</span>
            </div>
            <div class="answer-box" :class="log.isPassed === true ? 'answer-pass' : 'answer-fail'" v-if="log.submittedText">
              <span class="answer-label">学生作答：</span>{{ log.submittedText }}
            </div>
            <div v-if="log.referenceAnswer && log.isCompleted" class="comment-block">
              <div class="block-label">参考答案</div>
              <div class="block-content">{{ log.referenceAnswer }}</div>
            </div>
            <div v-if="log.feedback" class="comment-block">
              <div class="block-label">AI 反馈</div>
              <div class="block-content">{{ log.feedback }}</div>
            </div>
          </div>
        </div>

        <!-- 2. revisiting-cultural-fieldwork: data[] 是题目+交互点记录 -->
        <div
          v-else-if="processType === 'revisiting-cultural-fieldwork'"
          class="process-list"
        >
          <div class="process-item" v-for="(item, i) in revisitingItems" :key="i">
            <div class="question-title">{{ item.title }}</div>
            <div v-if="item.bpRecord?.bpType === 'quick-select'" class="answer-box">
              <span class="answer-label">你的选择：</span>{{ item.bpRecord.selected?.text }}
              <span class="row-time" v-if="item.bpRecord.selected?.duration">
                用时 {{ formatDurationClock(item.bpRecord.selected.duration) }}
              </span>
            </div>
            <div v-else-if="item.bpRecord?.bpType === 'drag-sort'" class="answer-box">
              <span class="answer-label">拖拽排序：</span>
              <span v-if="(item.bpRecord.state?.submitLogs?.length || 0) > 0">已完成</span>
              <span v-else>未作答</span>
            </div>
          </div>
        </div>

        <!-- 3. themed-cultural-creation: data[] 是创作条目 -->
        <div
          v-else-if="processType === 'themed-cultural-creation'"
          class="process-list"
        >
          <div class="process-item" v-for="(item, i) in creationItems" :key="i">
            <div class="question-title">{{ item.title }}</div>
            <div v-if="item.fnRecord?.text" class="answer-box">
              <span class="answer-label">内容：</span>{{ item.fnRecord.text }}
            </div>
            <div v-if="item.fnRecord?.feedback" class="comment-block">
              <div class="block-label">AI 反馈</div>
              <div class="block-content">{{ item.fnRecord.feedback }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="!processType" class="process-empty">暂无学习过程</div>
        <div v-else class="process-empty">本节点报告类型为「{{ processType }}」，暂未适配渲染，请联系开发者补齐</div>
      </div>

      <!-- 右侧：任务评价 -->
      <div class="right-col">
        <!-- 任务评价卡 -->
        <div class="eval-card">
          <div class="col-title">
            {{ evaluation?.title || '任务评价' }}
            <span
              class="rank-badge"
              v-if="evaluation?.rating"
              :style="ratingBadgeStyle"
            >{{ evaluation.rating }}</span>
          </div>

          <div v-if="evaluation?.comment" class="eval-text">{{ evaluation.comment }}</div>

          <div
            v-for="(item, i) in (evaluation?.items || [])"
            :key="'ev-item-' + i"
            class="eval-module"
          >
            <div class="module-title">{{ item.title }}</div>
            <div class="module-content">{{ item.text }}</div>
          </div>

          <div v-if="reportStatus === 'generating'" class="eval-generating">
            <span class="gen-spinner" aria-hidden="true"></span>
            AI 正在生成你的任务评价，请稍候…
          </div>
          <div v-else-if="reportStatus === 'failed'" class="eval-empty">
            本次任务评价生成失败，请稍后重试
          </div>
          <div
            v-else-if="!evaluation?.comment && !(evaluation?.items && evaluation.items.length)"
            class="eval-empty"
          >暂无任务评价</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useProgressStore } from '../stores/progress'
import { DefaultService } from '@/api/generated'
import { call, formatDurationZh, formatDurationClock } from '@/api/helpers'
import type {
  GetStuClassReport,
  ReportProcessEntry,
  WriteThoughtState,
  InitialInsightState,
  InitialImpressionsSubmitResult,
  ZhaoZhouQiaoState,
  ZhaoZhouQiaoSumbitResp,
  HeritageCulturalState,
  HeritageCulturalSubmitResult,
  ReportCSRevisitingItem,
  ReportCWItem,
  WenMingZhongWaiParams,
  WenMingZhongWaiState,
  WenMingZhongWaiSubmitResult
} from '../types'
import type { NodeReport, NodeEvaluation } from '../api/generated'

const route = useRoute()
const progressStore = useProgressStore()

// ============= 班级 id 解析 =============
// 优先取路由 query（各页面跳转 /report 时携带），缺省回退到 progress store 的当前班级（默认 127），
// 避免任何入口漏传 classId 时接口打到 /class/NaN/report 而整页空白。
const resolveClassId = () => Number(route.query.classId) || Number(progressStore.classId) || 127

// ============= 顶层课堂报告 (GetStuClassReport) =============
const classReport = ref<GetStuClassReport | null>(null)

const nodeList = computed(() => classReport.value?.nodes || [])

const finishedNodeCount = computed(() => Number(classReport.value?.summary?.finishedNodeCount ?? 0))
const nodeCount = computed(() => Number(classReport.value?.summary?.nodeCount ?? 0))
const likeCount = computed(() => Number(classReport.value?.summary?.likeCount ?? 0))
const commentReceivedCount = computed(() => Number(classReport.value?.summary?.commentReceivedCount ?? 0))
const points = computed(() => Number(classReport.value?.summary?.points ?? 0))
const studyDurationText = computed(() => formatDurationClock(classReport.value?.summary?.studyDuration))
const pointsChangeText = computed(() => {
  const change = Number(classReport.value?.summary?.pointsChange ?? 0)
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return ''
})

// ============= 当前选中节点的报告 (NodeReport) =============
const currentActKey = ref<string>('')
const nodeReport = ref<NodeReport | null>(null)
// 任务评价走后端独立接口 GET .../node/{nodeId}/evaluation（后端已切新接口）；
// NodeEvaluation 外层 isProcessing 表示 AI 评价是否仍在生成中。
const nodeEvaluation = ref<NodeEvaluation | null>(null)

const useTimeText = computed(() => formatDurationZh(nodeReport.value?.time))
const pointsEarned = computed(() => Number(nodeReport.value?.pointsEarned ?? 0))

// 评价内容：独立接口优先（nodeEvaluation.evaluation），
// 独立接口 404/未上线时降级用节点报告接口的嵌套字段（details.data.evaluation），保证页面始终能显示评价。
const evaluation = computed(
  () => nodeEvaluation.value?.evaluation ?? nodeReport.value?.details?.data?.evaluation
)
const evalGenerating = computed(() => !!nodeEvaluation.value?.isProcessing)
// ⚠️ 后端实际返回 details.process（无 details.data 包裹层）；兼容类型定义路径 details.data.process
const processTitle = computed(() => {
  const d = nodeReport.value?.details
  return d?.data?.process?.title ?? (d as { process?: { title?: string } } | null)?.process?.title
})
const processDescription = computed(() => {
  const d = nodeReport.value?.details
  return d?.data?.process?.description ?? (d as { process?: { description?: string } } | null)?.process?.description
})

// AI 报告生成状态：报告详情(details)未就绪或评价 isProcessing=true 均视为"生成中"；
// errMsg 非空表示该节点报告生成出错。
const reportStatus = computed<'generating' | 'failed' | 'ready'>(() => {
  const nr = nodeReport.value
  if (!nr) return 'generating'
  if (nr.errMsg) return 'failed'
  if (!nr.details) return 'generating'
  if (evalGenerating.value) return 'generating'
  return 'ready'
})

// 生成中轮询：details 未就绪时每 3s 重拉一次（最多 12 次），就绪/出错即停
let reportPollTimer: number | null = null
const stopReportPolling = () => {
  if (reportPollTimer != null) {
    clearInterval(reportPollTimer)
    reportPollTimer = null
  }
}
const pollNodeReportUntilReady = (cid: number, nodeId: number) => {
  stopReportPolling()
  let tries = 0
  reportPollTimer = window.setInterval(async () => {
    tries += 1
    if (tries > 12) {
      stopReportPolling()
      return
    }
    try {
      const r = await call(DefaultService.getApiV1StuClassNodeReport(cid, nodeId))
      nodeReport.value = r
      if (r?.details || r?.errMsg) stopReportPolling()
    } catch {
      /* 单次拉取失败保持"生成中"，下一轮再试 */
    }
  }, 3000)
}

// 评价轮询：独立接口 NodeEvaluation.isProcessing=true 时每 3s 重拉（最多 12 次），生成完成即停
let evalPollTimer: number | null = null
const stopEvalPolling = () => {
  if (evalPollTimer != null) {
    clearInterval(evalPollTimer)
    evalPollTimer = null
  }
}
const pollNodeEvaluationUntilReady = (cid: number, nodeId: number) => {
  stopEvalPolling()
  let tries = 0
  evalPollTimer = window.setInterval(async () => {
    tries += 1
    if (tries > 12) {
      stopEvalPolling()
      return
    }
    try {
      const r = await call(DefaultService.getApiV1StuClassNodeEvaluation(cid, nodeId))
      nodeEvaluation.value = r
      if (!r?.isProcessing) stopEvalPolling()
    } catch {
      /* 单次拉取失败保持"生成中"，下一轮再试 */
    }
  }, 3000)
}

/** 后端 report process.type（业务名）→ 前端渲染分支 key（语义名） */
const REPORT_TYPE_MAP: Record<string, string> = {
  'write-thoughts': 'write-reflections',
  'initial-insight': 'initial-impressions',
  'cultural-style': 'revisiting-cultural-fieldwork',
  'zhaozhouqiao': 'expression-methods-zhaozhou-bridge',
  'wenmingzhongwai': 'expression-methods-famous-painting',
  'heritage-cultural': 'presenting-cultural-heritage',
  'creation-workshop': 'themed-cultural-creation'
}

// process.data 是 anyOf 7 变体，按 type 派发
const processEntry = computed<ReportProcessEntry | undefined>(() => {
  // ⚠️ 后端实际返回 details.process.data（无 details.data 包裹层）；兼容类型定义路径 details.data.process.data
  const d = nodeReport.value?.details?.data?.process?.data
    || (nodeReport.value?.details as { process?: { data?: unknown } } | null)?.process?.data
  if (!d) return undefined
  if ((d as ReportProcessEntry).type) return d as ReportProcessEntry
  return undefined
})
const processType = computed(() => {
  const t = processEntry.value?.type
  return t ? (REPORT_TYPE_MAP[t] || t) : undefined
})

// —— 适配成"题目列表 + 每题 submitLogs"
const questionsList = computed(() => {
  const pe = processEntry.value
  if (!pe) return []
  switch (processType.value) {
    case 'write-reflections':
      return ((pe.data as { state?: WriteThoughtState | null }).state?.questions) || []
    case 'initial-impressions':
      return ((pe.data as { state?: InitialInsightState | null }).state?.questions) || []
    case 'expression-methods-zhaozhou-bridge':
      return ((pe.data as { state?: ZhaoZhouQiaoState | null }).state?.cards) || []
    case 'expression-methods-famous-painting':
      return ((pe.data as { state?: ZhaoZhouQiaoState | null }).state?.cards) || []
    default:
      return []
  }
})

/** heritage-cultural 没有 questions，直接是 submitLogs[] */
const heritageSubmitLogs = computed<HeritageCulturalSubmitResult[]>(() => {
  if (processType.value !== 'presenting-cultural-heritage') return []
  const state = (processEntry.value?.data as { state?: HeritageCulturalState | null }).state
  return (state?.submitLogs || []) as HeritageCulturalSubmitResult[]
})

// ============= 初步感悟：content 词级归一化（text 段 + blank 空位） =============
interface InsightSegText { kind: 'text'; text: string }
interface InsightSegBlank {
  kind: 'blank'
  id: string
  state: string
  answer: string
  placeholder: string
  reference: string
}
type InsightSeg = InsightSegText | InsightSegBlank
interface InsightRenderQuestion {
  id: string
  title: string
  segments: InsightSeg[]
  referenceSentence: string
  submitLogs: InitialImpressionsSubmitResult[]
}

const initialInsightQuestions = computed<InsightRenderQuestion[]>(() => {
  if (processType.value !== 'initial-impressions') return []
  const state = (processEntry.value?.data as { state?: InitialInsightState | null }).state
  return (state?.questions || []).map(q => {
    const segments: InsightSeg[] = []
    const refParts: string[] = []
    const content = (q.content || []) as Array<{ type?: string; id?: string; state?: string; referenceAnswer?: string | null; placeholder?: string | null; value?: { text?: string } | null }>
    for (const c of content) {
      if (c.type === 'text' && c.value?.text) {
        segments.push({ kind: 'text', text: c.value.text })
        refParts.push(c.value.text)
      } else if (c.type === 'blank' && c.id) {
        const logs = (q.submitLogs || []).filter(l => l.blankId === c.id)
        const last = logs[logs.length - 1]
        const reference = c.referenceAnswer || ''
        if (reference) refParts.push(reference)
        segments.push({
          kind: 'blank',
          id: c.id,
          state: c.state || 'UNANSWERED',
          answer: last?.submittedText || '',
          placeholder: c.placeholder || '点击输入',
          reference
        })
      }
    }
    return {
      id: q.id,
      title: q.title,
      segments,
      referenceSentence: refParts.join(''),
      submitLogs: q.submitLogs || []
    }
  })
})

// ============= 赵州桥 / 一幅画：提交 chip 归一化（cards 结构） =============
const expressionCards = computed<Array<{ id: string; title: string; logs: ZhaoZhouQiaoSumbitResp[] }>>(() => {
  if (processType.value !== 'expression-methods-zhaozhou-bridge' && processType.value !== 'expression-methods-famous-painting') return []
  const state = (processEntry.value?.data as { state?: ZhaoZhouQiaoState | null }).state
  return (state?.cards || []).map(card => ({
    id: card.id,
    title: card.title,
    logs: card.submitLogs || []
  }))
})

// ============= 一幅名扬中外的画：matrix 结构（params + state.submitLogs） =============
interface WenMingBlank { blankId: string; placeholder: string }
interface WenMingRenderRow {
  title: string
  blanks: WenMingBlank[]
  logs: WenMingZhongWaiSubmitResult[]
}
const wenMingRows = computed<WenMingRenderRow[]>(() => {
  if (processType.value !== 'expression-methods-famous-painting') return []
  const data = processEntry.value?.data as { params?: WenMingZhongWaiParams | null; state?: WenMingZhongWaiState | null } | null
  const state = data?.state
  // 后端若是 cards 结构则交给 expressionCards 分支
  if ((state as unknown as { cards?: unknown } | null)?.cards) return []
  const rows = data?.params?.matrix?.rows || []
  const logs = state?.submitLogs || []
  return rows
    .filter(row => row.cells.some(c => c.type === 'input'))
    .map(row => ({
      title: row.cells.find(c => c.type === 'text')?.content || row.rowId || '',
      blanks: row.cells.filter(c => c.type === 'input').map(c => ({
        blankId: c.columnKey,
        placeholder: c.content || '点击输入'
      })),
      logs
    }))
})

/** 一幅画提交结果：无 isPassed，通过 errors 判定（errors 空/缺省 = 全对） */
const wenMingLogPassed = (log: WenMingZhongWaiSubmitResult): boolean =>
  !log.errors || log.errors.length === 0

/** 一幅画某空位 chip 样式：错误列表包含该空 → 红；否则有答案 → 绿；无答案 → 灰 */
const getWenMingBlankClass = (log: WenMingZhongWaiSubmitResult, blankId: string): string => {
  const errs = (log.errors || []) as Array<{ blankId?: string; rowId?: string; msg?: string | null }>
  if (errs.some(e => e.blankId === blankId)) return 'blank-wrong'
  if (log.answers?.[blankId]) return 'blank-correct'
  return 'blank-unanswered'
}

const revisitingItems = computed<ReportCSRevisitingItem[]>(() => {
  if (processType.value !== 'revisiting-cultural-fieldwork') return []
  return (processEntry.value?.data as ReportCSRevisitingItem[]) || []
})

const creationItems = computed<ReportCWItem[]>(() => {
  if (processType.value !== 'themed-cultural-creation') return []
  return (processEntry.value?.data as ReportCWItem[]) || []
})

// S/A/B/C/D/E/F 徽章颜色
const ratingBadgeStyle = computed(() => {
  const ev = evaluation.value
  const bg = ev?.ratingColor?.bg
  const fg = ev?.ratingColor?.fg
  if (!bg && !fg) return {}
  return { background: bg || undefined, color: fg || undefined }
})

// 控制每条 submitLog 的"查看评语"展开
const showReference = ref<string>('')

// ============= 切换活动 =============
const switchActivity = async (key: string) => {
  currentActKey.value = key
  showReference.value = ''
  stopReportPolling()
  stopEvalPolling()
  try {
    // 报告与任务评价并行拉取；评价接口失败不阻塞报告展示（评价显示"暂无任务评价"）
    const [nr, ne] = await Promise.all([
      call(DefaultService.getApiV1StuClassNodeReport(resolveClassId(), Number(key))),
      call(DefaultService.getApiV1StuClassNodeEvaluation(resolveClassId(), Number(key))).catch(() => null)
    ])
    nodeReport.value = nr
    nodeEvaluation.value = ne
    // 报告未生成完（details 为空且无错误）则轮询等待
    if (!nr?.details && !nr?.errMsg) {
      pollNodeReportUntilReady(resolveClassId(), Number(key))
    } else {
      stopReportPolling()
    }
    // 评价仍在生成中则轮询独立接口
    if (ne?.isProcessing) {
      pollNodeEvaluationUntilReady(resolveClassId(), Number(key))
    } else {
      stopEvalPolling()
    }
  } catch (e) {
    console.error('[report] 加载节点报告失败:', e)
    nodeReport.value = null
    nodeEvaluation.value = null
    stopReportPolling()
    stopEvalPolling()
  }
}

// ============= 加载 =============
onMounted(async () => {
  try {
    classReport.value = await call(DefaultService.getApiV1StuClassReport(resolveClassId()))
  } catch (e) {
    console.error('[report] 加载课堂报告失败:', e)
    classReport.value = null
  }

  // 路由携带 activeActivityKey 优先
  const initKey = (route.query.activeActivityKey as string) || (route.query.nodeId as string) || ''
  if (initKey) {
    await switchActivity(initKey)
  } else if (nodeList.value.length) {
    await switchActivity(String(nodeList.value[0].id))
  }
})

// 路由变化时联动
watch(() => route.query.activeActivityKey, (v) => {
  if (v && nodeList.value.length) switchActivity(String(v))
})

onUnmounted(() => {
  stopReportPolling()
  stopEvalPolling()
})
</script>

<style scoped lang="scss">
/* —— 按原型「无背景」设计：根容器与页面底色统一白/略偏冷 —— */
.report-container {
  width: 100%;
  min-height: 100vh;
  /* #app 是 overflow:hidden 的 flex 容器（锁死视口高、禁整页滚动）；
     本页锁死视口高并禁止自身滚动，超高内容由三栏各自内部滚动（overflow-y:auto）。 */
  height: 100vh;
  overflow: hidden;
  padding: 89px 24px 24px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 1;
  /* 与原型对齐：纯白底（卡片自身已带浅边描边，无需背景纹理） */
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
}
.global-stat-wrap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  .stat-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 18px 16px;
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 34px;
      font-weight: bold;
      color: #222;
      line-height: 1.1;
      .stat-add {
        font-size: 14px;
        font-weight: normal;
        margin-left: 4px;
        color: #999;
      }
      .stat-add-red {
        color: #f53f3f;
        font-weight: 600;
        font-size: 16px;
      }
    }
    /* 原型里学习用时 32:35 用蓝色高亮 */
    .stat-value-blue {
      color: #1677ff;
    }
  }
}
.activity-tab-wrap {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  background: transparent;
  flex-wrap: wrap;
  .tab-item {
    padding: 11px 20px;
    cursor: pointer;
    font-size: 15px;
    color: #666;
    position: relative;
    &.active {
      color: #1677ff;
      &::after {
        content: '';
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: -1px;
        height: 2px;
        background: #1677ff;
        border-radius: 2px;
      }
    }
    .tab-check {
      color: #00b42a;
      margin-left: 4px;
    }
  }
}
.main-three-column {
  display: grid;
  /* 三列：左固定 / 中弹性（minmax(0,1fr) 允许收缩到 0，避免窄窗口把内容挤出屏幕）/ 右固定；右栏内部上下堆叠两张卡片 */
  grid-template-columns: 265px minmax(0, 1fr) 340px;
  gap: 20px;
  /* 占满剩余高度，列默认 stretch 填满行高；内容超高时由各列 overflow-y:auto 内部滚动，整页不滚 */
  flex: 1;
  min-height: 0;
  min-width: 0;
}
.left-col {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 18px;
  overflow-y: auto;
  min-width: 0;
  .col-title {
    font-size: 19px;
    font-weight: 500;
    margin-bottom: 18px;
    color: #222;
    .tip-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid #999;
      text-align: center;
      font-size: 12px;
      line-height: 14px;
      color: #666;
      margin-left: 6px;
      vertical-align: middle;
    }
  }
  .time-item, .score-item {
    margin-bottom: 14px;
    font-size: 15px;
    .item-name { color: #555; }
    .item-value {
      font-weight: 500;
      color: #1677ff; /* 原型两行数字均蓝色 */
    }
  }
  .score-item .item-value.score-text {
    color: #1677ff;
    font-size: 18px;
  }
  .human-box {
    margin-top: 14px;
    text-align: center;
    .human-img {
      /* 缩小数字人，给内容留出更多纵向空间（原 170px） */
      width: 118px;
      display: block;
      margin: 0 auto;
    }
  }
}
.center-col {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 18px;
  overflow-y: auto;
  min-width: 0;
  .col-title {
    font-size: 19px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #222;
  }
  .desc-tip {
    font-size: 13px;
    color: #999;
    margin-bottom: 18px;
  }
  .process-list {
    .process-item {
      margin-bottom: 18px;
      .question-title {
        font-size: 14px;
        padding: 8px 12px;
        background: #eef5ff;
        color: #1677ff;
        border-radius: 4px;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      /* 初步感悟：句内词级高亮 */
      .sentence-line {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        line-height: 1.8;
        margin-bottom: 8px;
        .seg-text {
          color: #333;
        }
        .blank-chip {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 13px;
          border: 1px solid;
          line-height: 1.6;
          &.blank-correct { background: #e6f7ef; border-color: #00b42a; color: #00871f; }
          &.blank-wrong { background: #fff2f0; border-color: #f53f3f; color: #cf1322; }
          &.blank-retrying, &.blank-pending { background: #fffbe6; border-color: #faad14; color: #ad6800; }
          &.blank-unanswered { background: #f4f4f5; border-color: #d9d9d9; color: #909399; }
        }
      }
      .ref-sentence {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        .ref-label {
          flex-shrink: 0;
          font-size: 13px;
          color: #faad14;
          font-weight: 500;
        }
        .ref-text {
          flex: 1;
          background: #fffbe6;
          border: 1px solid #ffe58f;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          color: #333;
        }
      }
      /* 提交级 chip（赵州桥/一幅画） */
      .answer-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
        .answer-chip {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          border: 1px solid;
          line-height: 1.6;
          &.chip-pass { background: #e6f7ef; border-color: #00b42a; color: #00871f; }
          &.chip-fail { background: #fff2f0; border-color: #f53f3f; color: #cf1322; }
        }
      }
      .submit-log {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px dashed #eee;
        &:last-child { border-bottom: none; }
      }
      .status-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        .status-tag {
          padding: 2px 9px;
          border-radius: 4px;
          font-size: 13px;
          &.pass-tag { background: #e6f7ef; color: #00b42a; }
          &.fail-tag { background: #fff2f0; color: #f53f3f; }
          &.pending-tag { background: #f4f4f5; color: #909399; }
        }
        .row-time {
          font-size: 13px;
          color: #999;
          margin-left: auto;
        }
        .explain-btn {
          background: #1677ff;
          color: #fff;
          border: none;
          border-radius: 4px;
          padding: 3px 12px;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          &:hover { opacity: 0.9; }
          .explain-icon {
            font-size: 12px;
            line-height: 1;
          }
        }
      }
      .answer-box {
        border: 1px solid;
        padding: 9px 12px;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 8px;
        color: #333;
        .answer-label {
          font-weight: 500;
          margin-right: 4px;
        }
        /* 通过：绿色（与通过徽章同色系） */
        &.answer-pass {
          border-color: #00b42a;
          background: #f0fff6;
          .answer-label { color: #00b42a; }
        }
        /* 未通过：红色（与未通过徽章同色系） */
        &.answer-fail {
          border-color: #f53f3f;
          background: #fff2f0;
          .answer-label { color: #f53f3f; }
        }
      }
      .comment-block {
        margin-bottom: 8px;
        .block-label {
          font-size: 13px;
          color: #faad14;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .block-content {
          background: #fffbe6;
          border: 1px solid #ffe58f;
          padding: 9px 12px;
          border-radius: 4px;
          font-size: 14px;
          color: #333;
        }
      }
    }
  }
  .process-empty {
    color: #999;
    font-size: 13px;
    padding: 20px 0;
  }
}

/* 右栏：两张卡片垂直堆叠 */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  min-width: 0;
  /* 内容超高时右栏内部滚动（避免整页滚动） */
  overflow-y: auto;
  > .eval-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 18px;
    overflow-y: auto;
  }

  .eval-card {
    .col-title {
      font-size: 19px;
      font-weight: 500;
      margin-bottom: 12px;
      color: #222;
      display: flex;
      align-items: center;
      .rank-badge {
        background: #e8f3ff;
        color: #1677ff;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 14px;
        margin-left: 8px;
        font-weight: 500;
      }
    }
    .eval-text {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      margin-bottom: 16px;
    }
    .eval-module {
      margin-bottom: 20px;
      &:last-child { margin-bottom: 0; }
      .module-title {
        font-size: 16px;
        font-weight: 500;
        color: #faad14;
        margin-bottom: 6px;
      }
      .module-content {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }
    }
    .eval-empty {
      color: #999;
      font-size: 13px;
      padding: 10px 0;
    }
    .eval-generating {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      padding: 14px 0;
      .gen-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #d9d9d9;
        border-top-color: #1677ff;
        border-radius: 50%;
        flex-shrink: 0;
        animation: report-gen-spin 0.9s linear infinite;
      }
    }
    @keyframes report-gen-spin {
      to { transform: rotate(360deg); }
    }
  }
}

/* —— 响应式适配：窄窗口下元素不跑出屏幕 —— */
@media (max-width: 1200px) {
  .main-three-column {
    grid-template-columns: 220px minmax(0, 1fr) 300px;
    gap: 14px;
  }
}
@media (max-width: 960px) {
  .report-container {
    padding: 89px 16px 16px;
    /* 单列堆叠时内容较多，恢复整页可滚动 */
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }
  /* 三栏堆叠为单列：左(用时统计) → 中(学习过程) → 右(评价) */
  .main-three-column {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .right-col {
    overflow: visible;
  }
  .global-stat-wrap {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}
@media (max-width: 620px) {
  .global-stat-wrap {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat-value {
    font-size: 26px !important;
  }
}
@media (max-width: 420px) {
  .global-stat-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
