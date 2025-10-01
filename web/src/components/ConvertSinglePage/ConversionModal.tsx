import { Modal } from '@/components/Modal'
import { Button } from '@payloadcms/ui'
import React from 'react'
import { createPortal } from 'react-dom'
import { navigate } from './utils'

interface ConversionModalProps {
  isWaitingForTask: boolean
  visible: boolean
}

const ConversionModal: React.FC<ConversionModalProps> = ({ isWaitingForTask, visible }) => {
  const onClickGoToPages = () => {
    navigate('/admin/collections/pages')
  }

  return createPortal(
    <Modal visible={visible}>
      <div className="convert-modal-content">
        {isWaitingForTask ? (
          <>
            <div className="convert-modal-spinner">
              <div className="spinner"></div>
            </div>
            <p className="convert-modal-text">Creating conversion task...</p>
          </>
        ) : (
          <p className="convert-modal-text">
            A conversion is in progress. This page will automatically refresh when the task is
            complete.
          </p>
        )}
        <div className="convert-modal-buttons">
          <Button onClick={onClickGoToPages} size="large">
            Go to Pages
          </Button>
        </div>
      </div>
    </Modal>,
    document.body,
  )
}

export default ConversionModal
