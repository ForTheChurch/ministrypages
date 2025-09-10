import RichText from '@/components/RichText'
import clsx from 'clsx'
import React from 'react'

import type { TwoColumn as TwoColumnBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Media } from '@/components/Media'

export const TwoColumnBlock: React.FC<TwoColumnBlockProps> = (props) => {
  const { imagePosition, image, richText, enableLink, link } = props

  return (
    <div className="container my-16 grid gap-12 lg:grid-cols-2 items-start">
      <div
        className={clsx('lg:py-6 lg:sticky top-12', { 'lg:order-last': imagePosition === 'right' })}
      >
        {image && <Media resource={image} />}
      </div>
      <div>
        {richText && <RichText data={richText} enableGutter={false} />}

        {enableLink && <CMSLink {...link} className="mt-4" />}
      </div>
    </div>
  )
}
