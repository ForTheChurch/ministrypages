import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

export const updateChurchInfoTool = tool({
  description: 'Updates global church info - only updates provided properties',
  inputSchema: z.object({
    name: z.string().optional().describe('The church name.'),
    description: z.string().max(255).optional().describe('The meta description of the church.'),
    givingLink: z
      .url()
      .describe('Add a link to where church members can financially support the church.'),
    image: z.string().optional().describe('The church image ID (media relation).'),
    serviceTimes: z
      .array(
        z.object({
          day: z.enum([
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ]),
          time: z
            .string()
            .describe(
              'Time in current timezone of user in string pass a full timestamp with the time.',
            ),
        }),
      )
      .optional()
      .describe('Array of service times for the church.'),
    churchLocation: z
      .object({
        address: z.string().optional().describe('Street address of the church.'),
        city: z.string().optional().describe('City where the church is located.'),
        state: z.string().optional().describe('State where the church is located.'),
        zip: z.string().optional().describe('ZIP code of the church.'),
      })
      .optional()
      .describe('Church location information.'),
    contactInformation: z
      .object({
        phone: z.string().optional().describe('Church phone number.'),
        email: z.string().optional().describe('Church email address.'),
      })
      .optional()
      .describe('Church contact information.'),
  }),
  execute: async (churchData) => {
    const payload = await getPayload({ config })

    await payload.updateGlobal({
      slug: 'church',
      data: churchData,
    })

    const updatedFields = Object.keys(churchData)
    return {
      message: `Church info updated! Updated fields: ${updatedFields.join(', ')}`,
    }
  },
})
