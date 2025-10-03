import { Modal } from '@/components/Modal'
import { navigate } from '@/utilities/tasks'
import { Button } from '@payloadcms/ui'
import React from 'react'
import { createPortal } from 'react-dom'

interface ConversionModalProps {
  isWaitingForTask: boolean
  visible: boolean
}

const ConversionModal: React.FC<ConversionModalProps> = ({ isWaitingForTask, visible }) => {
  const onClickGoToPosts = () => {
    navigate('/admin/collections/posts')
  }

  return createPortal(
    <Modal visible={visible}>
      <div className="convert-modal-content">
        {isWaitingForTask ? (
          <>
            <div className="convert-modal-spinner">
              <div className="spinner"></div>
            </div>
            <p className="convert-modal-text">Working on creating your post...</p>
          </>
        ) : (
          <p className="convert-modal-text">
            Your post is being created. This page will automatically refresh when the task is
            complete.
          </p>
        )}
        <div className="convert-modal-buttons">
          <Button onClick={onClickGoToPosts} size="large">
            View Posts
          </Button>
        </div>
      </div>
    </Modal>,
    document.body,
  )
}

export default ConversionModal
