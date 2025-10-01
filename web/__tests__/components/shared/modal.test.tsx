import { Modal } from '@/components/Modal'
import { describe, expect, test } from 'vitest'
import { render, screen } from '../../utils/test-helpers'

describe('Modal', () => {
  test('should render modal with children', () => {
    const testContent = 'Test modal content'

    render(
      <Modal>
        <div>{testContent}</div>
      </Modal>,
    )

    expect(screen.getByText(testContent)).toBeDefined()
  })

  test('should have correct CSS classes', () => {
    const testContent = 'Modal content'

    render(
      <Modal>
        <div data-testid="modal-child">{testContent}</div>
      </Modal>,
    )

    // Check for modal structure
    const modalElement = document.querySelector('.modal')
    expect(modalElement).toBeDefined()

    const modalContent = document.querySelector('.modal-content')
    expect(modalContent).toBeDefined()

    const modalMessage = document.querySelector('#modal-message')
    expect(modalMessage).toBeDefined()
  })

  test('should render multiple children correctly', () => {
    render(
      <Modal>
        <h1>Modal Title</h1>
        <p>Modal description</p>
        <button>Modal action</button>
      </Modal>,
    )

    expect(screen.getByText('Modal Title')).toBeDefined()
    expect(screen.getByText('Modal description')).toBeDefined()
    expect(screen.getByText('Modal action')).toBeDefined()
  })

  test('should accept custom className', () => {
    const testContent = 'Modal with custom class'
    const customClass = 'custom-modal-class'

    render(
      <Modal className={customClass}>
        <div>{testContent}</div>
      </Modal>,
    )

    const modalContent = document.querySelector('.modal-content')
    expect(modalContent?.className).toContain(customClass)
  })

  test('should not render when visible is false', () => {
    const testContent = 'Hidden modal content'

    render(
      <Modal visible={false}>
        <div>{testContent}</div>
      </Modal>,
    )

    expect(screen.queryByText(testContent)).toBeNull()
    expect(document.querySelector('.modal')).toBeNull()
  })

  test('should render when visible is true (default)', () => {
    const testContent = 'Visible modal content'

    render(
      <Modal visible={true}>
        <div>{testContent}</div>
      </Modal>,
    )

    expect(screen.getByText(testContent)).toBeDefined()
    expect(document.querySelector('.modal')).toBeDefined()
  })

  test('should render when visible prop is not provided (default true)', () => {
    const testContent = 'Default visible modal content'

    render(
      <Modal>
        <div>{testContent}</div>
      </Modal>,
    )

    expect(screen.getByText(testContent)).toBeDefined()
    expect(document.querySelector('.modal')).toBeDefined()
  })
})
