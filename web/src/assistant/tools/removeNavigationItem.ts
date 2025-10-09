import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
