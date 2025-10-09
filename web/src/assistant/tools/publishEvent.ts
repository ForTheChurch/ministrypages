import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const publishEventTool = tool({
  description: 'Publishes an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to publish'),
  }),
  execute: async ({ eventId }) => {
    const payload = await getPayload({ config })
    const publishedEvent = await payload.update({
      collection: 'events',
      id: eventId,
      data: { _status: 'published' },
    })
    return { message: `<i>${publishedEvent.title}</i> published successfully` }
  },
})
