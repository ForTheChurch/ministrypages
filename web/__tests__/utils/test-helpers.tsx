import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function that can include providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const createMockTask = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2, 11),
  title: 'Test Task',
  status: 'in-progress',
  type: 'convert-single-page',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const waitForElement = async (callback: () => any, timeout = 3000) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = callback()
      if (result) return result
    } catch (error) {
      // Continue waiting
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  throw new Error(`Element not found within ${timeout}ms`)
}