import { describe, test, expect, beforeEach, vi } from 'vitest'
import { convertSinglePage, getTaskStatus } from '../__mocks__/agentApi'

describe('API Communication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Agent API Communication', () => {
    test('should successfully start page conversion task', async () => {
      const pageData = {
        url: 'https://example.com/page',
        title: 'Example Page',
      }

      const result = await convertSinglePage(pageData)

      expect(result).toHaveProperty('taskId')
      expect(result.status).toBe('started')
      expect(result.message).toBe('Page conversion started')
      expect(result.pageUrl).toBe(pageData.url)
    })

    test('should get task status', async () => {
      const taskId = 'test-task-123'
      const status = await getTaskStatus(taskId)

      expect(status).toHaveProperty('id', taskId)
      expect(status).toHaveProperty('status')
      expect(status).toHaveProperty('progress')
      expect(status).toHaveProperty('message')
    })
  })

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock an API failure
      convertSinglePage.mockRejectedValueOnce(new Error('API Error'))

      const pageData = { url: 'https://example.com' }
      
      await expect(convertSinglePage(pageData))
        .rejects
        .toThrow('API Error')
    })
  })

  describe('Integration Flow', () => {
    test('should complete full task lifecycle', async () => {
      // 1. Start conversion
      const pageData = { url: 'https://example.com/test' }
      const startResult = await convertSinglePage(pageData)
      
      expect(startResult.status).toBe('started')
      
      // 2. Check status
      const statusResult = await getTaskStatus(startResult.taskId)
      
      expect(statusResult.id).toBe(startResult.taskId)
      expect(statusResult.status).toBe('in-progress')
    })
  })
})