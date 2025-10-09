import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
