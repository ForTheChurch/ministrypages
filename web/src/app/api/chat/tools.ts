import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

// Define the tool
export const getPagesTool = tool({
  description: 'Gets all pages on the website',
  inputSchema: z.object({
    // location: z.string().describe('City name or zip code'),
    // unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  execute: async ({}) => {
    const payload = await getPayload({ config })
    // Tool execution logic
    const pages = await payload.find({
      collection: 'pages',
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

export const getPageContentTool = tool({
  description: 'Gets the content of a page',
  inputSchema: z.object({
    pageId: z.string().describe('The ID of the page to get the content of'),
  }),
  execute: async ({ pageId }) => {
    const payload = await getPayload({ config })
    const page = await payload.findByID({ collection: 'pages', id: pageId })
    return page
  },
})

export const updatePageTool = tool({
  description: 'Updates a page',
  inputSchema: z.object({
    pageId: z.string().describe('The ID of the page to update'),
    page: z.string().describe('The JSON page content to update'),
  }),
  execute: async ({ pageId, page }) => {
    const payload = await getPayload({ config })
    await payload.update({ collection: 'pages', id: pageId, data: JSON.parse(page) })
    return { message: 'Page updated successfully' }
  },
})

