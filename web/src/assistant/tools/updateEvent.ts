import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const updateEventTool = tool({
  description: 'Updates an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to update'),
    event: z.string().describe('The JSON event data to update'),
  }),
  execute: async ({ eventId, event }) => {
    const payload = await getPayload({ config })
    const updatedEvent = await payload.update({
      collection: 'events',
      id: eventId,
      data: JSON.parse(event),
    })
    return { message: `<i>${updatedEvent.title}</i> updated successfully` }
  },
})
