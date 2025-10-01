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
      <FieldLabel as="label" label="Page URL" htmlFor="inputConversionPageUrl" />
      <div className="convert-input-group">
        <TextInput
          path="inputConversionPageUrl"
          placeholder="https://example.com/page-to-convert"
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
          {isLoading ? 'Converting...' : 'Convert'}
        </Button>
      </div>
    </div>
  )
}

export default ConversionForm
