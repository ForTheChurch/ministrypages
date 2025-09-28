import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../utils/test-helpers'
import ConvertSinglePageClient from '../../src/components/ConvertSinglePage/client'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import axios from 'axios'
const mockedAxios = axios as any

// Mock Payload UI components
vi.mock('@payloadcms/ui', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
  FieldLabel: ({ label }: any) => <label data-testid="field-label">{label}</label>,
  TextInput: ({ value, onChange, placeholder, path }: any) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid={path}
    />
  ),
  useDocumentInfo: () => ({
    id: 'test-document-123',
  }),
}))

describe('ConvertSinglePage - Component Mounting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: { totalDocs: 0, docs: [] } })
  })

  test('should render component structure without timing out', async () => {
    const { container } = render(<ConvertSinglePageClient />)

    // Basic structure checks
    expect(container.firstChild).toBeTruthy()
    expect(screen.getByText('Convert Single Page')).toBeTruthy()
    expect(
      screen.getByText('Enter a URL to convert a single page into your site structure.'),
    ).toBeTruthy()
  })

  test('should show correct mounted state', async () => {
    render(<ConvertSinglePageClient />)

    // Should show initial UI elements
    expect(screen.getByTestId('inputConversionPageUrl')).toBeTruthy()
    expect(screen.getByTestId('button')).toBeTruthy()
    expect(screen.getByText('No task running')).toBeTruthy()
  })

  test('should have useDocumentInfo working correctly', async () => {
    render(<ConvertSinglePageClient />)

    // Component should render without errors, indicating useDocumentInfo mock works
    expect(screen.getByTestId('inputConversionPageUrl')).toBeTruthy()
  })

  test('should handle the mounted effect properly', async () => {
    const { unmount } = render(<ConvertSinglePageClient />)

    // Should mount without errors
    expect(screen.getByTestId('inputConversionPageUrl')).toBeTruthy()

    // Should unmount without errors
    unmount()
  })
})
