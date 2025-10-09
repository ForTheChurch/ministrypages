import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { Header } from '@/payload-types'

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
