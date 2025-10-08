import { tool } from 'ai'
import path from 'path'
import { URL } from 'url'
import { getPayload, RichTextField, TabsField } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import { Posts } from '@/collections/Posts'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import { Header, Page, Post } from '@/payload-types'

// Define the tool
export const getPagesTool = tool({
  description: 'Gets all pages on the website',
  inputSchema: z.object({}),
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

function generatePreviewUrl(page: Page): string {
  const path = generatePreviewPath({
    slug: typeof page?.slug === 'string' ? page.slug : '',
    collection: 'pages',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: {} as any, // not used
  })
  return `${getServerSideURL()}${path}`
}

function generatePublishedUrl(page: Page): string {
  const slug = page.slug === 'home' ? '' : page.slug
  return `${getServerSideURL()}/${slug}`
}

function generatePublishedPostUrl(post: Post): string {
  return `${getServerSideURL()}/posts/${post.slug}`
}

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

export const updateChurchInfoTool = tool({
  description: 'Updates global church info',
  inputSchema: z.object({
    churchName: z.string().describe('The church name.'),
    churchDescription: z.string().max(255).describe('The meta description of the church.'),
  }),
  execute: async ({ churchName, churchDescription }) => {
    const payload = await getPayload({ config })
    await payload.updateGlobal({
      slug: 'church',
      data: {
        name: churchName,
        description: churchDescription,
      },
    })
    return {
      message: `<i>${churchName}</i> church info updated!`,
    }
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
    return {
      message: `<i>${newPage.title}</i> page created successfully`,
      pageId: newPage.id,
      previewUrl: generatePreviewUrl(newPage),
    }
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

export const getNavigationItemsTool = tool({
  description: 'Gets the top-level navigation items',
  inputSchema: z.object({}),
  execute: async ({}) => {
    const payload = await getPayload({ config })
    const header = await payload.findGlobal({ slug: 'header', depth: 2 })
    return {
      navItems: header.navItems,
    }
  },
})

export const addNavigationItemTool = tool({
  description: 'Adds a navigation item to the top-level navigation',
  inputSchema: z.object({
    pageId: z.string().describe('The page ID to add to the navigation'),
    position: z
      .number()
      .describe('The position to add the navigation item at. Zero is the first position.'),
  }),
  execute: async ({ pageId, position }) => {
    const payload = await getPayload({ config })
    const header = await payload.findGlobal({ slug: 'header', depth: 2 })

    if (position < 0 || position > (header.navItems || []).length) {
      throw new Error('Position is out of bounds')
    }

    const page = await payload.findByID({ collection: 'pages', id: pageId })
    if (!page) {
      throw new Error('Page not found')
    }

    const newItems = [...(header.navItems || [])]
    const newItem: NonNullable<Header['navItems']>[number] = {
      link: {
        type: 'reference',
        label: page.title,
        reference: {
          relationTo: 'pages',
          value: page.id,
        },
      },
    }

    newItems.splice(position, 0, newItem)

    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: newItems,
      },
    })

    return { message: `<i>${page.title}</i> added to navigation successfully` }
  },
})

export const removeNavigationItemTool = tool({
  description: 'Removes a navigation item from the top-level navigation',
  inputSchema: z.object({
    navItemId: z.string().describe('The navigation item ID to remove from the navigation'),
  }),
  execute: async ({ navItemId }) => {
    const payload = await getPayload({ config })
    const header = await payload.findGlobal({ slug: 'header', depth: 2 })
    const label = header.navItems?.find((item) => item.id === navItemId)?.link.label ?? 'Unknown'
    const newItems = header.navItems?.filter((item) => item.id !== navItemId)
    await payload.updateGlobal({
      slug: 'header',
      data: { navItems: newItems },
    })

    return { message: `<i>${label}</i> removed from navigation successfully` }
  },
})

export const createFormTool = tool({
  description: 'Creates a form',
  inputSchema: z.object({
    form: z.string().describe('The JSON form data to create'),
  }),
  execute: async ({ form }) => {
    const payload = await getPayload({ config })
    const newForm = await payload.create({ collection: 'forms', data: JSON.parse(form) })
    return {
      message: `<i>${newForm.title}</i> created successfully`,
      formId: newForm.id,
    }
  },
})

export const getEventsTool = tool({
  description: 'Gets all events',
  inputSchema: z.object({
    page: z.number().describe('The page number to get, starting at 1. The limit is 10 per page.'),
  }),
  execute: async ({ page }) => {
    const payload = await getPayload({ config })
    const events = await payload.find({ collection: 'events', limit: 10, page, sort: '-startTime' })
    return events.docs.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      publishedAt: event.publishedAt,
      updatedAt: event.updatedAt,
      createdAt: event.createdAt,
      _status: event._status,
    }))
  },
})

export const getEventContentTool = tool({
  description: 'Gets the content of an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to get the content of'),
  }),
  execute: async ({ eventId }) => {
    const payload = await getPayload({ config })
    const event = await payload.findByID({ collection: 'events', id: eventId })
    return event
  },
})

export const createEventTool = tool({
  description: 'Creates an event',
  inputSchema: z.object({
    event: z.string().describe('The JSON event data to create'),
  }),
  execute: async ({ event }) => {
    const payload = await getPayload({ config })
    const newEvent = await payload.create({ collection: 'events', data: JSON.parse(event) })
    return {
      message: `<i>${newEvent.title}</i> created successfully`,
      eventId: newEvent.id,
    }
  },
})

export const updateEventTool = tool({
  description: 'Updates an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to update'),
    event: z.string().describe('The JSON event data to update'),
  }),
  execute: async ({ eventId, event }) => {
    const payload = await getPayload({ config })
    const updatedEvent = await payload.update({
      collection: 'events',
      id: eventId,
      data: JSON.parse(event),
    })
    return { message: `<i>${updatedEvent.title}</i> updated successfully` }
  },
})

export const deleteEventTool = tool({
  description: 'Deletes an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to delete'),
  }),
  execute: async ({ eventId }) => {
    const payload = await getPayload({ config })
    const deletedEvent = await payload.delete({ collection: 'events', id: eventId })
    return { message: `<i>${deletedEvent.title}</i> deleted successfully` }
  },
})

export const publishEventTool = tool({
  description: 'Publishes an event',
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to publish'),
  }),
  execute: async ({ eventId }) => {
    const payload = await getPayload({ config })
    const publishedEvent = await payload.update({
      collection: 'events',
      id: eventId,
      data: { _status: 'published' },
    })
    return { message: `<i>${publishedEvent.title}</i> published successfully` }
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

function getFileExt(res: Response) {
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.split('/')[1]
  return ext
}

function getFilename(res: Response, imageUrl: string): string {
  // Try Content-Disposition
  const disposition = res.headers.get('content-disposition')
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/)
    if (match?.[1]) return match[1]
  }

  // Try URL path
  const ext = getFileExt(res) || '.jpg'
  try {
    const url = new URL(imageUrl)
    const base = path.basename(url.pathname)
    if (base && base.includes('.')) return base
    if (base && ext) return `${base}.${ext}`
  } catch {}

  // Fallback to extension from content-type
  return `downloaded.${ext}`
}

export const uploadImageFromUrlTool = tool({
  description: 'Uploads an image from a URL to the Media collection',
  inputSchema: z.object({
    url: z.url().describe('The URL of the image to download'),
    alt: z.string().optional().describe('The alt text'),
  }),
  execute: async ({ url, alt }: { url: string; alt?: string }) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`)

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimetype = res.headers.get('content-type') || 'image/jpeg'
    const size = buffer.byteLength
    const filename = getFilename(res, url)

    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'media',
      data: {
        alt: alt || `Uploaded from ${url}`,
      },
      file: {
        data: buffer,
        mimetype,
        name: filename,
        size,
      },
    })

    return {
      id: doc.id,
      filename: doc.filename,
      url: doc.url,
    }
  },
})

function getPageSlug(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.pathname === '/') {
      return 'home'
    }

    // Converts /about/ministries to about-ministries
    return parsedUrl.pathname
      .replace(/^\/|\/$/g, '') // Trim leading and trailing slashes
      .replace(/\//g, '-') // Replace all remaining slashes with hyphens
  } catch (error) {
    throw new Error(`Error parsing URL: ${error}`)
  }
}

function slugify(str: string): string {
  return str
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()
}

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
