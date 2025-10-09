import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const getEventContentTool = tool({
  description: 'Gets the content of an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to get the content of'),
  }),
  execute: async ({ eventId }) => {
    const payload = await getPayload({ config })
    const event = await payload.findByID({ collection: 'events', id: eventId })
    return event
  },
})
