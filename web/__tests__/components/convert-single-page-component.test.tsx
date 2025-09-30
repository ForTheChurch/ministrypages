import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-helpers'
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

// Mock window.location methods
const mockReload = vi.fn()
const mockLocationAssign = vi.fn()

Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
    href: '',
  },
  writable: true,
})

// Mock createPortal
vi.mock('react-dom', () => ({
  createPortal: (children: React.ReactNode) => children,
}))

describe('ConvertSinglePageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: '',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Component Rendering', () => {
    test('should render the component with default label', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(screen.getByText('Convert Single Page')).toBeDefined()
      })

      expect(
        screen.getByText('Enter a URL to convert a single page into your site structure.'),
      ).toBeDefined()
      expect(screen.getByTestId('inputConversionPageUrl')).toBeDefined()
      expect(screen.getByTestId('button')).toBeDefined()
    })

    test('should render with custom field label', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      const field = {
        label: 'Custom Convert Label',
        admin: {},
        name: 'convertField',
        type: 'ui' as const,
      }
      render(<ConvertSinglePageClient field={field} />)

      await waitFor(() => {
        expect(screen.getByText('Custom Convert Label')).toBeDefined()
      })
    })

    test('should show correct initial status', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      await waitFor(() => {
        expect(screen.getByText('No task running')).toBeDefined()
      })
    })
  })

  describe('URL Input', () => {
    test('should update URL input value', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      const input = screen.getByTestId('inputConversionPageUrl') as HTMLInputElement

      fireEvent.change(input, { target: { value: 'https://example.com' } })

      expect(input.value).toBe('https://example.com')
    })

    test('should disable convert button when URL is empty', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      const button = screen.getByTestId('button') as HTMLButtonElement

      expect(button.disabled).toBe(true)
    })

    test('should enable convert button when URL has value', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      const input = screen.getByTestId('inputConversionPageUrl')
      const button = screen.getByTestId('button') as HTMLButtonElement

      fireEvent.change(input, { target: { value: 'https://example.com' } })

      await waitFor(() => {
        expect(button.disabled).toBe(false)
      })
    })
  })

  describe('Active Conversion Detection', () => {
    test('should fetch active conversion on mount', async () => {
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
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/single-page-conversions?where'),
        )
      })

      await waitFor(() => {
        expect(screen.getByText('running')).toBeDefined()
      })
    })

    test('should show modal when active conversion exists', async () => {
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
        expect(
          screen.getByText(
            'A conversion is in progress. This page will automatically refresh when the task is complete.',
          ),
        ).toBeDefined()
      })

      expect(screen.getByText('Go to Pages')).toBeDefined()
      expect(screen.getByText('Cancel Task')).toBeDefined()
    })
  })

  describe('Conversion Submission', () => {
    test('should submit conversion request with correct data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } })
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      render(<ConvertSinglePageClient />)

      const input = screen.getByTestId('inputConversionPageUrl')
      const button = screen.getByTestId('button')

      fireEvent.change(input, { target: { value: 'https://example.com/test' } })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/begin-single-page-conversion', {
          workflow: 'convertSinglePage',
          data: {
            documentId: 'test-document-123',
            url: 'https://example.com/test',
          },
        })
      })
    })

    test('should show loading state during submission', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })

      // Make the post request hang
      mockedAxios.post.mockImplementation(() => new Promise(() => {}))

      render(<ConvertSinglePageClient />)

      const input = screen.getByTestId('inputConversionPageUrl')
      const button = screen.getByTestId('button')

      fireEvent.change(input, { target: { value: 'https://example.com/test' } })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Converting...')).toBeDefined()
      })

      const buttonElement = screen.getByTestId('button') as HTMLButtonElement
      expect(buttonElement.disabled).toBe(true)
    })

    test('should handle submission errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockedAxios.get.mockResolvedValueOnce({
        data: { totalDocs: 0, docs: [] },
      })
      mockedAxios.post.mockRejectedValueOnce({
        message: 'Network Error',
        response: { status: 500 },
      })

      render(<ConvertSinglePageClient />)

      const input = screen.getByTestId('inputConversionPageUrl')
      const button = screen.getByTestId('button')

      fireEvent.change(input, { target: { value: 'https://example.com/test' } })
      fireEvent.click(button)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[ConvertSinglePage] Error creating job:',
          expect.objectContaining({
            error: 'Network Error',
            status: 500,
          }),
        )
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Status Display', () => {
    test('should display correct status icons and classes', async () => {
      const testStatuses: Array<{ status: any; icon: string; className: string }> = [
        { status: 'queued', icon: '⏳', className: 'convert-status-queued' },
        { status: 'running', icon: '🔄', className: 'convert-status-running' },
        { status: 'completed', icon: '✅', className: 'convert-status-completed' },
        { status: 'failed', icon: '❌', className: 'convert-status-failed' },
        { status: 'idle', icon: '⭕', className: 'convert-status-idle' },
      ]

      for (const { status, icon, className } of testStatuses) {
        const task: ConversionTask = {
          id: 'task-123',
          pageId: 'test-document-123',
          agentTaskStatus: status,
          createdAt: '2025-09-28T10:00:00Z',
          updatedAt: '2025-09-28T10:01:00Z',
        }

        mockedAxios.get.mockResolvedValueOnce({
          data: { totalDocs: status === 'idle' ? 0 : 1, docs: status === 'idle' ? [] : [task] },
        })

        const { unmount } = render(<ConvertSinglePageClient />)

        await waitFor(() => {
          const statusElement = document.querySelector(`.${className}`)
          expect(statusElement).toBeDefined()
          expect(screen.getByText(icon)).toBeDefined()
        })

        unmount()
        vi.clearAllMocks()
      }
    })
  })

  describe('Modal Actions', () => {
    test('should navigate to pages collection when "Go to Pages" is clicked', async () => {
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

      const goToPagesButton = await screen.findByText('Go to Pages')
      fireEvent.click(goToPagesButton)

      expect(window.location.href).toBe('/admin/collections/pages')
    })

    test('should log warning when "Cancel Task" is clicked', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

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

      const cancelButton = await screen.findByText('Cancel Task')
      fireEvent.click(cancelButton)

      expect(consoleSpy).toHaveBeenCalledWith(
        "[ConvertSinglePage] 'Cancel Task' button is not implemented",
      )

      consoleSpy.mockRestore()
    })
  })
})
