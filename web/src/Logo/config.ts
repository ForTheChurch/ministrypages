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
      admin: {
        description:
          'Add a logo that will be displayed when the site is rendered in dark mode, or when the header has an image.',
      },
      type: 'relationship',
      relationTo: 'media',
      hasMany: false,
    },
    {
      name: 'lightLogo',
      admin: {
        description:
          'Add a logo that will be displayed when your site is rendering in light mode, and in the header when no image is added.',
      },
      type: 'relationship',
      relationTo: 'media',
      hasMany: false,
    },
  ],
  hooks: {
    afterChange: [revalidateLogo],
  },
}
