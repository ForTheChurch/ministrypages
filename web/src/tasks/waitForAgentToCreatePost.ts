import agentApi from '@/utilities/agentApi'
import { PayloadRequest, TaskConfig } from 'payload'

export const waitForAgentToCreatePostConfig = {
  // This task returns success when the given task is complete
  retries: 9999,
  slug: 'waitForAgentToCreatePost',
  handler: async ({ input, req }: { input: { postCreationId: string }; req: PayloadRequest }) => {
    const { postCreationId } = input

    const videoPostConversion = await req.payload.findByID({
      collection: 'video-post-conversions',
      id: postCreationId,
    })
    const { agentTaskId } = videoPostConversion

    if (!videoPostConversion) {
      throw new Error(`Cannot find video post conversion with ID [${postCreationId}]`)
    }

    // Configure a timeout on the polling for safety
    const timeoutMs = 300000
    const endTime = Date.now() + timeoutMs
    while (true) {
      // TODO: Don't hardcode
      const response = await agentApi.get(`/posts/task/${agentTaskId}`)

      const { task_status: agentTaskStatus } = response.data

      // Update the task status in the document
      await req.payload.update({
        collection: 'video-post-conversions',
        id: postCreationId,
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
        throw new Error('[waitForAgentToCreatePost] Timed out')
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  },
  onFail: async () => {
    console.error("Job 'waitForAgentToCreatePost' failed")
  },
  onSuccess: async () => {
    console.log("Job 'waitForAgentToCreatePost' succeeded")
  },
} as TaskConfig<'waitForAgentToCreatePost'>
