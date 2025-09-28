import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Setup for tests
beforeAll(() => {
  // Global setup before all tests
})

// Reset any mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Clean up after all tests
afterAll(() => {
  // Global cleanup
})

// Mock next/router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))

// Mock next/navigation (for App Router)
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Payload CMS
vi.mock('payload', () => ({
  create: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findByID: vi.fn(),
}))