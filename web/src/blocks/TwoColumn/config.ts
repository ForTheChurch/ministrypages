import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

export const TwoColumn: Block = {
  slug: 'twoColumn',
  interfaceName: 'TwoColumn',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      hasMany: false,
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        {
          label: 'Left',
          value: 'left',
        },
        {
          label: 'Right',
          value: 'right',
        },
      ],
      admin: {
        description: 'Choose where the image should be on larger screens.',
      },
    },
    {
      name: 'imagePositionOnMobile',
      type: 'select',
      defaultValue: 'top',
      options: [
        {
          label: 'Top',
          value: 'top',
        },
        {
          label: 'Bottom',
          value: 'bottom',
        },
      ],
      admin: {
        description: 'Choose where the image should be on mobile screens.',
      },
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    {
      name: 'centerTextOnMobile',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Center the text on mobile screens.',
      },
    },
    {
      name: 'sectionColor',
      type: 'select',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Accent',
          value: 'accent',
        },
        {
          label: 'Secondary',
          value: 'secondary',
        },
        {
          label: 'Dark',
          value: 'dark',
        },
      ],
    },
    {
      name: 'enableLink',
      type: 'checkbox',
    },
    link({
      overrides: {
        admin: {
          condition: (_data, siblingData) => {
            return Boolean(siblingData?.enableLink)
          },
        },
      },
    }),
  ],
}
