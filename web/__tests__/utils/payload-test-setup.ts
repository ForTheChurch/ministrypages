import { vi } from 'vitest'

// Payload test utilities
export const mockPayloadConfig = {
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'tasks',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'status', type: 'select' },
        { name: 'type', type: 'text' },
      ],
    },
  ],
}

export const createMockPayloadInstance = () => ({
  create: vi.fn(),
  find: vi.fn(),
  findByID: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  collections: {
    tasks: {
      create: vi.fn(),
      find: vi.fn(),
      findByID: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
})

// Setup function for Payload tests
export const setupPayloadTest = () => {
  const mockPayload = createMockPayloadInstance()
  
  // Mock the payload import
  vi.doMock('payload', () => ({
    default: mockPayload,
    ...mockPayload,
  }))
  
  return mockPayload
}