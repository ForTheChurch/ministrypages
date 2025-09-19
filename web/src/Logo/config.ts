import type { GlobalConfig } from 'payload'

import { revalidateLogo } from './hooks/revalidateLogo'

export const Logo: GlobalConfig = {
  slug: 'logo',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'darkLogo',
      type: 'relationship',
      relationTo: 'media',
      hasMany: false,
    },
    {
      name: 'lightLogo',
      type: 'relationship',
      relationTo: 'media',
      hasMany: false,
    },
  ],
  hooks: {
    afterChange: [revalidateLogo],
  },
}
