import { describe, test, expect, beforeEach, vi } from 'vitest'
import { convertSinglePage } from './__mocks__/agentApi'

describe('Single Page Conversion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should send a single URL to the backend', async () => {
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

  test('should handle conversion request with minimal data', async () => {
    const pageData = {
      url: 'https://example.com',
    }

    const result = await convertSinglePage(pageData)

    expect(result).toHaveProperty('taskId')
    expect(result.status).toBe('started')
    expect(typeof result.taskId).toBe('string')
    expect(result.taskId.length).toBeGreaterThan(0)
  })

  test('should return task ID for tracking', async () => {
    const pageData = {
      url: 'https://example.com/test-page',
      title: 'Test Page',
    }

    const result = await convertSinglePage(pageData)

    expect(result.taskId).toBeDefined()
    expect(typeof result.taskId).toBe('string')
    // Task ID should be in a reasonable format (alphanumeric)
    expect(result.taskId).toMatch(/^[a-zA-Z0-9]+$/)
  })
})
