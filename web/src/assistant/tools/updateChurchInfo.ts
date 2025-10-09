import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
