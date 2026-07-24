export interface Response<T = any> {
  code: number
  msg: string
  data: T
  traceId: string
}

export interface Course {
  id: string
  title: string
  stages: Stage[]
}

export interface Stage {
  id: string
  name: string
  order: number
  taskCount: number
}

export interface StageDetail {
  id: string
  name: string
  order: number
  progress: Progress
  tasks: Task[]
  digitalHumanPrompt?: string
  texts?: TextItem[]
}

export interface Progress {
  currentTaskIndex: number
  completedTaskIds: string[]
}

export interface Task {
  id: string
  type: string
  title: string
  digitalHumanPrompt: string
  texts?: TextItem[]
  retry?: RetryConfig
  feedbackOverlay?: FeedbackOverlay
  minQuestions?: number
  creationOptions?: CreationOption[]
}

export interface TextItem {
  id: string
  title: string
  prompt?: string
  minLength?: number
  maxLength?: number
  allowPhoto?: boolean
  blanks?: Blank[]
}

export interface Blank {
  id: string
  correctAnswer: string
  context: string
}

export interface RetryConfig {
  maxRetries: number
  onExhausted: string
}

export interface FeedbackOverlay {
  forced: boolean
}

export interface CreationOption {
  id: string
  name: string
}

export interface WriteRequest {
  stageId: string
  taskId: string
  textId: string
  content: string
  proudAspect: string
  textConnection: string
  lifeConnection: string
  imageUrl?: string | null
}

export interface WriteResponse {
  passed: boolean
  feedback: string
  retryCount: number
  retryExhausted: boolean
  correctAnswer: string | null
  nextAction: string
}

export interface QuestionRequest {
  stageId: string
  taskId: string
  content: string
  keywords: string[]
}

export interface QuestionResponse {
  passed: boolean
  feedback: string
  retryCount: number
  retryExhausted: boolean
  relatedKeywords: string[]
}

export interface ValidateBlankRequest {
  taskId: string
  textId: string
  blankId: string
  input: string
}

export interface ValidateBlankResponse {
  correct: boolean
  feedback: string | null
  retryCount: number
  exhausted: boolean
  revealedAnswer: string | null
}

export interface PracticeRequest {
  stageId: string
  taskId: string
  itemId: string
  content: string
  imageUrl?: string | null
}

export interface PracticeResponse {
  passed: boolean
  feedback: string
  retryCount: number
  retryExhausted: boolean
  correctAnswer: string | null
}

export interface ReadAloudRequest {
  stageId: string
  taskId: string
  itemId: string
  audioUrl: string
  referenceText: string
}

export interface ChatRequest {
  stageId: string
  taskId: string
  message: string
}

export interface ChatResponse {
  reply: string
  retryCount: number
  retryExhausted: boolean
  correctAnswer: string | null
  feedback?: string
}

export interface ChatPolishRequest {
  stageId: string
  taskId: string
}

export interface ChatPolishResponse {
  original: string
  polished: string
}

export interface ChatCreationRequest {
  stageId: string
  taskId: string
  action: string
  optionId?: string
}

export interface ChatCreationResponse {
  nextAction: string
  creationUrl?: string
}

export interface FeedbackGenerateRequest {
  stageId: string
  taskId: string
}

export interface FeedbackGenerateResponse {
  type: string
  script: string
  durationMs: number
}

export interface MediaUploadResponse {
  url: string
}

export interface GroupCreateRequest {
  stageId: string
  taskId: string
  creationType: string
  memberIds: string[]
}

export interface GroupCreateResponse {
  groupId: string
  members: string[]
  creationType: string
}

export interface MessageSendRequest {
  groupId: string
  content: string
  messageType: string
}

export interface MessageSendResponse {
  messageId: string
  content: string
  timestamp: string
}

export interface MessageListRequest {
  groupId: string
  page: number
  pageSize: number
}

export interface MessageListResponse {
  messages: Message[]
  total: number
  page: number
  pageSize: number
}

export interface Message {
  messageId: string
  senderId: string
  senderName: string
  content: string
  messageType: string
  timestamp: string
}

export interface HomeworkRecommendRequest {
  stageId: string
  taskId: string
}

export interface HomeworkRecommendResponse {
  level: string
  title: string
  requiredTask: string
  optionalTasks: string[]
  scoreThreshold: number
}

export interface HomeworkSubmitRequest {
  stageId: string
  taskId: string
  content: string
  creationType: string
  imageUrl?: string | null
}

export interface BadgeAwardRequest {
  studentId: string
  badgeName: string
  condition: string
  stageId: string
}

export interface BadgeAwardResponse {
  success: boolean
  badgeName: string
  awardTime: string
  condition: string
}

export interface DashboardData {
  participation: {
    total: number
    completed: number
    rate: number
  }
  correctness: {
    total: number
    correct: number
    rate: number
  }
  wordCloud: WordCloudItem[]
  creationTypes: CreationTypeItem[]
  previewData: {
    textConnection: number
    lifeConnection: number
  }
}

export interface WordCloudItem {
  word: string
  count: number
}

export interface CreationTypeItem {
  type: string
  count: number
  rate: number
}

export interface DashboardFilterRequest {
  classId?: string
  startTime?: string
  endTime?: string
  stageId?: string
}

export interface WSMessage {
  type: string
  messageId: string
  payload: any
  seq: number
}

export interface User {
  studentId: string
  name: string
  score: number
  deviceId?: string
}
