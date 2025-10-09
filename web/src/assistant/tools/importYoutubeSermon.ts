import { tool } from 'ai'
import { getPayload, RichTextField, TabsField } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { Posts } from '@/collections/Posts'
import { generatePublishedPostUrl } from '@/utilities/tools'
import { slugify } from '@/utilities/slugify'

export const importYoutubeSermonTool = tool({
  description: 'Imports a YouTube sermon',
  inputSchema: z.object({
    url: z.url().describe('The URL of the YouTube sermon to import'),
  }),
  execute: async ({ url }) => {
    const payload = await getPayload({ config })

    const tabField = Posts.fields.find((field) => field.type === 'tabs') as TabsField
    const tab = tabField.tabs[0]
    if (!tab) {
      throw new Error('Content tab not found')
    }
    const contentField = tab.fields.find(
      (field) => field.type === 'richText' && field.name === 'content',
    ) as RichTextField

    let post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Importing sermon...',
        videoLink: url,
        content: {
          root: convertMarkdownToLexical({
            editorConfig: editorConfigFactory.fromField({
              field: contentField,
            }),
            markdown: '## Importing sermon...',
          }).root,
        },
      },
    })

    const job = await payload.jobs.queue({
      workflow: 'createPostFromVideo',
      input: {
        documentId: post.id,
        url,
      },
    })

    const result = await payload.jobs.runByID({ id: job.id })
    if (Object.values(result.jobStatus || {}).some((status) => status.status !== 'success')) {
      throw new Error('Failed to import YouTube sermon')
    }

    post = await payload.findByID({ collection: 'posts', id: post.id })
    if (!post) {
      throw new Error('Post not found')
    }

    // Just publish it immediately for now and update the slug
    post = await payload.update({
      collection: 'posts',
      id: post.id,
      data: { _status: 'published', slug: slugify(post.title) },
    })

    return {
      message: `<i>${post.title}</i> sermon imported and published successfully from ${url}`,
      publishedUrl: generatePublishedPostUrl(post),
    }
  },
})
