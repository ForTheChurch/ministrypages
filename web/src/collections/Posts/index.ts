import type { CollectionConfig, RichTextField, TabsField } from 'payload'

import {
  BlocksFeature,
  convertMarkdownToLexical,
  editorConfigFactory,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { convertVideoUrl } from './hooks/convertVideoUrl'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import { ChurchInfo } from '@/blocks/ChurchInfo/config'
import { slugField } from '@/fields/slug'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { ChurchAddress } from '@/blocks/ChurchAddress/config'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'posts',
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'video',
              type: 'ui',
              label: 'Create post from video',
              admin: {
                components: {
                  Field: '@/components/PostCreator',
                },
              },
            },
            {
              name: 'videoLink',
              type: 'text',
              admin: {
                description:
                  "Here you can add a relevant video link of a sermon or talk. If a link is provided, we'll embed it on the post. You can paste any YouTube or Vimeo share link - it will be automatically converted to the embeddable format.",
              },
              validate: function (value: string | null | undefined) {
                if (!value) return true
                if (
                  value.match(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/) ||
                  value.match(/^https?:\/\/youtu\.be\/[\w-]+/) ||
                  value.match(/^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/) ||
                  value.match(/^https?:\/\/(www\.)?vimeo\.com\/\d+/) ||
                  value.match(/^https?:\/\/player\.vimeo\.com\/video\/\d+/)
                ) {
                  return true
                }
                return 'Only YouTube or Vimeo links are allowed.'
              },
              hooks: {
                beforeChange: [convertVideoUrl],
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({
                      blocks: [Banner, MediaBlock, ChurchAddress],
                      inlineBlocks: [ChurchInfo],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'series',
              type: 'relationship',
              relationTo: 'series',
              hasMany: false,
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    ...slugField(),
  ],
  endpoints: [
    {
      path: '/:id/content/markdown',
      method: 'post',
      handler: async (req) => {
        if (!authenticated({ req })) {
          return Response.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
        }

        const { id } = req.routeParams as { id: string }
        const data = await req.json?.()

        if (!data || typeof data.markdown !== 'string' || !data.markdown) {
          return Response.json(
            { errors: [{ message: 'No valid markdown provided' }] },
            { status: 400 },
          )
        }

        if (
          !data.videoLink ||
          !data.title ||
          typeof data.title !== 'string' ||
          typeof data.videoLink !== 'string'
        ) {
          return Response.json(
            { errors: [{ message: 'No valid video link or title provided' }] },
            { status: 400 },
          )
        }

        const post = await req.payload.findByID({
          id,
          collection: 'posts',
        })

        if (!post) {
          return Response.json({ errors: [{ message: 'Post not found' }] }, { status: 404 })
        }

        const tabField = Posts.fields.find((field) => field.type === 'tabs') as TabsField
        const tab = tabField.tabs[0]
        if (!tab) {
          return Response.json({ errors: [{ message: 'Content tab not found' }] }, { status: 500 })
        }

        const contentField = tab.fields.find(
          (field) => field.type === 'richText' && field.name === 'content',
        ) as RichTextField

        const lexicalJson = convertMarkdownToLexical({
          editorConfig: editorConfigFactory.fromField({
            field: contentField,
          }),
          markdown: data.markdown,
        })

        await req.payload.update({
          collection: 'posts',
          id: post.id,
          data: {
            content: {
              root: lexicalJson.root,
            },
            title: data.title,
            videoLink: data.videoLink,
          },
        })

        return Response.json({
          message: 'Post content converted to markdown',
        })
      },
    },
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1000, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
