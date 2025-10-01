import { useDocumentInfo } from '@payloadcms/ui'
import axios from 'axios'
import { useEffect, useState } from 'react'
import type { ApiError, BeginConversionRequest, ConversionTask } from '../../custom-types'
import { getActiveConversionTask, isAgentTaskActive } from './api'
import { reloadPage } from './utils'

export const useConversion = () => {
  const { id } = useDocumentInfo()
  const documentId = id

  const [mounted, setMounted] = useState<boolean>(false)
  const [url, setUrl] = useState<string>('')
  const [activeConversion, setActiveConversion] = useState<ConversionTask | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isWaitingForTask, setIsWaitingForTask] = useState<boolean>(false)

  // Update the mounted status
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Get the initial active conversion
  useEffect(() => {
    if (documentId) {
      getActiveConversionTask(String(documentId)).then((task) => {
        setActiveConversion(task)
      })
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

  const handleSubmit = async (): Promise<void> => {
    if (!documentId) return
    setIsLoading(true)
    const requestData: BeginConversionRequest = {
      workflow: 'convertSinglePage',
      data: { documentId: String(documentId), url },
    }

    try {
      await axios.post('/api/begin-single-page-conversion', requestData)
      setIsLoading(false)
      setIsWaitingForTask(true) // Show spinner modal immediately

      // Poll for the new task to appear
      const pollForTask = async (attempts = 0, maxAttempts = 10): Promise<void> => {
        const newTask = await getActiveConversionTask(String(documentId))
        if (newTask) {
          setIsWaitingForTask(false)
          setActiveConversion(newTask)
        } else if (attempts < maxAttempts) {
          // Wait a bit longer and try again
          setTimeout(() => pollForTask(attempts + 1, maxAttempts), 1000)
        } else {
          // Give up after max attempts
          setIsWaitingForTask(false)
          console.error('[ConvertSinglePage] Failed to find created task after polling')
        }
      }

      pollForTask()
    } catch (error) {
      const apiError = error as ApiError
      console.error('[ConvertSinglePage] Error creating job:', {
        error: apiError.message,
        status: apiError.response?.status,
        url,
        documentId,
      })
      setIsLoading(false)
      setIsWaitingForTask(false)
      // TODO: Show user-friendly error message
    }
  }

  return {
    mounted,
    url,
    setUrl,
    activeConversion,
    isLoading,
    isWaitingForTask,
    handleSubmit,
    isAgentTaskActive: isAgentTaskActive(activeConversion),
  }
}
