import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { generatePublishedUrl } from '@/utilities/tools'

export const publishPageTool = tool({
  description: 'Publishes a page',
  inputSchema: z.object({
    pageId: z.string().describe('The ID of the page to publish'),
  }),
  execute: async ({ pageId }) => {
    const payload = await getPayload({ config })
    const publishedPage = await payload.update({
      collection: 'pages',
      id: pageId,
      data: {
        _status: 'published',
        publishedAt: new Date().toDateString(),
      },
    })
    return {
      message: `<i>${publishedPage.title}</i> page published successfully`,
      publishedUrl: generatePublishedUrl(publishedPage),
    }
  },
})
