import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { generatePreviewUrl } from '@/utilities/tools'

export const updatePageTool = tool({
  description: 'Updates a page',
  inputSchema: z.object({
    pageId: z.string().describe('The ID of the page to update'),
    page: z.string().describe('The JSON page content to update'),
  }),
  execute: async ({ pageId, page }) => {
    const payload = await getPayload({ config })
    const newPage = await payload.update({
      collection: 'pages',
      id: pageId,
      data: JSON.parse(page),
    })
    return {
      message: `<i>${newPage.title}</i> page updated successfully`,
      previewUrl: generatePreviewUrl(newPage),
    }
  },
})
