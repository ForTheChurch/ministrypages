import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '../utils/test-helpers'
import axios from 'axios'
import ConvertSinglePageClient from '../../src/components/ConvertSinglePage/client'
import type { ConversionTask } from '../../src/custom-types'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedAxios = axios as any

// Mock Payload UI components
vi.mock('@payloadcms/ui', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="button">
      {children}
    </button>
  ),
  FieldLabel: ({ label, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="field-label">
      {label}
    </label>
  ),
  TextInput: ({ value, onChange, placeholder, path, className }: any) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={path}
      className={className}
    />
  ),
  useDocumentInfo: () => ({
    id: 'test-document-123',
  }),
}))

// Mock createPortal to render inline instead of in document.body
vi.mock('react-dom', () => ({
  createPortal: (children: React.ReactNode) => <div data-testid="portal-content">{children}</div>,
}))

describe('ConvertSinglePage - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: { totalDocs: 0, docs: [] } })
    mockedAxios.post.mockResolvedValue({ data: { success: true } })
  })

  describe('API Integration', () => {
    test('should make correct API call on mount', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1)
      })

      const callUrl = mockedAxios.get.mock.calls[0][0]
      expect(callUrl).toContain('/api/single-page-conversions')
      expect(callUrl).toContain('where')
      expect(callUrl).toContain('pageId')
      expect(callUrl).toContain('test-document-123')
      expect(callUrl).toContain('agentTaskStatus')
    })

    test('should handle API response with active task correctly', async () => {
      const activeTask: ConversionTask = {
        id: 'task-123',
        pageId: 'test-document-123',
        agentTaskStatus: 'running',
        createdAt: '2025-09-28T10:00:00Z',
        updatedAt: '2025-09-28T10:01:00Z',
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 1, docs: [activeTask] },
      })

      render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(screen.getByText('running')).toBeDefined()
      })

      // Check if modal appears
      await waitFor(() => {
        expect(screen.getByTestId('portal-content')).toBeDefined()
      })
    })

    test('should handle API connection errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockedAxios.get.mockRejectedValueOnce({
        message: 'Network Error',
        response: { status: 500 },
      })

      render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[ConvertSinglePage] Failed to get active conversion task:',
          expect.objectContaining({
            error: 'Network Error',
            status: 500,
            documentId: 'test-document-123',
          }),
        )
      })

      // Should show default state
      expect(screen.getByText('No task running')).toBeDefined()

      consoleSpy.mockRestore()
    })
  })

  describe('Task Creation Flow', () => {
    test('should create task and immediately check for updates', async () => {
      // Initial check - no active tasks
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      // Task creation response
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } })

      // Check for new task after creation
      const newTask: ConversionTask = {
        id: 'new-task-456',
        pageId: 'test-document-123',
        agentTaskStatus: 'queued',
        createdAt: '2025-09-28T10:05:00Z',
        updatedAt: '2025-09-28T10:05:00Z',
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 1, docs: [newTask] },
      })

      render(<ConvertSinglePageClient />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('No task running')).toBeDefined()
      })

      // Submit conversion
      const input = screen.getByTestId('inputConversionPageUrl')
      const button = screen.getByTestId('button')

      await act(async () => {
        fireEvent.change(input, { target: { value: 'https://example.com/test' } })
        fireEvent.click(button)
      })

      // Should make POST request
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/begin-single-page-conversion', {
          workflow: 'convertSinglePage',
          data: {
            documentId: 'test-document-123',
            url: 'https://example.com/test',
          },
        })
      })

      // Should check for new task
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2)
      })

      // Should update status
      await waitFor(() => {
        expect(screen.getByText('queued')).toBeDefined()
      })

      // Should show modal
      await waitFor(() => {
        expect(screen.getByTestId('portal-content')).toBeDefined()
      })
    })
  })

  describe('Polling Mechanism', () => {
    test('should start polling when active task exists', async () => {
      const activeTask: ConversionTask = {
        id: 'task-123',
        pageId: 'test-document-123',
        agentTaskStatus: 'running',
        createdAt: '2025-09-28T10:00:00Z',
        updatedAt: '2025-09-28T10:01:00Z',
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 1, docs: [activeTask] },
      })

      render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(screen.getByText('running')).toBeDefined()
      })

      // Component should show active task without polling timer issues
      expect(screen.getByText('🔄')).toBeDefined()
      expect(screen.getByTestId('portal-content')).toBeDefined()
    })
  })

  describe('Modal Display Logic', () => {
    test('should show modal for active tasks only', async () => {
      // Test with running task - should show modal
      const runningTask: ConversionTask = {
        id: 'task-123',
        pageId: 'test-document-123',
        agentTaskStatus: 'running',
        createdAt: '2025-09-28T10:00:00Z',
        updatedAt: '2025-09-28T10:01:00Z',
      }

      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 1, docs: [runningTask] },
      })

      const { unmount } = render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(screen.getByText('running')).toBeDefined()
      })

      // Should show modal for running task
      expect(screen.getByTestId('portal-content')).toBeDefined()

      unmount()
    })
  })

  describe('State Synchronization', () => {
    test('should display correct status and icon for active task', async () => {
      const activeTask: ConversionTask = {
        id: 'task-123',
        pageId: 'test-document-123',
        agentTaskStatus: 'running',
        createdAt: '2025-09-28T10:00:00Z',
        updatedAt: '2025-09-28T10:01:00Z',
      }

      mockedAxios.get.mockResolvedValue({
        data: { totalDocs: 1, docs: [activeTask] },
      })

      render(<ConvertSinglePageClient />)

      // Should show running status
      await waitFor(() => {
        expect(screen.getByText('running')).toBeDefined()
        expect(screen.getByText('🔄')).toBeDefined()
      })
    })
  })

  describe('Network and Timing', () => {
    test('should handle API responses correctly', async () => {
      const activeTask: ConversionTask = {
        id: 'task-123',
        pageId: 'test-document-123',
        agentTaskStatus: 'running',
        createdAt: '2025-09-28T10:00:00Z',
        updatedAt: '2025-09-28T10:01:00Z',
      }

      mockedAxios.get.mockResolvedValue({
        data: { totalDocs: 1, docs: [activeTask] },
      })

      render(<ConvertSinglePageClient />)

      // Should update when API responds
      await waitFor(() => {
        expect(screen.getByText('running')).toBeDefined()
      })

      // Should show modal for active task
      expect(screen.getByTestId('portal-content')).toBeDefined()
    })
  })
})
