'use client'

import { Button, FieldLabel, TextInput, useDocumentInfo } from '@payloadcms/ui'
import axios from 'axios'
import type { UIField, Where } from 'payload'
import { stringify } from 'qs-esm'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  BeginConversionRequest,
  ConversionTask,
  ConversionTaskResponse,
  TaskStatus,
} from '../../custom-types'
import Modal from './modal'
import './styles.css'

const getLabelAsString = (label?: Record<string, string> | string) => {
  return typeof label === 'string' ? label : ''
}

const reloadPage = () => {
  window.location.reload()
}

const navigate = (url: string) => {
  window.location.href = url
}

const createModal = () => {
  const onClickGoToPages = () => {
    navigate('/admin/collections/pages')
  }

  const onClickCancelTask = () => {
    console.warn("[ConvertSinglePage] 'Cancel Task' button is not implemented")
  }

  return createPortal(
    <Modal>
      <div className="convert-modal-content">
        <p className="convert-modal-text">
          A conversion is in progress. This page will automatically refresh when the task is
          complete.
        </p>
        <div className="convert-modal-buttons">
          <Button onClick={onClickGoToPages}>Go to Pages</Button>
          <Button onClick={onClickCancelTask}>Cancel Task</Button>
        </div>
      </div>
    </Modal>,
    document.body,
  )
}

const getActiveConversionTask = async (documentId: string): Promise<ConversionTask | null> => {
  const query: Where = {
    and: [{ pageId: { equals: documentId } }, { agentTaskStatus: { in: 'queued,running' } }],
  }
  const queryString = stringify(
    {
      where: query,
      limit: 1,
      sort: '-createdAt',
    },
    { addQueryPrefix: true },
  )

  try {
    const result = await axios.get<ConversionTaskResponse>(
      `/api/single-page-conversions${queryString}`,
    )
    if (result.data?.totalDocs !== 1) {
      return null
    }
    const { docs } = result.data
    return docs[0] || null
  } catch (error) {
    console.error('[ConvertSinglePage] Failed to get active conversion task with error:', error)
    return null
  }
}

const isAgentTaskActive = (agentTask: ConversionTask | null | undefined): boolean => {
  if (!agentTask) return false
  const agentTaskStatus = agentTask.agentTaskStatus
  return agentTaskStatus === 'queued' || agentTaskStatus === 'running'
}

function ConvertSinglePageClient({ field }: { field?: UIField }) {
  const label = field?.label

  const [mounted, setMounted] = useState<boolean>(false)
  const [url, setUrl] = useState<string>('')
  const [activeConversion, setActiveConversion] = useState<ConversionTask | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { id } = useDocumentInfo()
  const documentId = id

  // TODO: Make this more robust
  //  - Handle dirty form
  //  - Handle existing conversion task
  //  - Better error handling
  const handleSubmit = async (): Promise<void> => {
    if (!documentId) return
    setIsLoading(true)
    const requestData: BeginConversionRequest = {
      workflow: 'convertSinglePage',
      data: { documentId: String(documentId), url },
    }

    try {
      await axios.post('/api/begin-single-page-conversion', requestData)
      // Don't reload immediately - let the polling handle the status updates
      setIsLoading(false)
      // Trigger a status check to get the new task
      const newTask = await getActiveConversionTask(String(documentId))
      setActiveConversion(newTask)
    } catch (error) {
      console.error('Error creating job:', error)
      setIsLoading(false)
    }
  }

  // Update the mounted status
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Get the initial active conversion
  useEffect(() => {
    if (documentId) {
      getActiveConversionTask(String(documentId)).then((task) => setActiveConversion(task))
    }
  }, [documentId])

  // Poll once every second for conversion complete and then reload
  useEffect(() => {
    if (!isAgentTaskActive(activeConversion) || !documentId) return

    const intervalId = setInterval(async () => {
      const conversionTask = await getActiveConversionTask(String(documentId))
      setActiveConversion(conversionTask)
      if (!isAgentTaskActive(conversionTask)) {
        clearInterval(intervalId)
        reloadPage()
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [activeConversion, documentId])

  const getStatusClass = (status: TaskStatus | string): string => {
    switch (status) {
      case 'queued':
        return 'convert-status-queued'
      case 'running':
        return 'convert-status-running'
      case 'completed':
        return 'convert-status-completed'
      case 'failed':
        return 'convert-status-failed'
      default:
        return 'convert-status-idle'
    }
  }

  const getStatusIcon = (status: TaskStatus | string): string => {
    switch (status) {
      case 'queued':
        return '⏳'
      case 'running':
        return '🔄'
      case 'completed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '⭕'
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <React.Fragment>
      {isAgentTaskActive(activeConversion) && createModal()}
      <div className="convert-container">
        <div className="convert-header">
          <h3 className="convert-title">
            {label ? getLabelAsString(label) : 'Convert Single Page'}
          </h3>
          <p className="convert-description">
            Enter a URL to convert a single page into your site structure.
          </p>
        </div>

        <div className="convert-form">
          <div>
            <FieldLabel as="label" label="Page URL" htmlFor="inputConversionPageUrl" />
            <div className="convert-input-group">
              <TextInput
                path="inputConversionPageUrl"
                placeholder="https://example.com/page-to-convert"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                className="convert-input"
              />
              <Button
                type="button"
                className="convert-button"
                size="large"
                disabled={!url || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Converting...' : 'Convert'}
              </Button>
            </div>
          </div>

          <div className="status-container">
            <FieldLabel as="label" label="Task Status" />
            <div
              className={`convert-status ${getStatusClass(activeConversion?.agentTaskStatus || 'idle')}`}
            >
              <span className="convert-status-icon">
                {getStatusIcon(activeConversion?.agentTaskStatus || 'idle')}
              </span>
              <span className="convert-status-text">
                {activeConversion?.agentTaskStatus || 'No task running'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ConvertSinglePageClient
