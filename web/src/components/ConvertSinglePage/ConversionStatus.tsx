import { FieldLabel } from '@payloadcms/ui'
import React from 'react'
import type { ConversionTask } from '../../custom-types'
import { getStatusClass, getStatusIcon } from './utils'

interface ConversionStatusProps {
  activeConversion: ConversionTask | null
}

const ConversionStatus: React.FC<ConversionStatusProps> = ({ activeConversion }) => {
  const status = activeConversion?.agentTaskStatus || 'idle'

  return (
    <div className="status-container">
      <FieldLabel as="label" label="Task Status" />
      <div className={`convert-status ${getStatusClass(status)}`}>
        <span className="convert-status-icon">{getStatusIcon(status)}</span>
        <span className="convert-status-text">
          {status === 'idle' ? 'No task running' : status}
        </span>
      </div>
    </div>
  )
}

export default ConversionStatus
