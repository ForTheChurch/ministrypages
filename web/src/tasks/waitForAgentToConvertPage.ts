import agentApi from '@/utilities/agentApi'
import { PayloadRequest, TaskConfig } from 'payload'

export const waitForAgentToConvertPageConfig = {
  // This task returns success when the given task is complete
  retries: 9999,
  slug: 'waitForAgentToConvertPage',
  inputSchema: [
    {
      name: 'singlePageConversionId',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'status',
      type: 'text',
      required: true,
    },
  ],
  handler: async ({
    input,
    req,
  }: {
    input: { singlePageConversionId: string }
    req: PayloadRequest
  }) => {
    const { singlePageConversionId } = input

    const singlePageConversion = await req.payload.findByID({
      collection: 'single-page-conversions',
      id: singlePageConversionId,
    })
    const { agentTaskId } = singlePageConversion

    if (!singlePageConversion) {
      throw new Error(`Cannot find single page conversion with ID [${singlePageConversionId}]`)
    }

    // Configure a timeout on the polling for safety
    const timeoutMs = 300000
    const endTime = Date.now() + timeoutMs
    while (true) {
      // TODO: Don't hardcode
      const response = await agentApi.get(`/pages/task/${agentTaskId}`)

      const { task_status: agentTaskStatus } = response.data

      // Update the task status in the document
      await req.payload.update({
        collection: 'single-page-conversions',
        id: singlePageConversionId,
        data: { agentTaskStatus },
      })

      // Status schema:
      // {
      //   "task_status": "queued" | "running" | "completed" | "failed"
      // }
      if (agentTaskStatus == 'completed' || agentTaskStatus == 'failed') {
        return {
          output: { status: agentTaskStatus },
        }
      }

      // Timeout
      if (Date.now() >= endTime) {
        throw new Error('[waitForAgentToConvertPage] Timed out')
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  },
  onFail: async () => {
    console.error("Job 'waitForAgentToConvertPage' failed")
  },
  onSuccess: async () => {
    console.log("Job 'waitForAgentToConvertPage' succeeded")
  },
} as TaskConfig<'waitForAgentToConvertPage'>
