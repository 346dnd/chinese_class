/**
 * API 接口层 - 严格按 OpenAPI 字段定义
 * 来源(权威): openapi/默认模块.openapi.json  （直接导出的后端接口文件）
 * 备份参考:   openapi/语文课堂.openapi .json
 *
 * 路径前缀: /api/v1/stu/class/{classId}/node/{nodeId}/...
 * 返回结构: { code, msg, data }（callApi 已解包，直接返回 data）
 *
 * USE_MOCK=true 时返回内置 mock（OpenAPI 字段形状），后端未启动时保证页面可用
 *
 * 2026-08-13 校正：全量对齐 OpenAPI 契约（以「默认模块.openapi.json」为准）
 *  - HeritageCulturalState 改回 { submitLogs }，新增 params / submissions/{id} / v4 ending 三个接口
 *  - 各模块 State/Params/SubmitResult 的 mock 形状同步为最新 schema
 *  - cultural-style 的 quick-select submit 路径严格按 OpenAPI 使用复数 `/nodes/{nodeId}`
 *    （同服务其余路径为单数 `/node/{nodeId}`，属后端真实路由差异，前端须一致）
 */
import { callApi, request, USE_MOCK, BASE_URL } from './request'
import type {
  AccountStatus,
  AccountUser,
  AsyncSubmitResp,
  CSBpDragSortEntry,
  CSBpDragSortParams,
  CSBpDragSortState,
  CSBpDragSortSubmitResult,
  CSBpQuickSelectParams,
  CulturalStyleParams,
  CulturalStyleState,
  CWAIEvaluation,
  CWParams,
  CWState,
  CWSubmitReq,
  CWTextContent,
  ChatReq,
  ChatResp,
  CreateSessionReq,
  EndingResp,
  EnterClassNodeReq,
  GetMomentSourcesResp,
  StuClassV1DetailResp,
  GetSessionContextResp,
  HeritageCulturalEndingResp,
  HeritageCulturalParams,
  HeritageCulturalState,
  HeritageCulturalSubmitResult,
  InitialImpressionsParams,
  InitialImpressionsSubmitResult,
  InitialInsightState,
  LoginRespData,
  Moment,
  UtilsDownloadResp,
  UtilsOcrResp,
  UtilsTranscriptionsResp,
  UtilsUploadResp,
  WenMingZhongWaiParams,
  WenMingZhongWaiState,
  WenMingZhongWaiSubmitResult
} from '../types'

export { request, USE_MOCK, toUserFriendlyError, isNodeNotConfigured } from './request'

// 默认班级/节点 ID（mock 用，真实接入后从路由/store 获取）
const DEFAULT_CLASS_ID = Number(import.meta.env.VITE_CLASS_ID) || 127
const DEFAULT_NODE_ID = Number(import.meta.env.VITE_NODE_ID) || 17

// ============= 通用 / 账号 =============

/** 默认 mock 用户（与后端 AccountUser 字段对齐） */
const mockUser: AccountUser = {
  id: 1,
  code: '',
  username: 'admin',
  role: 'student',
  realName: '同学',
  avatarUrl: '/image/小小_汉服 1.png',
  gender: '',
  city: '',
  gradeName: '',
  className: ''
}

/** POST /api/v1/accounts:login 用户登录（form-data: username + password） */
export function login(username: string, password: string): Promise<LoginRespData> {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return callApi<LoginRespData>(
    {
      method: 'post',
      url: '/v1/accounts:login',
      data: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    {
      token: 'mock-token-' + Date.now(),
      user: { ...mockUser, username }
    }
  )
}

/** GET /api/v1/accounts:status 获取用户登录状态（返回 AccountStatus） */
export function getAccountStatus(): Promise<AccountStatus | null> {
  return callApi<AccountStatus | null>(
    { method: 'get', url: '/v1/accounts:status' },
    USE_MOCK ? { loggedIn: true, user: mockUser } : null
  )
}

// ============= 写写感想 (write-thoughts) =============

const basePath = (classId = DEFAULT_CLASS_ID, nodeId = DEFAULT_NODE_ID) =>
  `/v1/stu/class/${classId}/node/${nodeId}`

/** GET /v4/stu/class/{classId}/node/{nodeId}/write-thoughts/ending 获取写写感想结束语（后端 AI 总结） */
export function getWriteThoughtEnding(
  classId = DEFAULT_CLASS_ID,
  nodeId = 17
): Promise<EndingResp> {
  return callApi<EndingResp>(
    { method: 'get', url: `/v4/stu/class/${classId}/node/${nodeId}/write-thoughts/ending` },
    {
      isProcessing: false,
      comment: '你联系课文内容和生活实际，把对中华优秀传统文化的自豪感写得真真切切，很会表达！'
    }
  )
}

// ============= 初步感悟 (initial-insight) =============

/** GET .../initial-insight/params 获取参数 */
export function getInitialInsightParams(
  classId = DEFAULT_CLASS_ID,
  nodeId = 18
): Promise<InitialImpressionsParams> {
  return callApi<InitialImpressionsParams>(
    { method: 'get', url: `${basePath(classId, nodeId)}/initial-insight/params` },
    {
      title: '初步感悟',
      introVideo: { autoPlay: false, url: '' },
      introBubbleText: '来体会"围绕一个意思把一段话写清楚"的表达方法吧。',
      subtitle: '初步感悟',
      description: [
        { text: '围绕一个意思写清楚', style: { size: 16, weight: 400, color: '#333', lineHeight: 24, letterSpacing: 0 } }
      ]
    }
  )
}

/** GET .../initial-insight/state 获取状态 */
export function getInitialInsightState(
  classId = DEFAULT_CLASS_ID,
  nodeId = 18
): Promise<InitialInsightState> {
  return callApi<InitialInsightState>(
    { method: 'get', url: `${basePath(classId, nodeId)}/initial-insight/state` },
    {
      questions: [
        {
          id: 'q-bridge',
          title: '在《赵州桥》的课文中',
          content: [],
          submitLogs: []
        }
      ]
    }
  )
}

/** POST .../initial-insight/{questionId}/submissions 提交回答 */
export function submitInitialInsight(
  questionId: string,
  blankId: string,
  input: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 18
): Promise<AsyncSubmitResp> {
  return callApi<AsyncSubmitResp>(
    {
      method: 'post',
      url: `${basePath(classId, nodeId)}/initial-insight/${questionId}/submissions`,
      data: { questionId, blankId, input }
    },
    { submitId: 'ii-' + Date.now(), tip: '已收到你的作答，正在点评…' }
  )
}

/** GET .../initial-insight/{questionId}/submissions/{submitId} 获取提交结果 */
export function getInitialInsightSubmitResult(
  questionId: string,
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 18
): Promise<InitialImpressionsSubmitResult> {
  return callApi<InitialImpressionsSubmitResult>(
    {
      method: 'get',
      url: `${basePath(classId, nodeId)}/initial-insight/${questionId}/submissions/${submitId}`
    },
    {
      id: submitId,
      questionId,
      blankId: 'blank-0',
      submittedText: '石栏',
      isProcessing: false,
      isPassed: true,
      isCompleted: true,
      referenceAnswer: '石栏',
      feedback: '答对了！'
    }
  )
}

/** GET .../initial-insight/ending 获取结束语（v4） */
export function getInitialInsightEnding(
  classId = DEFAULT_CLASS_ID,
  nodeId = 18
): Promise<EndingResp> {
  return callApi<EndingResp>(
    { method: 'get', url: `/v4/stu/class/${classId}/node/${nodeId}/initial-insight/ending` },
    {
      isProcessing: false,
      comment: '太棒啦！你已经掌握了围绕一个意思把一段话写清楚的阅读方法！'
    }
  )
}

// ============= 文化采风 (cultural-style) =============

/** GET .../cultural-style/params 获取参数 */
export function getCulturalStyleParams(
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<CulturalStyleParams> {
  return callApi<CulturalStyleParams>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/params` },
    {
      title: '重温文化采风',
      introVideo: { autoPlay: false, url: '' },
      video: { id: 'v-1', title: '清明上河图', src: '/清明上河图.mp4', thumbnail: '' }
    }
  )
}

/** GET .../cultural-style/state 获取状态 */
export function getCulturalStyleState(
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<CulturalStyleState> {
  return callApi<CulturalStyleState>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/state` },
    {
      title: '重温文化采风',
      desc: '观看视频，体会文化采风。',
      video: { id: 'v-1', title: '清明上河图', src: '/清明上河图.mp4', thumbnail: '' },
      questions: [],
      completed: false
    }
  )
}

/** PATCH .../cutural-style/state:sync-time 更新播放进度（注意 OpenAPI 路径拼写为 cutural-style） */
export function syncCulturalStyleTime(
  currentTime: number,
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<void> {
  return callApi<void>(
    {
      method: 'patch',
      url: `${basePath(classId, nodeId)}/cutural-style/state:sync-time`,
      data: { currentTime }
    },
    undefined
  )
}

/** GET .../cultural-style/ending 视频播放完毕获取结束语 */
export function getCulturalStyleEnding(
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<EndingResp> {
  return callApi<EndingResp>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/ending` },
    { isProcessing: false, comment: '视频看完啦，我们继续探索文化吧！' }
  )
}

/** GET .../cultural-style/breakpoints/quick-select/{bpId}/params 获取快选参数 */
export function getQuickSelectParams(
  bpId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<CSBpQuickSelectParams> {
  return callApi<CSBpQuickSelectParams>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/breakpoints/quick-select/${bpId}/params` },
    {
      title: '快速选择',
      description: '请选择你认为最合适的一项。',
      introBubbleText: '我们先来做一个小选择。',
      timeLimit: 30,
      selections: [
        { id: 'opt-1', text: '选项一' },
        { id: 'opt-2', text: '选项二' }
      ]
    }
  )
}

/**
 * POST .../cultural-style/breakpoints/quick-select/{bpId}/submit 提交选择
 * 严格按 OpenAPI（默认模块.openapi.json，直接导出的权威接口）实现：
 * 该路径为 `/nodes/{nodeId}/...`（复数 nodes），与同服务其它单数 `/node/` 路径不同，
 * 属后端真实路由，前端须严格保持一致。
 */
export function submitQuickSelect(
  bpId: string,
  selectedId: string | null,
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<void> {
  return callApi<void>(
    {
      method: 'post',
      url: `/v1/stu/class/${classId}/nodes/${nodeId}/cultural-style/breakpoints/quick-select/${bpId}/submit`,
      data: { selectedId }
    },
    undefined
  )
}

/** GET .../cultural-style/breakpoints/drag-sort/{bpId}/params 获取拖拽排序参数 */
export function getDragSortParams(
  bpId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<CSBpDragSortParams> {
  return callApi<CSBpDragSortParams>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/breakpoints/drag-sort/${bpId}/params` },
    {
      title: '拖拽排序',
      description: '把下面的步骤按顺序拖拽排列。',
      introBubbleText: '我们一起把步骤排好顺序。',
      trailingText: '完成上面的步骤。',
      instruction: '拖动卡片到正确位置。',
      blanks: [{ leadingText: '第一步：' }],
      entries: [
        { id: 'item-1', text: '第一步' },
        { id: 'item-2', text: '第二步' }
      ]
    }
  )
}

/** GET .../cultural-style/breakpoints/drag-sort/{bpId}/state 获取拖拽排序状态 */
export function getDragSortState(
  bpId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<CSBpDragSortState> {
  return callApi<CSBpDragSortState>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/breakpoints/drag-sort/${bpId}/state` },
    { submitLogs: [] }
  )
}

/** POST .../cultural-style/breakpoints/drag-sort/{bpId}/submissions 提交拖拽排序 */
export function submitDragSort(
  bpId: string,
  answer: CSBpDragSortEntry[],
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<AsyncSubmitResp> {
  return callApi<AsyncSubmitResp>(
    {
      method: 'post',
      url: `${basePath(classId, nodeId)}/cultural-style/breakpoints/drag-sort/${bpId}/submissions`,
      data: { answer }
    },
    { submitId: 'ds-' + Date.now(), tip: '已收到你的排序，正在核对…' }
  )
}

/** GET .../cultural-style/breakpoints/drag-sort/{bpId}/submissions/{submitId} 查询拖拽排序结果 */
export function getDragSortSubmitResult(
  bpId: string,
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 19
): Promise<CSBpDragSortSubmitResult> {
  return callApi<CSBpDragSortSubmitResult>(
    { method: 'get', url: `${basePath(classId, nodeId)}/cultural-style/breakpoints/drag-sort/${bpId}/submissions/${submitId}` },
    {
      id: submitId,
      answer: [{ id: 'item-1', text: '第一步' }],
      isProcessing: false,
      isPassed: true,
      isCompleted: true,
      referenceAnswer: [{ id: 'item-1', text: '第一步' }],
      feedback: '顺序正确！',
      duration: 3
    }
  )
}

// ============= 赵州桥 (zhaozhouqiao) =============

// ============= 一幅名扬中外的画 (wenmingzhongwai) =============

/** GET .../wenmingzhongwai/params 获取参数 */
export function getWenMingZhongWaiParams(
  classId = DEFAULT_CLASS_ID,
  nodeId = 21
): Promise<WenMingZhongWaiParams> {
  return callApi<WenMingZhongWaiParams>(
    { method: 'get', url: `${basePath(classId, nodeId)}/wenmingzhongwai/params` },
    {
      title: '一幅名扬中外的画',
      introVideo: { autoPlay: false, url: '' },
      introBubbleText: '我们来学习《一幅名扬中外的画》围绕一个意思把一段话写清楚的表达方法。',
      description: '围绕一个意思把一段话写清楚',
      matrix: {
        columns: [
          { key: 'r1', title: '一个意思', flex: 1 },
          { key: 'r2', title: '中心句', flex: 1 },
          { key: 'r3', title: '围绕写具体', flex: 2 }
        ],
        rows: [
          {
            rowId: 'row-1',
            cells: [
              { columnKey: 'r1', type: 'text', content: '热闹', studentAnswer: null, status: null, feedback: null },
              { columnKey: 'r2', type: 'input', content: '', studentAnswer: null, status: null, feedback: null },
              { columnKey: 'r3', type: 'input', content: '', studentAnswer: null, status: null, feedback: null }
            ]
          }
        ]
      }
    }
  )
}

/** GET .../wenmingzhongwai/state 获取状态 */
export function getWenMingZhongWaiState(
  classId = DEFAULT_CLASS_ID,
  nodeId = 21
): Promise<WenMingZhongWaiState> {
  return callApi<WenMingZhongWaiState>(
    { method: 'get', url: `${basePath(classId, nodeId)}/wenmingzhongwai/state` },
    { submitLogs: [] }
  )
}

/** POST .../wenmingzhongwai/{questionId}/submissions 提交回答 */
export function submitWenMingZhongWai(
  questionId: string,
  answers: Record<string, string>,
  classId = DEFAULT_CLASS_ID,
  nodeId = 21
): Promise<AsyncSubmitResp> {
  return callApi<AsyncSubmitResp>(
    {
      method: 'post',
      url: `${basePath(classId, nodeId)}/wenmingzhongwai/${questionId}/submissions`,
      data: { answers }
    },
    { submitId: 'wm-' + Date.now(), tip: '已收到你的作答，正在点评…' }
  )
}

/** GET .../wenmingzhongwai/submissions/{submitId} 查询提交状态 */
export function getWenMingZhongWaiSubmitResult(
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 21
): Promise<WenMingZhongWaiSubmitResult> {
  return callApi<WenMingZhongWaiSubmitResult>(
    { method: 'get', url: `${basePath(classId, nodeId)}/wenmingzhongwai/submissions/${submitId}` },
    {
      id: submitId,
      answers: {},
      isProcessing: false,
      errors: [],
      isCompleted: true,
      referenceAnswer: {},
      feedback: '完成得不错！',
      ending: {},
      duration: 4
    }
  )
}

// ============= 宣传优秀文化 (heritage-cultural) =============

/** GET .../heritage-cultural/params 获取板块导入内容（标题 / 导入视频 / 对话气泡） */
export function getHeritageCulturalParams(
  classId = DEFAULT_CLASS_ID,
  nodeId = 22
): Promise<HeritageCulturalParams> {
  return callApi<HeritageCulturalParams>(
    { method: 'get', url: `${basePath(classId, nodeId)}/heritage-cultural/params` },
    {
      string: '宣传文化：讲解优秀文化',
      introVideo: { autoPlay: true, url: 'https://example.com/videos/heritage-cultural-intro.mp4' },
      introBubbles: [
        { role: 'foreigner', text: '你们中国有这么多有趣的文化，我都不知道从哪说起！' },
        { role: 'native', text: '那我们就选一个最让你自豪的传统文化，清楚地介绍给大家吧。' }
      ]
    }
  )
}

/** GET .../heritage-cultural/state 获取状态（历史提交记录） */
export function getHeritageCulturalState(
  classId = DEFAULT_CLASS_ID,
  nodeId = 22
): Promise<HeritageCulturalState> {
  return callApi<HeritageCulturalState>(
    { method: 'get', url: `${basePath(classId, nodeId)}/heritage-cultural/state` },
    { submitLogs: [] }
  )
}

/** POST .../heritage-cultural/submissions 提交讲解文本 */
export function submitHeritageCultural(
  text: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 22
): Promise<AsyncSubmitResp> {
  return callApi<AsyncSubmitResp>(
    {
      method: 'post',
      url: `${basePath(classId, nodeId)}/heritage-cultural/submissions`,
      data: { text }
    },
    { submitId: 'hc-' + Date.now(), tip: '已收到你的讲解，正在请老师点评…' }
  )
}

/** GET .../heritage-cultural/submissions/{submitId} 轮询评测结果 */
export function getHeritageCulturalSubmitResult(
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 22
): Promise<HeritageCulturalSubmitResult> {
  return callApi<HeritageCulturalSubmitResult>(
    { method: 'get', url: `${basePath(classId, nodeId)}/heritage-cultural/submissions/${submitId}` },
    {
      id: submitId,
      submittedText: '我想介绍中国的春节。',
      isProcessing: false,
      isPassed: true,
      isCompleted: true,
      referenceAnswer: '',
      feedback: '你围绕一个意思把优秀传统文化讲得很清楚，点赞！',
      duration: 5
    }
  )
}

/** GET .../heritage-cultural/ending 结束任务，返回总评（v4） */
export function getHeritageCulturalEnding(
  classId = DEFAULT_CLASS_ID,
  nodeId = 22
): Promise<HeritageCulturalEndingResp> {
  return callApi<HeritageCulturalEndingResp>(
    { method: 'get', url: `/v4/stu/class/${classId}/node/${nodeId}/heritage-cultural/ending` },
    {
      isProcessing: false,
      passed: true,
      comment: '你围绕一个意思把优秀传统文化讲得很清楚，点赞！',
      errorCount: 0,
      revealed: false,
      correctAnswer: ''
    }
  )
}

// ============= 文化交流（创作） creation-workshop =============
// 来源: openapi 默认模块 / 课程内容/宣传文化展播厅/文化交流（创作）
// 路径前缀: /v1/stu/class/{classId}/node/{nodeId}/creation-workshop/{taskId}/...

const cwBase = (classId = DEFAULT_CLASS_ID, nodeId = 23) =>
  `${basePath(classId, nodeId)}/creation-workshop`

// ---- 生成 (generation) ----
/** GET .../creation-workshop/{taskId}/generation/params */
export function getGenerationParams(
  taskId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<CWParams> {
  return callApi<CWParams>(
    { method: 'get', url: `${cwBase(classId, nodeId)}/${taskId}/generation/params` },
    { introBubbleText: '', title: '创作', description: '', inputs: [] }
  )
}

/** GET .../creation-workshop/{taskId}/generation/state */
export function getGenerationState(
  taskId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<CWState> {
  return callApi<CWState>(
    { method: 'get', url: `${cwBase(classId, nodeId)}/${taskId}/generation/state` },
    { creationLogs: [], isPublish: false, duration: '' }
  )
}

/** POST .../creation-workshop/{taskId}/generation/submit/{submitId} 最终确认提交 */
export function finalizeGeneration(
  taskId: string,
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<void> {
  return callApi<void>(
    { method: 'post', url: `${cwBase(classId, nodeId)}/${taskId}/generation/submit/${submitId}` },
    undefined
  )
}

// ---- 诗歌与剧本 (poemscripts) ----
/** GET .../creation-workshop/{taskId}/poemscripts/params */
export function getPoemScriptParams(
  taskId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<CWParams> {
  return callApi<CWParams>(
    { method: 'get', url: `${cwBase(classId, nodeId)}/${taskId}/poemscripts/params` },
    { introBubbleText: '', title: '诗歌与剧本', description: '', inputs: [] }
  )
}

/** GET .../creation-workshop/{taskId}/poemscripts/state */
export function getPoemScriptState(
  taskId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<CWState> {
  return callApi<CWState>(
    { method: 'get', url: `${cwBase(classId, nodeId)}/${taskId}/poemscripts/state` },
    { creationLogs: [], isPublish: false, duration: '' }
  )
}

/** POST .../creation-workshop/{taskId}/poemscripts/submit/{submitId} 最终确认提交 */
export function finalizePoemScript(
  taskId: string,
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<void> {
  return callApi<void>(
    { method: 'post', url: `${cwBase(classId, nodeId)}/${taskId}/poemscripts/submit/${submitId}` },
    undefined
  )
}

// ---- 表达 (express) ----
/** POST .../creation-workshop/{taskId}/express/submit 提交表达（{textContent, taskType}） */
export function submitExpress(
  taskId: string,
  textContent: string,
  taskType: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<AsyncSubmitResp> {
  return callApi<AsyncSubmitResp>(
    {
      method: 'post',
      url: `${cwBase(classId, nodeId)}/${taskId}/express/submit`,
      data: { textContent, taskType } as CWSubmitReq
    },
    { submitId: 'expr-' + Date.now(), tip: '已收到你的表达，正在生成…' }
  )
}

// ---- 分享讲解 (share) ----
/** POST .../creation-workshop/{taskId}/share/submit 提交分享讲解（{textContent, taskType}） */
export function submitShare(
  taskId: string,
  textContent: string,
  taskType: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<AsyncSubmitResp> {
  return callApi<AsyncSubmitResp>(
    {
      method: 'post',
      url: `${cwBase(classId, nodeId)}/${taskId}/share/submit`,
      data: { textContent, taskType } as CWSubmitReq
    },
    { submitId: 'share-' + Date.now(), tip: '已收到你的分享讲解，正在 AI 评测…' }
  )
}

/** GET .../creation-workshop/{taskId}/share/{submitId}/result 查询分享讲解 AI 评测结果 */
export function getShareResult(
  taskId: string,
  submitId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<CWAIEvaluation> {
  return callApi<CWAIEvaluation>(
    { method: 'get', url: `${cwBase(classId, nodeId)}/${taskId}/share/${submitId}/result` },
    {
      id: submitId, isProcessing: false, isSuccessful: true, isCompleted: true,
      feedback: '', evaluation: { text: '', audio: { audioId: '', src: '' } }, TextContent: {}, duration: 0
    }
  )
}

// ---- 文本内容 / 任务提交 ----
/** GET .../creation-workshop/{textId}/textcontent 获取文本内容 */
export function getCWTextContent(
  textId: string,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<CWTextContent> {
  return callApi<CWTextContent>(
    { method: 'get', url: `${cwBase(classId, nodeId)}/${textId}/textcontent` },
    {}
  )
}

/** POST .../creation-workshop/task/creationSubmit 提交创作任务（body 由调用方按后端要求传入） */
export function submitCreationTask(
  body: Record<string, unknown>,
  classId = DEFAULT_CLASS_ID,
  nodeId = 23
): Promise<unknown> {
  return callApi<unknown>(
    { method: 'post', url: `${cwBase(classId, nodeId)}/task/creationSubmit`, data: body },
    undefined
  )
}

// ============= 朋友圈 moments =============
// 来源: openapi 默认模块 / 朋友圈
// 路径前缀: /stu/class/{classId}/moments/...（注意无 /v1 前缀）

const momentsBase = (classId = DEFAULT_CLASS_ID) => `/stu/class/${classId}/moments`

/** GET .../moments/sources 获取来源筛选列表 */
export function getMomentSources(
  classId = DEFAULT_CLASS_ID
): Promise<GetMomentSourcesResp> {
  return callApi<GetMomentSourcesResp>(
    { method: 'get', url: `${momentsBase(classId)}/sources` },
    { sources: [] }
  )
}

/** GET .../moments/{momentId} 获取单条动态 */
export function getMoment(
  momentId: number,
  classId = DEFAULT_CLASS_ID
): Promise<Moment> {
  return callApi<Moment>(
    { method: 'get', url: `${momentsBase(classId)}/${momentId}` },
    {
      id: momentId, author: {}, content: '', images: [], objs: [], createdAt: 0,
      likes: [], comments: [], likedByMe: false, likeCount: 0, commentCount: 0
    }
  )
}

/** POST .../moments 发布动态（OpenAPI 未定义请求体，按 Moment 结构发送 content） */
export function createMoment(
  content: string,
  classId = DEFAULT_CLASS_ID
): Promise<void> {
  return callApi<void>(
    { method: 'post', url: `${momentsBase(classId)}`, data: { content } },
    undefined
  )
}

// ============= AI 对话 =============
// 来源: openapi 默认模块 / AI对话
// 路径前缀: /ai/...

/** POST /ai/session 创建会话（OpenAPI 无必填字段） */
export function createAISession(
  body: CreateSessionReq = {}
): Promise<void> {
  return callApi<void>({ method: 'post', url: '/ai/session', data: body }, undefined)
}

/** POST /ai/chat/{session} 发送对话 */
export function aiChat(
  session: string,
  req: ChatReq
): Promise<ChatResp> {
  return callApi<ChatResp>(
    { method: 'post', url: `/ai/chat/${session}`, data: req },
    { id: '', choices: [{ finish_reason: 'stop', index: 0, message: { role: 'assistant', content: '' } }] }
  )
}

/** POST /ai/chat/stream/{session} 发送对话（流式） */
export function aiChatStream(
  session: string,
  req: ChatReq
): Promise<void> {
  return callApi<void>({ method: 'post', url: `/ai/chat/stream/${session}`, data: req }, undefined)
}

/** GET /ai/context 获取会话上下文 */
export function getAIContext(): Promise<GetSessionContextResp> {
  return callApi<GetSessionContextResp>(
    { method: 'get', url: '/ai/context' },
    { context: [] }
  )
}

// ============= 工具 utils =============
// 来源: openapi 默认模块 / 工具
// 路径前缀: /utils/...

/** GET /utils/transcriptions/{resourceId} 获取语音转写结果 */
export function getTranscription(
  resourceId: string
): Promise<UtilsTranscriptionsResp> {
  return callApi<UtilsTranscriptionsResp>(
    { method: 'get', url: `/utils/transcriptions/${resourceId}` },
    { text: '' }
  )
}

/**
 * POST /utils/upload 上传资源（multipart/form-data）
 * 来源: openapi/默认模块.openapi.json → /api/utils/upload
 * 必填: file, media_type(图片/音频/视频等类型), resource_source(来源)
 * 可选: resource_info(简介), image_compress, video_compress, upload_oss
 * 返回: UtilsUploadResp（含 resource_id，可传给 ocr / 下载接口）
 */
export interface UploadFileOptions {
  /** 文件类型：image / audio / video（缺省按 MIME 推断） */
  media_type?: string
  /** 文件来源，默认 resouce_library（注：后端拼写如此） */
  resource_source?: string
  /** 文件简介 */
  resource_info?: string
  image_compress?: boolean
  video_compress?: boolean
  upload_oss?: boolean
}

export function uploadFile(file: File, options: UploadFileOptions = {}): Promise<UtilsUploadResp> {
  const form = new FormData()
  form.append('file', file)
  const mediaType =
    options.media_type ??
    (file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('audio/')
        ? 'audio'
        : file.type.startsWith('video/')
          ? 'video'
          : 'file')
  form.append('media_type', mediaType)
  form.append('resource_source', options.resource_source ?? 'resouce_library')
  if (options.resource_info != null) form.append('resource_info', options.resource_info)
  if (options.image_compress != null) form.append('image_compress', String(options.image_compress))
  if (options.video_compress != null) form.append('video_compress', String(options.video_compress))
  if (options.upload_oss != null) form.append('upload_oss', String(options.upload_oss))
  return callApi<UtilsUploadResp>(
    { method: 'post', url: '/utils/upload', data: form, headers: { 'Content-Type': 'multipart/form-data' } },
    { id: 0, resource_id: '', resource_type: mediaType, resource_suffix: '', resource_size: 0 }
  )
}

/** GET /utils/download/{id} 获取下载链接（url_expired 可选，单位秒） */
export function getDownloadUrl(id: string | number, urlExpired?: number): Promise<UtilsDownloadResp> {
  return callApi<UtilsDownloadResp>(
    {
      method: 'get',
      url: `/utils/download/${id}`,
      params: urlExpired != null ? { url_expired: urlExpired } : undefined
    },
    { url: '' }
  )
}

/**
 * 将 download 返回的 url 解析为可直接用于 <img src> / <audio src> 的完整地址：
 * - 绝对地址（http(s)://）原样返回；
 * - TTS / 存储类文件 /api/storage/xxx 实际在独立 storage 服务（端口与 API 不同）：
 *   去掉 /api 前缀后用专用 VITE_STORAGE_BASE_URL 拼接，未配置则回退到 API host 根；
 * - 其它以 / 开头的相对路径，拼接 BASE_URL（默认 /api，对应后端 :8080）。
 */
export function resolveDownloadUrl(url: string): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  // TTS / 存储类文件：后端返回 /storage/xxx 或 /api/storage/xxx，storage 服务在独立端口
  if (/\/storage\//.test(url)) {
    const path = url.replace(/^\/api/, '') // 去掉可能存在的 /api 前缀 → /storage/xxx
    const storageBase = (import.meta.env.VITE_STORAGE_BASE_URL as string) || ''
    if (storageBase) return storageBase.replace(/\/+$/, '') + path
    return BASE_URL.replace(/\/api\/?$/, '') + path
  }
  if (url.startsWith('/')) return `${BASE_URL}${url}`
  return `${BASE_URL}/${url}`
}

/** POST /utils/ocr 图片文字识别，传入已上传图片的 resourceId，返回识别文字 */
export function ocrImage(resourceId: string): Promise<UtilsOcrResp> {
  return callApi<UtilsOcrResp>(
    { method: 'post', url: '/utils/ocr', data: { resourceId } },
    { text: '' }
  )
}

// ============= 课堂事件 events =============
// 来源: openapi 默认模块 / 通用

/** POST /v1/stu/events/enter-class-node 进入课堂节点 */
export function enterClassNode(
  classId: number,
  nodeId: number
): Promise<Record<string, unknown>> {
  return callApi<Record<string, unknown>>(
    { method: 'post', url: '/v1/stu/events/enter-class-node', data: { classId, nodeId } as EnterClassNodeReq },
    {}
  )
}

/** GET /v1/stu/class/{classId} 获取课堂详情（章节 / 节点列表，含完成状态、是否启用、是否可重入） */
export function getStuClass(
  classId = DEFAULT_CLASS_ID
): Promise<StuClassV1DetailResp> {
  return callApi<StuClassV1DetailResp>(
    { method: 'get', url: `/v1/stu/class/${classId}` },
    {
      course: 4,
      sections: [
        {
          id: 16,
          name: '课堂活动',
          nodes: [
            { allowReentry: true, id: 17, isCompleted: true, isEnabled: true, key: 'write-thoughts', title: '寻找文化：写写感想' },
            { allowReentry: true, id: 18, isCompleted: false, isEnabled: true, key: 'initial-insight ', title: '寻找文化：初步感悟' },
            { allowReentry: true, id: 19, isCompleted: true, isEnabled: true, key: 'cultural-style', title: '重温文化：探秘纸的逆袭' },
            { allowReentry: true, id: 20, isCompleted: true, isEnabled: true, key: 'zhaozhouqiao', title: '宣传有法：学习《赵州桥》' },
            { allowReentry: true, id: 21, isCompleted: false, isEnabled: true, key: 'wenmingzhongwai', title: '宣传有法：一幅名扬中外的画' },
            { allowReentry: true, id: 22, isCompleted: false, isEnabled: true, key: 'heritage-cultural', title: '宣传文化：讲解优秀文化' },
            { allowReentry: true, id: 23, isCompleted: false, isEnabled: true, key: 'culture-workshop', title: '创作工坊' }
          ]
        }
      ]
    }
  )
}

// ============= 报告页格式化辅助 =============

/** 把秒数格式化为 "X小时Y分Z秒" / "X分钟Y秒" / "Y秒"（中文样式） */
export function formatDurationZh(sec?: number | null): string {
  const s = Math.max(0, Math.floor(Number(sec) || 0))
  if (s === 0) return '0秒'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h}小时${m}分${ss}秒`
  if (m > 0) return `${m}分钟${ss}秒`
  return `${ss}秒`
}

/** 把秒数格式化为 "MM:SS" / "H:MM:SS"（用于卡片用时） */
export function formatDurationClock(sec?: number | null): string {
  const s = Math.max(0, Math.floor(Number(sec) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`
}
