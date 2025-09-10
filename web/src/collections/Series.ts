import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Series: CollectionConfig = {
  slug: 'series',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    ...slugField(),
  ],
}
