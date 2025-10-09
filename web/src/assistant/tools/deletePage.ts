import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
