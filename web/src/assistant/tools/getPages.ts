import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const getPagesTool = tool({
  description: 'Gets all pages on the website',
  inputSchema: z.object({}),
  execute: async ({}) => {
    const payload = await getPayload({ config })
    // Tool execution logic
    const pages = await payload.find({
      collection: 'pages',
      limit: 30,
    })
    // Exclude content for listing
    return pages.docs.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt,
      createdAt: page.createdAt,
      _status: page._status,
    }))
  },
})
