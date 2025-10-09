import type { Block } from 'payload'

export const ChurchInfo: Block = {
  slug: 'churchInfo',
  interfaceName: 'Church Info',
  fields: [
    {
      name: 'content',
      type: 'select',
      options: ['Name', 'Description', 'Phone', 'Email'],
      defaultValue: 'Name',
      required: true,
    },
  ],
}
