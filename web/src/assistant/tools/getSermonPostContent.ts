import { tool } from 'ai'
import { getPayload, RichTextField, TabsField } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { convertLexicalToMarkdown, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { Posts } from '@/collections/Posts'

export const getSermonPostContentTool = tool({
  description: 'Gets the content of a sermon post',
  inputSchema: z.object({
    postId: z.string().describe('The ID of the post to get the content of'),
  }),
  execute: async ({ postId }) => {
    const payload = await getPayload({ config })
    const post = await payload.findByID({ collection: 'posts', id: postId })
    const tabField = Posts.fields.find((field) => field.type === 'tabs') as TabsField
    const tab = tabField.tabs[0]
    if (!tab) {
      throw new Error('Content tab not found')
    }
    const contentField = tab.fields.find(
      (field) => field.type === 'richText' && field.name === 'content',
    ) as RichTextField

    const markdown = convertLexicalToMarkdown({
      data: post.content,
      editorConfig: editorConfigFactory.fromField({
        field: contentField,
      }),
    })
    return {
      id: post.id,
      title: post.title,
      content: markdown,
    }
  },
})
