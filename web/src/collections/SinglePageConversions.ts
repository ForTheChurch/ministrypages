import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const SinglePageConversions: CollectionConfig = {
  slug: 'single-page-conversions',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    useAsTitle: 'id',
    hidden: true,
  },
  indexes: [
    {
      unique: true,
      fields: ['pageId', 'agentTaskId'],
    },
  ],
  fields: [
    {
      name: 'pageId',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
    },
    {
      name: 'agentTaskId',
      type: 'text',
      required: true,
    },
    {
      name: 'agentTaskStatus',
      type: 'text',
      required: true,
    },
  ],
}
