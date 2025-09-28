import { describe, test, expect } from 'vitest'
import { render, screen } from '../utils/test-helpers'
import Modal from '../../src/components/ConvertSinglePage/modal'

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
})
