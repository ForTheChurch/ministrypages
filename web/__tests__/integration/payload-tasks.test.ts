import { describe, test, expect, beforeEach, vi } from 'vitest'
import { createTask, updateTask, getTasks } from '../__mocks__/payloadApi'

describe('Payload Tasks Integration Tests', () => {
  describe('Task Creation and Updates', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      vi.clearAllMocks()
    })

    test('should create a task and update its status', async () => {
      const taskData = { 
        title: 'Test Task', 
        status: 'in-progress',
        type: 'convert-single-page'
      }
      
      const createdTask = await createTask(taskData)
      
      expect(createdTask).toHaveProperty('id')
      expect(createdTask.status).toBe('in-progress')
      expect(createdTask.title).toBe('Test Task')
      expect(createdTask.type).toBe('convert-single-page')
      expect(createdTask).toHaveProperty('createdAt')
      expect(createdTask).toHaveProperty('updatedAt')

      const updatedTask = await updateTask(createdTask.id, { status: 'completed' })
      expect(updatedTask.status).toBe('completed')
      expect(updatedTask).toHaveProperty('updatedAt')
    })

    test('should handle task creation errors gracefully', async () => {
      const invalidTaskData = { title: '' } // Invalid data
      
      await expect(createTask(invalidTaskData))
        .rejects
        .toThrow('Task title is required')
    })

    test('should create task with all required fields', async () => {
      const taskData = {
        title: 'Convert Homepage',
        status: 'pending',
        type: 'convert-single-page',
        url: 'https://example.com',
      }

      const createdTask = await createTask(taskData)

      expect(createdTask).toMatchObject({
        title: 'Convert Homepage',
        status: 'pending',
        type: 'convert-single-page',
        url: 'https://example.com',
      })
      expect(typeof createdTask.id).toBe('string')
      expect(createdTask.id.length).toBeGreaterThan(0)
    })
  })

  describe('Task Fetching', () => {
    test('should fetch tasks and verify their structure', async () => {
      const tasks = await getTasks()
      
      expect(Array.isArray(tasks)).toBe(true)
      expect(tasks.length).toBeGreaterThan(0)
      
      tasks.forEach(task => {
        expect(task).toHaveProperty('id')
        expect(task).toHaveProperty('title')
        expect(task).toHaveProperty('status')
        expect(task).toHaveProperty('type')
        expect(task).toHaveProperty('createdAt')
        expect(task).toHaveProperty('updatedAt')
      })
    })

    test('should filter tasks by status', async () => {
      const inProgressTasks = await getTasks({ status: 'in-progress' })
      
      expect(Array.isArray(inProgressTasks)).toBe(true)
      inProgressTasks.forEach(task => {
        expect(task.status).toBe('in-progress')
      })
    })

    test('should return all tasks when no filters applied', async () => {
      const allTasks = await getTasks()
      expect(allTasks.length).toBe(2) // Based on mock data
    })
  })

  describe('Task Status Updates', () => {
    test('should update task status from pending to in-progress', async () => {
      const taskData = { title: 'Test Task', status: 'pending' }
      const createdTask = await createTask(taskData)
      
      const updatedTask = await updateTask(createdTask.id, { status: 'in-progress' })
      
      expect(updatedTask.status).toBe('in-progress')
      expect(updatedTask.id).toBe(createdTask.id)
    })

    test('should update task status from in-progress to completed', async () => {
      const taskData = { title: 'Test Task', status: 'in-progress' }
      const createdTask = await createTask(taskData)
      
      const updatedTask = await updateTask(createdTask.id, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      
      expect(updatedTask.status).toBe('completed')
    })
  })
})