import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { generatePreviewUrl, getPageSlug } from '@/utilities/tools'

export const importExternalWebPageTool = tool({
  description: 'Imports an external web page',
  inputSchema: z.object({
    url: z.url().describe('The URL of the web page to import'),
  }),
  execute: async ({ url }) => {
    const payload = await getPayload({ config })
    let newPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Importing page...',
        slug: getPageSlug(url),
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
        ],
        hero: {
          type: 'none',
        },
      },
    })

    const job = await payload.jobs.queue({
      workflow: 'convertSinglePage',
      input: {
        documentId: newPage.id,
        url,
      },
    })

    const result = await payload.jobs.runByID({ id: job.id })
    if (Object.values(result.jobStatus || {}).some((status) => status.status !== 'success')) {
      throw new Error('Failed to import external web page')
    }

    newPage = await payload.findByID({ collection: 'pages', id: newPage.id })
    if (!newPage) {
      throw new Error('Page not found')
    }
    return {
      message: `<i>${newPage.title}</i> page imported successfully from ${url}`,
      previewUrl: generatePreviewUrl(newPage),
    }
  },
})
