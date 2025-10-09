import React from 'react'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedInlineBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  RichText as ConvertRichText,
  JSXConvertersFunction,
  LinkJSXConverter,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'

import { ChurchInfo } from '@/blocks/ChurchInfo/Component'
import type {
  BannerBlock as BannerBlockProps,
  ChurchInfo as ChurchInfoProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  ChurchAddress as ChurchAddressBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'

import { ChurchAddressBlock } from '@/blocks/ChurchAddress/Component'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<
      CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps | ChurchAddressBlockProps
    >
  | SerializedInlineBlockNode<ChurchInfoProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => {
  const knownBlocks = {
    banner: ({ node }: { node: SerializedBlockNode<BannerBlockProps> }) => (
      <BannerBlock className="col-start-2 mb-4" {...node.fields} />
    ),
    mediaBlock: ({ node }: { node: SerializedBlockNode<MediaBlockProps> }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-3xl"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }: { node: SerializedBlockNode<CodeBlockProps> }) => (
      <CodeBlock className="col-start-2" {...node.fields} />
    ),
    cta: ({ node }: { node: SerializedBlockNode<CTABlockProps> }) => (
      <CallToActionBlock {...node.fields} />
    ),
    churchAddress: ({ node }: { node: SerializedBlockNode<ChurchAddressBlockProps> }) => (
      <ChurchAddressBlock {...node.fields} />
    ),
  } as const

  const knownInlineBlocks = {
    churchInfo: ({ node }: { node: SerializedInlineBlockNode<ChurchInfoProps> }) => (
      <ChurchInfo {...node.fields} />
    ),
  } as const

  const blocksProxy = new Proxy(knownBlocks, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target]
      }

      // Return nothing if the block is not found.
      return () => null
    },
  })

  const inlineBlocksProxy = new Proxy(knownInlineBlocks, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target]
      }
      //return nothing if the block is not found.
      return () => null
    },
  })

  return {
    ...defaultConverters,
    ...LinkJSXConverter({ internalDocToHref }),
    blocks: blocksProxy,
    inlineBlocks: inlineBlocksProxy,
  }
}

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  removeMargins?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const {
    className,
    enableProse = true,
    enableGutter = true,
    removeMargins = false,
    ...rest
  } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'break-words',
        {
          '*:my-1': removeMargins,
          container: enableGutter,
          'max-w-none': !enableGutter,
          'prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
