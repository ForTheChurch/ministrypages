import { Button, FieldLabel, TextInput } from '@payloadcms/ui'
import React from 'react'

interface ConversionFormProps {
  url: string
  isLoading: boolean
  onUrlChange: (url: string) => void
  onSubmit: () => void
}

const ConversionForm: React.FC<ConversionFormProps> = ({
  url,
  isLoading,
  onUrlChange,
  onSubmit,
}) => {
  return (
    <div>
      <FieldLabel as="label" label="Video URL" htmlFor="inputConversionVideoUrl" />
      <div className="convert-input-group">
        <TextInput
          path="inputConversionVideoUrl"
          placeholder="https://youtube.com/video-link"
          value={url}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUrlChange(e.target.value)}
          className="convert-input"
        />
        <Button
          type="button"
          className="convert-button"
          size="large"
          disabled={!url || isLoading}
          onClick={onSubmit}
        >
          {isLoading ? 'Creating post...' : 'Create post'}
        </Button>
      </div>
    </div>
  )
}

export default ConversionForm
