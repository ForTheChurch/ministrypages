import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const createEventTool = tool({
  description: 'Creates an event',
  inputSchema: z.object({
    event: z.string().describe('The JSON event data to create'),
  }),
  execute: async ({ event }) => {
    const payload = await getPayload({ config })
    const newEvent = await payload.create({ collection: 'events', data: JSON.parse(event) })
    return {
      message: `<i>${newEvent.title}</i> created successfully`,
      eventId: newEvent.id,
    }
  },
})
