import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const getEventsTool = tool({
  description: 'Gets all events',
  inputSchema: z.object({
    page: z.number().describe('The page number to get, starting at 1. The limit is 10 per page.'),
  }),
  execute: async ({ page }) => {
    const payload = await getPayload({ config })
    const events = await payload.find({ collection: 'events', limit: 10, page, sort: '-startTime' })
    return events.docs.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      publishedAt: event.publishedAt,
      updatedAt: event.updatedAt,
      createdAt: event.createdAt,
      _status: event._status,
    }))
  },
})
