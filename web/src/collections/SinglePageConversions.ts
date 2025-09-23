import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { generatePreviewPath } from '../utilities/generatePreviewPath'

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
  },
  fields: [
    {
      name: 'pageId',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
    },
    {
      name: "agentTaskId",
      type: "text",
      required: true
    },
    {
      name: "agentTaskStatus",
      type: "text",
      required: true
    }
  ],
}
