'use client'

import { getLabelAsString } from '@/utilities/tasks'
import type { UIField } from 'payload'
import React from 'react'
import ConversionForm from './ConversionForm'
import ConversionModal from './ConversionModal'
import ConversionStatus from './ConversionStatus'
import './styles.css'
import { useConversion } from './useConversion'

function PostCreatorClient({ field }: { field?: UIField }) {
  const label = field?.label
  const {
    mounted,
    url,
    setUrl,
    activeConversion,
    isLoading,
    isWaitingForTask,
    handleSubmit,
    isAgentTaskActive,
  } = useConversion()

  if (!mounted) {
    return null
  }

  return (
    <React.Fragment>
      <ConversionModal
        isWaitingForTask={isWaitingForTask}
        visible={isAgentTaskActive || isWaitingForTask}
      />
      <div className="convert-container">
        <div className="convert-header">
          <h3 className="convert-title">
            {label ? getLabelAsString(label) : 'Create Post from URL'}
          </h3>
          <p className="convert-description">
            Enter a URL to a video to create a post from the video.
          </p>
        </div>

        <div className="convert-form">
          <ConversionForm
            url={url}
            isLoading={isLoading}
            onUrlChange={setUrl}
            onSubmit={handleSubmit}
          />
          <ConversionStatus activeConversion={activeConversion} />
        </div>
      </div>
    </React.Fragment>
  )
}

export default PostCreatorClient
