import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'

export const VideoPostConversions: CollectionConfig = {
  slug: 'video-post-conversions',
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
      fields: ['postId', 'agentTaskId'],
    },
  ],
  fields: [
    {
      name: 'postId',
      type: 'relationship',
      relationTo: 'posts',
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
