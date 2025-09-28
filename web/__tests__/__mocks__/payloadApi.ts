import { vi } from 'vitest'

// Mock API functions for testing
export const createTask = vi.fn(async (taskData: any) => {
  if (!taskData.title || taskData.title.trim() === '') {
    throw new Error('Task title is required')
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
})

export const updateTask = vi.fn(async (id: string, updates: any) => {
  return {
    id,
    title: 'Updated Task',
    status: 'completed',
    type: 'convert-single-page',
    ...updates,
    updatedAt: new Date().toISOString(),
  }
})

export const getTasks = vi.fn(async (filters?: any) => {
  const allTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      status: 'in-progress',
      type: 'convert-single-page',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Test Task 2',
      status: 'completed',
      type: 'convert-single-page',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  if (filters?.status) {
    return allTasks.filter(task => task.status === filters.status)
  }

  return allTasks
})

export const deleteTask = vi.fn(async (id: string) => {
  return { success: true, id }
})