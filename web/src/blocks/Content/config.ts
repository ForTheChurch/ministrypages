import type { Block, Field, RichTextField } from 'payload'

import {
  convertMarkdownToLexical,
  editorConfigFactory,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
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
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
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
  ],
}
