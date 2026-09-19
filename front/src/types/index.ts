/**
 * TS 类型定义 - 与 OpenAPI 契约同步
 * 来源(权威): openapi/默认模块.openapi.json  （直接导出的后端接口文件）
 * 备份参考:   openapi/语文课堂.openapi .json
 * 字段严格对齐 OpenAPI schema，禁止自行增删字段
 *
 * 本文件已根据 OpenAPI 规范全量校正（2026-08-13，以「默认模块.openapi.json」为准）：
 *  - 修正了 WriteThought / InitialInsight / CulturalStyle / ZhaoZhouQiao /
 *    WenMingZhongWai / HeritageCultural 各模块 State/Params/SubmitResult 的字段
 *  - HeritageCulturalState 由 {title,introVideo,introText} 改为 {submitLogs}
 *  - 补齐 HeritageCulturalParams / HeritageCulturalSubmitResult /
 *    HeritageCulturalEndingResp / InitialImpressionsSubmitResult / StyleOverridableText
 *  - AsyncSubmitResp 增加 tip 字段
 *  - 登录/状态用户结构改为后端 AccountUser / AccountStatus（realName/avatarUrl/username/className…）
 */

// ============= 全局统一返回体 =============

/** 全局统一返回体 { code, msg, data } */
export interface ApiResponse<T = unknown> {
  /** HTTP 状态码为 200 时，响应中的 code 也一定为 200 */
  code: number
  /** 供内部记录、日志等使用的消息，可以为 null */
  msg: string | null
  data: T
}

// ============= 通用 =============

/** 用户信息 (后端 AccountUser) —— 登录 / 状态接口返回的真实用户结构 */
export interface AccountUser {
  id: number
  code: string
  username: string
  role: string
  realName: string
  avatarUrl: string
  gender: string
  city: string
  gradeName: string
  className: string
}

/** 登录响应 data (后端 LoginResult) */
export interface LoginRespData {
  /** 认证 token，客户端请求时会将它放在 Authorization: Bearer <token> 请求头中 */
  token: string
  user: AccountUser
}

/** 登录状态响应 (后端 AccountStatus) —— GET /api/v1/accounts:status 返回 */
export interface AccountStatus {
  loggedIn: boolean
  user: AccountUser
}

// ============= 公共子结构 =============

/** 异步提交响应 (AsyncSubmitResp) */
export interface AsyncSubmitResp {
  submitId: string
  /** 提交成功后的提示文案（OpenAPI 新增字段） */
  tip?: string
}

/** 介绍视频 (IntroVideo) */
export interface IntroVideo {
  autoPlay: boolean
  url?: string | null
}

/** 视频 (Video) */
export interface Video {
  id: string
  title: string
  src: string
  thumbnail: string
}

/** 可覆盖样式的文本 (StyleOverridableText)，用于 description 数组 */
export interface StyleOverridableText {
  text: string
  style: {
    size: number
    weight: number
    color: string
    lineHeight: number
    letterSpacing: number
  }
}

/** 结束语响应（initial-insight 板块 ending，/api/v4/.../initial-insight/ending） */
export interface EndingResp {
  isProcessing: boolean
  comment: string
}

// ============= 写写感想 (write-thoughts) =============

/** 写写感想参数 (WriteThoughtParams) */
export interface WriteThoughtParams {
  title: string
  introVideo: IntroVideo
  introBubbleText: string
  subtitle: string
  description: StyleOverridableText[]
}

/** 写写感想状态 (WriteThoughtState) */
export interface WriteThoughtState {
  questions: WriteThoughtQuestion[]
}

/** 写写感想 - 问题项 */
export interface WriteThoughtQuestion {
  id: string
  title: string
  placeholder: string
  submitLogs: WriteThoughtSubmitResult[]
}

/** 写写感想提交结果 (WriteThoughtSubmitResult) */
export interface WriteThoughtSubmitResult {
  id: string
  questionId: string
  type: string
  submittedText: string
  isProcessing: boolean
  isPassed: boolean
  isCompleted: boolean
  referenceAnswer: string
  feedback: string
  offerReferenceAnswer: boolean
}

// ============= 初步感悟 (initial-insight) =============

/** 初步感悟参数 (InitialImpressionsParams) */
export interface InitialImpressionsParams {
  title: string
  introVideo: IntroVideo
  introBubbleText: string
  subtitle: string
  description: StyleOverridableText[]
}

/** 初步感悟状态 (InitialInsightState) */
export interface InitialInsightState {
  questions: InitialInsightQuestion[]
}

/** 初步感悟 - 问题项 */
export interface InitialInsightQuestion {
  id: string
  title: string
  content: unknown[]
  submitLogs: InitialImpressionsSubmitResult[]
}

/** 初步感悟提交结果 (InitialImpressionsSubmitResult) */
export interface InitialImpressionsSubmitResult {
  id: string
  questionId: string
  blankId: string
  submittedText: string
  isProcessing: boolean
  isPassed?: boolean | null
  isCompleted?: boolean | null
  referenceAnswer?: string | null
  feedback?: string | null
  /** report 视图按需读取的兼容字段 */
  type?: string
  offerReferenceAnswer?: boolean
  duration?: number | null
}

// ============= 文化采风 (cultural-style) =============

/** 文化采风参数 (CulturalStyleParams) */
export interface CulturalStyleParams {
  title: string
  introVideo: IntroVideo
  /** 导入视频（OpenAPI 为 object，按 Video 结构取用） */
  video: Video
}

/** 文化采风状态 (CulturalStyleState) */
export interface CulturalStyleState {
  title: string
  desc: string
  video: Video
  questions: CulturalStyleQuestion[]
  completed: boolean
}

/** 文化采风 - 交互问题项 */
export interface CulturalStyleQuestion {
  id: string
  type: string
  title: string
  text: string
  completed: boolean
  items: { id: string; content: string }[]
  options: { id: string; content: string }[]
}

/** 快选参数 (CSBpQuickSelectParams) */
export interface CSBpQuickSelectParams {
  title: string
  description: string
  introBubbleText: string
  timeLimit: number
  /** OpenAPI 字段为 selections（非 options） */
  selections: CSBpQuickSelectSelection[]
}

/** 快选选项 */
export interface CSBpQuickSelectSelection {
  id: string
  text: string
}

/** 拖拽排序参数 (CSBpDragSortParams) */
export interface CSBpDragSortParams {
  title: string
  description: string
  introBubbleText: string
  trailingText: string
  instruction: string
  blanks: { leadingText: string }[]
  entries: CSBpDragSortEntry[]
}

/** 拖拽排序条目 (CSBpDragSortEntry) */
export interface CSBpDragSortEntry {
  id: string
  text: string
}

/** 拖拽排序状态 (CSBpDragSortState) */
export interface CSBpDragSortState {
  submitLogs: CSBpDragSortSubmitResult[]
}

/** 拖拽排序提交结果 (CSBpDragSortSubmitResult) */
export interface CSBpDragSortSubmitResult {
  id: string
  answer: CSBpDragSortEntry[]
  isProcessing: boolean
  isPassed: boolean
  isCompleted: boolean
  referenceAnswer: CSBpDragSortEntry[]
  feedback: string
  duration: number
}

// ============= 赵州桥 (zhaozhouqiao) =============

/** 赵州桥参数 (ZhaozhouBridgeParams) */
export interface ZhaoZhouQiaoParams {
  title: string
  introVideo: IntroVideo
  introBubbleText: string
}

/** 赵州桥状态 (ZhaoZhouQiaoState) */
export interface ZhaoZhouQiaoState {
  cards: ZhaoZhouQiaoCard[]
}

/** 赵州桥 - 卡片 */
export interface ZhaoZhouQiaoCard {
  id: string
  title: string
  description: string
  input: {
    placeholder: string
    length: number
  }
  voiceOnly: boolean
  assets: { type: string; src: string }[]
  submitLogs: ZhaoZhouQiaoSumbitResp[]
}

/** 赵州桥提交响应 (ZhaoZhouQiaoSumbitResp) */
export interface ZhaoZhouQiaoSumbitResp {
  id: string
  cardId: string
  type: string
  submittedText: string
  submittedAudio: { id: string }
  isProcessing: boolean
  isPassed: boolean
  isCompleted: boolean
  referenceAnswer: string
  feedback: string
  offerReferenceAnswer: boolean
  duration: number
}

// ============= 一幅名扬中外的画 (wenmingzhongwai) =============

/** 名扬中外矩阵 - 列定义 */
export interface WenMingZhongWaiColumn {
  key: string
  title: string
  flex: number
}

/** 名扬中外矩阵 - 单元格 */
export interface WenMingZhongWaiCell {
  columnKey: string
  type: string
  content: string
  studentAnswer: string | null
  status: string | null
  feedback: string | null
}

/** 名扬中外矩阵 - 行 */
export interface WenMingZhongWaiRow {
  rowId: string
  cells: WenMingZhongWaiCell[]
}

/** 名扬中外矩阵 */
export interface WenMingZhongWaiMatrix {
  columns: WenMingZhongWaiColumn[]
  rows: WenMingZhongWaiRow[]
}

/** 名扬中外参数 (WenMingZhongWaiParams) */
export interface WenMingZhongWaiParams {
  title: string
  introVideo: IntroVideo
  introBubbleText: string
  description: string
  matrix: WenMingZhongWaiMatrix
}

/** 名扬中外状态 (WenMingZhongWaiState) */
export interface WenMingZhongWaiState {
  submitLogs: WenMingZhongWaiSubmitResult[]
}

/** 名扬中外提交结果 (WenMingZhongWaiSubmitResult) */
export interface WenMingZhongWaiSubmitResult {
  id: string
  answers: Record<string, string>
  isProcessing: boolean
  errors: unknown[]
  isCompleted: boolean
  referenceAnswer: Record<string, string>
  feedback: string
  ending: Record<string, unknown>
  duration: number
}

// ============= 宣传优秀文化 (heritage-cultural) =============

/** 宣传优秀文化参数 (HeritageCulturalParams) */
export interface HeritageCulturalParams {
  /** 节点标题（OpenAPI 字段为 string，非 title） */
  string: string
  introVideo: IntroVideo
  introBubbles: HeritageCulturalBubble[]
}

/** 宣传优秀文化 - 对话气泡 */
export interface HeritageCulturalBubble {
  role: 'foreigner' | 'native'
  text: string
}

/** 宣传优秀文化提交结果 (HeritageCulturalSubmitResult) */
export interface HeritageCulturalSubmitResult {
  id: string
  submittedText: string
  isProcessing: boolean
  isPassed: boolean
  isCompleted: boolean
  referenceAnswer: string
  feedback: string
  duration: number
}

/** 宣传优秀文化状态 (HeritageCulturalState) */
export interface HeritageCulturalState {
  submitLogs: HeritageCulturalSubmitResult[]
}

/** 宣传优秀文化结束语（/api/v4/.../heritage-cultural/ending） */
export interface HeritageCulturalEndingResp {
  isProcessing: boolean
  passed: boolean
  comment: string
  errorCount: number
  revealed: boolean
  correctAnswer: string
}

// ============= 文化交流（创作） creation-workshop =============
// 来源: openapi 默认模块 / 课程内容/宣传文化展播厅/文化交流（创作）

/** 创作工坊提交请求体（诗歌/剧本/海报等通用，OpenAPI 命名 submit） */
export interface CWSubmitReq {
  textContent: string
  taskType: string
}

/** 创作工坊参数 (GetParams) —— GET .../creation-workshop/{taskId}/{generation|poemscripts}/params */
export interface CWParams {
  introBubbleText: string
  title: string
  description: string
  inputs: { id: string; placeholder: string }[]
}

/** 创作工坊状态 (GetState) */
export interface CWState {
  creationLogs: CWCreationLog[]
  isPublish: boolean
  duration: string
}

/** 创作记录项 (GetState.creationLogs) */
export interface CWCreationLog {
  content: string
  id: string
  feedback: string
  isProcessing: boolean
  isSuccessful: boolean
  /** OpenAPI 此字段为 string 类型（非 boolean），保留原类型 */
  isCompleted: string
  AIimage: { id: string; src: string } | null
}

/** 创作工坊生成/提交结果 (GetResult) */
export interface CWResult {
  id: string
  isProcessing: boolean
  isSuccessful: boolean
  isCompleted: boolean
  feedback: string
  content: Record<string, unknown>
  AIimage: { id: string; src: string }
  isPublish: boolean
  duration: number
  taskType: string
}

/** 发布结果 (Publish-result) */
export interface CWPublishResult {
  comment: string
  likeCount: number
  content: { image: { id: string; src: string } | null }
}

/** AI 评测结果（分享讲解 share） (AIevaluation) */
export interface CWAIEvaluation {
  id: string
  isProcessing: boolean
  isSuccessful: boolean
  isCompleted: boolean
  feedback: string
  evaluation: { text: string; audio: { audioId: string; src: string } }
  TextContent: Record<string, unknown>
  duration: number
}

/** 创作工坊文本内容（textcontent 接口，结构由具体任务决定，宽松处理） */
export type CWTextContent = Record<string, unknown>

// ============= 朋友圈 moments =============
// 来源: openapi 默认模块 / 朋友圈

/** 发布者/点赞者/评论者基础信息 (UserBaseInfo) */
export interface UserBaseInfo {
  id?: number
  username?: string
  realName?: string
  avatarUrl?: string
  [k: string]: unknown
}

/** 动态扩展对象 (MomentExtraObj) */
export type MomentExtraObj = Record<string, unknown>

/** 朋友圈统计 (MomentStats) */
export interface MomentStats {
  momentsPosted: number
  likesGiven: number
  commentsGiven: number
  likesReceived: number
  commentsReceived: number
}

/** 朋友圈来源列表 (GetMomentSourcesResp) */
export interface GetMomentSourcesResp {
  sources: string[]
}

/** 朋友圈评论项 */
export interface MomentComment {
  id: number
  user: UserBaseInfo
  content: string
}

/** 单条朋友圈动态 (Moment) */
export interface Moment {
  id: number
  author: UserBaseInfo
  content: string
  images: { url: string }[]
  objs: MomentExtraObj[]
  createdAt: number
  likes: { user: UserBaseInfo }[]
  comments: MomentComment[]
  likedByMe: boolean
  likeCount: number | null
  commentCount: number | null
}

/** 朋友圈列表 (GetMomentsResp) */
export interface GetMomentsResp {
  moments: Moment[]
}

/** 发布评论请求 (PostMomentsCommentsReq) */
export interface PostMomentsCommentsReq {
  content: string
}

// ============= AI 对话 =============
// 来源: openapi 默认模块 / AI对话

export interface AIMessage {
  role: string
  content: string
}
export type AIMessages = AIMessage[]

/** 创建会话请求（OpenAPI anyOf [{}, {}]，无必填字段） */
export type CreateSessionReq = Record<string, never>

/**
 * AI 对话请求 (ChatReq)
 * 注意：OpenAPI 字段名为 promot（非 prompt），后端即此拼写，须严格保持一致
 */
export interface ChatReq {
  messages?: AIMessages
  promot?: string
}

/** AI 对话响应 (ChatResp) */
export interface ChatResp {
  id: string
  choices: {
    finish_reason: 'stop' | 'length' | 'tool_calls'
    index: number
    message: { role: 'assistant'; content: string }
  }[]
}

/** 会话上下文 (GetSessionContextResp) */
export interface GetSessionContextResp {
  context: AIMessages
}

// ============= 工具 utils =============
// 来源: openapi 默认模块 / 工具

/** 语音转写结果 (UtilsTranscriptionsResp) */
export interface UtilsTranscriptionsResp {
  text: string
}

/** 上传响应 (UtilsUploadResp) */
export interface UtilsUploadResp {
  id: number
  resource_id: string
  resource_type: string
  resource_suffix: string
  resource_size: number
}

/** 下载链接响应 (UtilsDownloadResp) */
export interface UtilsDownloadResp {
  url: string
}

/** OCR 识别结果 (utils/ocr 返回的 data) */
export interface UtilsOcrResp {
  /** 识别到的文字 */
  text: string
}

// ============= 课堂事件 events =============
// 来源: openapi 默认模块 / 通用

/** 进入课堂节点 (enter-class-node) 请求体 */
export interface EnterClassNodeReq {
  classId: number
  nodeId: number
}

// ============= 课堂报告 report =============
// 来源: openapi 默认模块 / 课堂报告

/** 课堂报告 (GetStuClassReport) */
export interface GetStuClassReport {
  title: string
  summary: {
    nodeCount: number
    finishedNodeCount: number
    likeCount: number
    commentReceivedCount: number
    studyDuration: number
    points: number
    pointsChange: number
  }
  nodes: { id: string; title: string; status: string }[]
}

/** 节点报告中的"过程"数据，按 type 字段派发 (对应 OpenAPI ReportProcessData) */
export interface ReportProcessEntryWriteReflections {
  type: 'write-reflections'
  data: { state?: WriteThoughtState | null }
}
export interface ReportProcessEntryInitialImpressions {
  type: 'initial-impressions'
  data: { state?: InitialInsightState | null }
}
export interface ReportProcessEntryRevisitingCulturalFieldwork {
  type: 'revisiting-cultural-fieldwork'
  data: ReportCSRevisitingItem[]
}
export interface ReportProcessEntryZhaoZhou {
  type: 'expression-methods-zhaozhou-bridge'
  data: { state?: ZhaoZhouQiaoState | null }
}
export interface ReportProcessEntryFamousPainting {
  type: 'expression-methods-famous-painting'
  data: { params?: ZhaoZhouQiaoParams | null; state?: ZhaoZhouQiaoState | null }
}
export interface ReportProcessEntryPresentingCulturalHeritage {
  type: 'presenting-cultural-heritage'
  data: { title?: string; state?: HeritageCulturalState | null }
}
export interface ReportProcessEntryThemedCulturalCreation {
  type: 'themed-cultural-creation'
  data: ReportCWItem[]
}

/** 重温文化采风的过程条目 */
export interface ReportCSRevisitingBpRecordQuickSelect {
  bpType: 'quick-select'
  selected: { text: string; duration?: number | null }
}
export interface ReportCSRevisitingBpRecordDragSort {
  bpType: 'drag-sort'
  params: CSBpDragSortParams
  state: CSBpDragSortState
}
export type ReportCSRevisitingBpRecord =
  | ReportCSRevisitingBpRecordQuickSelect
  | ReportCSRevisitingBpRecordDragSort

export interface ReportCSRevisitingItem {
  title: string
  bpRecord: ReportCSRevisitingBpRecord
}

/** 文化主题创作(随堂练习)的报告过程条目 */
export interface ReportCWFnRecord {
  /** 表达/分享/创作-写作 等任务的入口 */
  task?: string
  text?: string | null
  audio?: { id: string } | null
  image?: { id: string } | null
  video?: { id: string } | null
  ok?: boolean | null
  feedback?: string | null
  [k: string]: unknown
}
export interface ReportCWItem {
  title: string
  fnRecord: ReportCWFnRecord
}

/** 节点报告中"学习过程"容器 (ReportDetails.data.process) */
export interface ReportProcess {
  title?: string
  description?: string
  data?: ReportProcessEntry
}

/** 节点报告任务评价 (ReportDetails.data.evaluation) */
export interface ReportEvaluation {
  title?: string
  rating?: string | null
  ratingColor?: { bg?: string; fg?: string } | null
  comment?: string | null
  items?: { title: string; text: string }[] | null
}

/** ReportProcess.data —— anyOf 7 种，按 type 派发 */
export type ReportProcessEntry =
  | ReportProcessEntryWriteReflections
  | ReportProcessEntryInitialImpressions
  | ReportProcessEntryRevisitingCulturalFieldwork
  | ReportProcessEntryZhaoZhou
  | ReportProcessEntryFamousPainting
  | ReportProcessEntryPresentingCulturalHeritage
  | ReportProcessEntryThemedCulturalCreation

/** 节点报告详情 (ReportDetails) */
export interface ReportDetails {
  data?: {
    process?: ReportProcess | null
    evaluation?: ReportEvaluation | null
  } | null
}

/** 节点报告 (NodeReport) */
export interface NodeReport {
  id: number
  title: string
  time?: number | null
  pointsEarned?: number | null
  errMsg?: string | null
  details?: ReportDetails | null
}

// ============= 课堂详情 class/{classId} =============
// 来源: openapi 默认模块 / 获取课堂详细信息 GET /api/v1/stu/class/{classId}

/** 节点 key 枚举（映射到特定前端组件） */
export type StuClassV1AvailableNodeKey =
  | 'write-thoughts'
  | 'initial-insight '
  | 'cultural-style'
  | 'zhaozhouqiao'
  | 'wenmingzhongwai'
  | 'heritage-cultural'
  | 'themed-cultural-creation'
  | 'culture-workshop'

/** 课堂节点 (StuClassV1Node) */
export interface StuClassV1Node {
  id: number
  key: StuClassV1AvailableNodeKey
  title: string
  isEnabled?: boolean
  isCompleted?: boolean
  allowReentry?: boolean
}

/** 课堂章节 (StuClassV1Section) */
export interface StuClassV1Section {
  id: number
  name: string
  nodes: StuClassV1Node[]
}

/** 课堂详情响应 (StuClassV1DetailResp) */
export interface StuClassV1DetailResp {
  /** 课程包信息（特殊值，代表客户端写死的课程包），4 = 璀璨的中华文化课程包 */
  course: number
  sections: StuClassV1Section[]
  introVideo?: IntroVideo | null
}
