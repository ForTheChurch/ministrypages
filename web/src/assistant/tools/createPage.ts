import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { generatePreviewUrl } from '@/utilities/tools'

export const createPageTool = tool({
  description: 'Creates a page',
  inputSchema: z.object({
    page: z.string().describe('The JSON page content to create'),
  }),
  execute: async ({ page }) => {
    const payload = await getPayload({ config })
    const newPage = await payload.create({ collection: 'pages', data: JSON.parse(page) })
    return {
      message: `<i>${newPage.title}</i> page created successfully`,
      pageId: newPage.id,
      previewUrl: generatePreviewUrl(newPage),
    }
  },
})
