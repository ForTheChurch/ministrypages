import { cn } from '@/utilities/ui'
import * as React from 'react'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  return (
    <div
      className={cn('w-full p-2', className)}
      style={{ maxWidth: width ? `${width}%` : undefined }}
    >
      {children}
    </div>
  )
}
