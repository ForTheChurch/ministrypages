export interface ConversionTask {
  id: string
  pageId: string
  agentTaskStatus: AgentTaskStatus
  createdAt: string
  updatedAt: string
  url?: string
  error?: string
}

export interface AgentTaskResponse {
  totalDocs: number
  docs: ConversionTask[]
}

export interface BeginConversionRequest {
  workflow: string
  data: {
    documentId: string
    url: string
  }
}

export interface GenerateVideoTranscriptRequest {
  workflow: string
  data: {
    documentId: string
    url: string
  }
}

export type AgentTaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'idle'

export interface ApiError {
  message: string
  status?: number
  response?: {
    status: number
    data?: {
      error?: string
    }
  }
}
