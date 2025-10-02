import agentApi from '@/utilities/agentApi'
import { PayloadRequest, TaskConfig } from 'payload'

export const beginPostCreationConfig = {
  // This task is for initiating a single page conversion via the agent
  // backend.
  retries: 2,
  slug: 'beginPostCreation',
  inputSchema: [
    {
      name: 'documentId',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
  outputSchema: [
    {
      name: 'postCreationId',
      type: 'text',
      required: true,
    },
  ],
  // TODO: Move handler to a separate file
  // https://payloadcms.com/docs/jobs-queue/tasks#defining-tasks-in-the-config
  handler: async ({
    input,
    req,
  }: {
    input: { documentId: string; url: string }
    req: PayloadRequest
  }) => {
    const { documentId, url } = input

    const activeTaskCountForPage = await req.payload.count({
      collection: 'video-post-conversions',
      where: {
        postId: { equals: documentId },
        agentTaskStatus: { in: ['queued', 'running'] },
      },
    })

    if (activeTaskCountForPage.totalDocs > 0) {
      throw new Error(
        '[beginPostCreation] Cannot start a new conversion when an existing conversion is active.',
      )
    }

    // TODO: Don't hardcode
    const response = await agentApi.post('/posts/apply-youtube-transcript', {
      url,
      postId: documentId,
    })
    const { task_id: agentTaskId, task_status: agentTaskStatus } = response.data

    const postCreation = await req.payload.create({
      collection: 'video-post-conversions',
      data: {
        postId: documentId,
        agentTaskId,
        agentTaskStatus,
      },
    })

    return {
      output: { postCreationId: postCreation?.id },
    }
  },
  onFail: async () => {
    console.error("Job 'beginPostCreation' failed")
  },
  onSuccess: async () => {
    console.log("Job 'beginPostCreation' succeeded")
  },
} as TaskConfig<'beginPostCreation'>
