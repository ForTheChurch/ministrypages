import { TaskConfig } from "payload"
import agentApi from "@/utilities/agentApi"

const waitForAgentTask = {
  // This task returns success when the given task is complete
  retries: 9999,
  slug: 'waitForAgentTask',
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
    job,
    req,
  }: {
    input: { singlePageConversionId: string }
    job: any
    req: any
  }) => {
    const { singlePageConversionId } = input

    const singlePageConversion = await req.payload.findByID({
      collection: 'single-page-conversions',
      id: singlePageConversionId,
    })
    const { agentTaskId } = singlePageConversion

    if (!singlePageConversion) {
      throw new Error(
        `Cannot find single page conversion with ID [${singlePageConversionId}]`,
      )
    }

    // Configure a timeout on the polling for safety
    const timeoutMs = 300000
    const endTime = Date.now() + timeoutMs
    while (true) {
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
        throw new Error('[waitForAgentTask] Timed out')
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  },
  onFail: async () => {
    console.error("Job 'waitForAgentTask' failed")
  },
  onSuccess: async () => {
    console.log("Job 'waitForAgentTask' succeeded")
  },
} as TaskConfig<'waitForAgentTask'>

export default waitForAgentTask;
