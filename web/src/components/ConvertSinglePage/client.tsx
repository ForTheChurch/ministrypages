'use client'

import type { UIField } from 'payload'
import React from 'react'
import ConversionForm from './ConversionForm'
import ConversionModal from './ConversionModal'
import ConversionStatus from './ConversionStatus'
import './styles.css'
import { useConversion } from './useConversion'
import { getLabelAsString } from './utils'

function ConvertSinglePageClient({ field }: { field?: UIField }) {
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
            {label ? getLabelAsString(label) : 'Convert Single Page'}
          </h3>
          <p className="convert-description">
            Enter a URL to convert a single page into your site structure.
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

export default ConvertSinglePageClient
