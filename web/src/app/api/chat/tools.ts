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
    const newPage = await payload.update({ collection: 'pages', id: pageId, data: JSON.parse(page) })
    return { message: `<i>${newPage.title}</i> page updated successfully` }
  },
})

export const createPageTool = tool({
  description: 'Creates a page',
  inputSchema: z.object({
    page: z.string().describe('The JSON page content to create'),
  }),
  execute: async ({ page }) => {
    const payload = await getPayload({ config })
    const newPage = await payload.create({ collection: 'pages', data: JSON.parse(page) })
    return { message: `<i>${newPage.title}</i> page created successfully`, pageId: newPage.id }
  },
})

export const deletePageTool = tool({
  description: 'Deletes a page',
  inputSchema: z.object({
    pageId: z.string().describe('The ID of the page to delete'),
  }),
  execute: async ({ pageId }) => {
    const payload = await getPayload({ config })
    const deletedPage = await payload.delete({ collection: 'pages', id: pageId })
    return { message: `<i>${deletedPage.title}</i> page deleted successfully` }
  },
})
