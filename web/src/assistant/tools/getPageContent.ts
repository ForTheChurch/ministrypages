import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
