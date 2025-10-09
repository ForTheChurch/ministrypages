import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
