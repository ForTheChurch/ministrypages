import { vi } from 'vitest'

// Mock functions for Go API
export const convertSinglePage = vi.fn(async (pageData: any) => {
  return {
    taskId: Math.random().toString(36).substr(2, 9),
    status: 'started',
    message: 'Page conversion started',
    pageUrl: pageData.url,
  }
})

export const getTaskStatus = vi.fn(async (taskId: string) => {
  return {
    id: taskId,
    status: 'in-progress',
    progress: 50,
    message: 'Converting page content...',
  }
})

export const cancelTask = vi.fn(async (taskId: string) => {
  return {
    id: taskId,
    status: 'cancelled',
    message: 'Task cancelled successfully',
  }
})
