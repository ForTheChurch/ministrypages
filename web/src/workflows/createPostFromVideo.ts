import { WorkflowConfig } from 'payload'

export const createPostFromVideo = {
  slug: 'createPostFromVideo',
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
  handler: async ({ job, tasks }) => {
    // Begin the conversion and get a task ID
    const taskIdCreatePostFromVideo = 'beginPostCreation'
    const { postCreationId } = await tasks.beginPostCreation(taskIdCreatePostFromVideo, {
      input: {
        documentId: job.input.documentId,
        url: job.input.url,
      },
    })

    // Wait on the task to complete
    const taskIdWaitForAgentTask = 'waitForAgentToCreatePost'
    await tasks.waitForAgentToCreatePost(taskIdWaitForAgentTask, {
      input: { postCreationId },
    })
  },
} as WorkflowConfig<'createPostFromVideo'>
