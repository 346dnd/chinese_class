import { get, post, upload } from '@/utils/api'
import type {
  Course,
  StageDetail,
  WriteRequest,
  WriteResponse,
  QuestionRequest,
  QuestionResponse,
  ValidateBlankRequest,
  ValidateBlankResponse,
  PracticeRequest,
  PracticeResponse,
  ReadAloudRequest,
  ChatRequest,
  ChatResponse,
  ChatPolishRequest,
  ChatPolishResponse,
  ChatCreationRequest,
  ChatCreationResponse,
  FeedbackGenerateRequest,
  FeedbackGenerateResponse,
  MediaUploadResponse,
  GroupCreateRequest,
  GroupCreateResponse,
  MessageSendRequest,
  MessageSendResponse,
  MessageListRequest,
  MessageListResponse,
  HomeworkRecommendRequest,
  HomeworkRecommendResponse,
  HomeworkSubmitRequest,
  DashboardData,
  DashboardFilterRequest
} from '@/types'

export const courseAPI = {
  getCourse: async (): Promise<Course> => {
    const res = await get<Course>('/course')
    return res.data
  },
  getStage: async (stageId: string): Promise<StageDetail> => {
    const res = await get<StageDetail>(`/stage/${stageId}`)
    return res.data
  }
}

export const writeAPI = {
  submit: async (data: WriteRequest): Promise<WriteResponse> => {
    const res = await post<WriteResponse>('/write', data)
    return res.data
  }
}

export const questionAPI = {
  submit: async (data: QuestionRequest): Promise<QuestionResponse> => {
    const res = await post<QuestionResponse>('/question', data)
    return res.data
  }
}

export const answerAPI = {
  validateBlank: async (data: ValidateBlankRequest): Promise<ValidateBlankResponse> => {
    const res = await post<ValidateBlankResponse>('/validate-blank', data)
    return res.data
  }
}

export const practiceAPI = {
  submit: async (data: PracticeRequest): Promise<PracticeResponse> => {
    const res = await post<PracticeResponse>('/practice', data)
    return res.data
  },
  readAloud: async (data: ReadAloudRequest): Promise<PracticeResponse> => {
    const res = await post<PracticeResponse>('/read-aloud', data)
    return res.data
  }
}

export const chatAPI = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const res = await post<ChatResponse>('/chat', data)
    return res.data
  },
  polish: async (data: ChatPolishRequest): Promise<ChatPolishResponse> => {
    const res = await post<ChatPolishResponse>('/chat/polish', data)
    return res.data
  },
  creation: async (data: ChatCreationRequest): Promise<ChatCreationResponse> => {
    const res = await post<ChatCreationResponse>('/chat/creation', data)
    return res.data
  }
}

export const feedbackAPI = {
  generate: async (data: FeedbackGenerateRequest): Promise<FeedbackGenerateResponse> => {
    const res = await post<FeedbackGenerateResponse>('/feedback/generate', data)
    return res.data
  }
}

export const mediaAPI = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await upload<MediaUploadResponse>('/media/upload', formData)
    return res.data.url
  }
}

export const groupAPI = {
  create: async (data: GroupCreateRequest): Promise<GroupCreateResponse> => {
    const res = await post<GroupCreateResponse>('/group/create', data)
    return res.data
  },
  sendMessage: async (data: MessageSendRequest): Promise<MessageSendResponse> => {
    const res = await post<MessageSendResponse>('/message/send', data)
    return res.data
  },
  getMessages: async (data: MessageListRequest): Promise<MessageListResponse> => {
    const res = await post<MessageListResponse>('/message/list', data)
    return res.data
  }
}

export const homeworkAPI = {
  recommend: async (data: HomeworkRecommendRequest): Promise<HomeworkRecommendResponse> => {
    const res = await post<HomeworkRecommendResponse>('/homework/recommend', data)
    return res.data
  },
  submit: async (data: HomeworkSubmitRequest): Promise<PracticeResponse> => {
    const res = await post<PracticeResponse>('/homework/submit', data)
    return res.data
  }
}

export const dashboardAPI = {
  getData: async (): Promise<DashboardData> => {
    const res = await get<DashboardData>('/dashboard/data')
    return res.data
  },
  getFilteredData: async (params: DashboardFilterRequest): Promise<DashboardData> => {
    const res = await get<DashboardData>('/dashboard/data/filter', params)
    return res.data
  },
  export: async (params: {
    classId?: string
    startTime?: string
    endTime?: string
    format: string
  }): Promise<Blob> => {
    const res = await get<Blob>('/dashboard/export', params)
    return res.data
  }
}
