import agentApi from "@/utilities/agentApi"
import { TaskConfig } from "payload";
const beginSinglePgeConversion = {
  // This task is for initiating a single page conversion via the agent
  // backend.
  retries: 2,
  slug: 'beginSinglePageConversion',
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
      name: 'singlePageConversionId',
      type: 'text',
      required: true,
    },
  ],
  // TODO: Move handler to a separate file
  // https://payloadcms.com/docs/jobs-queue/tasks#defining-tasks-in-the-config
  handler: async ({
    input,
    job,
    req,
  }: {
    input: { documentId: string; url: string }
    job: any
    req: any
  }) => {
    const { documentId, url } = input

    const activeTaskCountForPage = await req.payload.count({
      collection: 'single-page-conversions',
      where: {
        pageId: { equals: documentId },
        agentTaskStatus: { in: ['queued', 'running'] },
      },
    })

    if (activeTaskCountForPage > 0) {
      throw new Error(
        '[beginSinglePageConversion] Cannot start a new conversion when an existing conversion is active.',
      )
    }

    const response = await agentApi.post('/pages/convert-single-page', {
      url,
      pageId: documentId,
    })
    const { task_id: agentTaskId, task_status: agentTaskStatus } = response.data

    const singlePageConversion = await req.payload.create({
      collection: 'single-page-conversions',
      data: {
        pageId: documentId,
        agentTaskId,
        agentTaskStatus,
      },
    })

    return {
      output: { singlePageConversionId: singlePageConversion?.id },
    }
  },
  onFail: async () => {
    console.error("Job 'beginSinglePageConversion' failed")
  },
  onSuccess: async () => {
    console.log("Job 'beginSinglePageConversion' succeeded")
  },
} as TaskConfig<'beginSinglePageConversion'>

export default beginSinglePgeConversion;
