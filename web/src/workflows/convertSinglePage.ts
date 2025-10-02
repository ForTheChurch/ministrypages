import { WorkflowConfig } from 'payload'

export const convertSinglePage = {
  slug: 'convertSinglePage',
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
    const taskIdConvertSinglePage = 'beginSinglePageConversion'
    const { singlePageConversionId } = await tasks.beginSinglePageConversion(
      taskIdConvertSinglePage,
      {
        input: {
          documentId: job.input.documentId,
          url: job.input.url,
        },
      },
    )

    // Wait on the task to complete
    const taskIdWaitForAgentTask = 'waitForAgentToConvertPage'
    await tasks.waitForAgentToConvertPage(taskIdWaitForAgentTask, {
      input: { singlePageConversionId },
    })
  },
} as WorkflowConfig<'convertSinglePage'>
