import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const searchSermonPostsTool = tool({
  description: 'Searches for sermon posts',
  inputSchema: z.object({
    query: z.string().describe('The query to search for'),
  }),
  execute: async ({ query }) => {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      where: {
        or: [{ title: { like: query } }, { content: { like: query } }],
      },
      limit: 3,
    })
    return posts.docs.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
    }))
  },
})
