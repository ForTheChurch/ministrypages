export interface ConversionTask {
  id: string
  pageId: string
  agentTaskStatus: TaskStatus
  createdAt: string
  updatedAt: string
  url?: string
  error?: string
}

export interface ConversionTaskResponse {
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

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'idle'
