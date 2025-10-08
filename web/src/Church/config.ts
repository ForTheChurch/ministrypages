import type { GlobalConfig } from 'payload'

import { revalidateSite } from './hooks/revalidateSite'

export const Church: GlobalConfig = {
  slug: 'church',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Enter the name of your church.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description:
          "Upload an image of your church. This will be displayed by default on social media sharing when a page doesn't have an image.",
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description:
          'Add a general description of your church that you want to display in search engine results.',
      },
    },
    {
      name: 'serviceTimes',
      type: 'array',
      admin: {
        description: 'Add the service times for your church.',
      },
      fields: [
        {
          name: 'day',
          type: 'select',
          options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        {
          name: 'time',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
              timeIntervals: 15,
            },
          },
        },
      ],
    },
    {
      name: 'churchLocation',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
          required: true,
          admin: {
            description: 'Add the street address of where you have Sunday services.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'city',
              type: 'text',
              required: true,
            },
            {
              name: 'state',
              type: 'text',
              required: true,
            },
            {
              name: 'zip',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'contactInformation',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'email',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSite],
  },
}
