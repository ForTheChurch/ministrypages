'use client'

import React from 'react'
import './styles.css'

interface ModalProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

export function Modal({ children, className = '', visible = true }: ModalProps) {
  if (!visible) {
    return null
  }

  return (
    <div id="modal" className="modal">
      <div className={`modal-content ${className}`}>
        <div id="modal-message">{children}</div>
      </div>
    </div>
  )
}
