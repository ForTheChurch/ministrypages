import { tool } from 'ai'
import { getPayload, RichTextField, TabsField } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { convertLexicalToMarkdown, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { Posts } from '@/collections/Posts'

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
    const newPage = await payload.update({
      collection: 'pages',
      id: pageId,
      data: JSON.parse(page),
    })
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
      data: { _status: 'published' },
    })
    return { message: `<i>${publishedPage.title}</i> page published successfully` }
  },
})

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
