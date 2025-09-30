'use client'

import { Button, FieldLabel, TextInput, useField, useDocumentInfo } from '@payloadcms/ui'
import axios from 'axios'
import type { Description, TextField, TextFieldClientComponent, Where } from 'payload'
import { stringify } from 'qs-esm'
import React, { useEffect, useState } from 'react'
import type {
  ApiError,
  BeginConversionRequest,
  ConversionTask,
  AgentTaskStatus,
  AgentTaskResponse,
} from '../../custom-types'
import './styles.css'


const reloadPage = () => {
  window.location.reload()
}


const GenerateVideoTranscriptButtonClient: TextFieldClientComponent = ({ field, path }) => {
  const label = field?.label || "Generate transcript";
  const description: Description = field?.admin?.description || "";

  const { value, setValue, showError, errorMessage, initialValue, valid } = useField<string>({ path });
  const isDirty = value != initialValue;

  // const [activeAgentTask, setActiveAgentTask] = useState<ConversionTask | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isWaitingForTask, setIsWaitingForTask] = useState<boolean>(false)

  const { id } = useDocumentInfo()
  const documentId = id

  const handleSubmit = async (): Promise<void> => {
    if (!documentId) return
    setIsLoading(true);
    // TODO: Implement
  }

  return (
    <React.Fragment>
      <div className="field-type text">
        <div className="field-type__wrap">
          <label className="field-label">
            {String(label)}
          </label>
          <div className="convert-input-group">
            <TextInput
              path={path}
              placeholder="https://youtu.be/..."
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="convert-input"
            />
            <Button
              disabled={isDirty}
            >Generate Transcript</Button>
          </div>
          <div className="field-description field-description-videoLink">
            {String(description)}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default GenerateVideoTranscriptButtonClient
