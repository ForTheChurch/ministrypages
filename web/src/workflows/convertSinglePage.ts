import { WorkflowConfig } from "payload"

const convertSinglePage = {
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
    const taskIdConvertSinglePage = '1'
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
    const taskIdWaitForAgentTask = '2'
    const { status } = await tasks.waitForAgentTask(taskIdWaitForAgentTask, {
      input: { singlePageConversionId },
    })
  },
} as WorkflowConfig<'convertSinglePage'>

export default convertSinglePage
