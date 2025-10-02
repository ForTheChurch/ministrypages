import { Endpoint, PayloadRequest } from 'payload'

export const beginSinglePageConversion = {
  // This endpoint is for creating jobs via the REST API
  path: '/begin-single-page-conversion',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (typeof req.json !== 'function') {
      throw new Error('[/begin-single-page-conversion] Request has no JSON method')
    }

    const body = await req.json()
    const { task, workflow, data } = body
    const { documentId, url }: { documentId: string; url: string } = data

    if (task && workflow) {
      throw new Error('[/begin-single-page-conversion] Cannot queue both a task and a workflow')
    }

    const job = await req.payload.jobs.queue({
      task,
      workflow,
      input: {
        documentId,
        url,
      },
    })

    // Schedule the job to start asynchronously
    setImmediate(async () => {
      try {
        await req.payload.jobs.runByID({ id: job.id })
      } catch (error) {
        console.error(`[/begin-single-page-conversion] Job '${job.id}' failed:`, error)
      }
    })

    return Response.json(
      { message: `Job created. Job ID: ${job.id}, URL: ${url}` },
      { status: 201 },
    )
  },
} as Endpoint
