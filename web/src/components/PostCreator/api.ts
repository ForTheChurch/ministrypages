import type { ApiError, ConversionTask, ConversionTaskResponse } from '@/custom-types'
import axios from 'axios'
import type { Where } from 'payload'
import { stringify } from 'qs-esm'

export const getActiveConversionTask = async (
  documentId: string,
): Promise<ConversionTask | null> => {
  const query: Where = {
    and: [{ postId: { equals: documentId } }, { agentTaskStatus: { in: 'queued,running' } }],
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
      `/api/video-post-conversions${queryString}`,
    )
    if (result.data?.totalDocs !== 1) {
      return null
    }
    const { docs } = result.data
    return docs[0] || null
  } catch (error) {
    const apiError = error as ApiError
    console.error('[PostCreator] Failed to get active conversion task:', {
      error: apiError.message,
      status: apiError.response?.status,
      documentId,
    })
    return null
  }
}

export const isAgentTaskActive = (agentTask: ConversionTask | null | undefined): boolean => {
  if (!agentTask) return false
  const agentTaskStatus = agentTask.agentTaskStatus
  return agentTaskStatus === 'queued' || agentTaskStatus === 'running'
}
