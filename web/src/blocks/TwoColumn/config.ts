import type { Block, RichTextField } from 'payload'

import {
  convertMarkdownToLexical,
  editorConfigFactory,
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
      name: 'markdown',
      type: 'textarea',
      label: 'Markdown Source',
      hidden: true,
      hooks: {
        beforeChange: [
          () => {
            return '' // don't save the markdown value
          },
        ],
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
      hooks: {
        beforeValidate: [
          ({ value, siblingData, siblingFields }) => {
            const { markdown } = siblingData
            if (markdown) {
              return {
                root: convertMarkdownToLexical({
                  editorConfig: editorConfigFactory.fromField({
                    field: siblingFields.find(
                      (f) => f.type === 'richText' && f.name === 'richText',
                    ) as RichTextField,
                  }),
                  markdown,
                }).root,
              }
            }
            return value
          },
        ],
      },
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
      name: 'topPadding',
      type: 'select',
      options: [
        {
          label: 'Large',
          value: 'large',
        },
        {
          label: 'Small',
          value: 'small',
        },
        {
          label: 'None',
          value: 'none',
        },
      ],
    },
    {
      name: 'bottomPadding',
      type: 'select',
      options: [
        {
          label: 'Large',
          value: 'large',
        },
        {
          label: 'Small',
          value: 'small',
        },
        {
          label: 'None',
          value: 'none',
        },
      ],
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
