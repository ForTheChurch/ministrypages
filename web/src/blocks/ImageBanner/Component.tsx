import RichText from '@/components/RichText'
import { hasText } from '@payloadcms/richtext-lexical/shared'
import React from 'react'

import type { ImageBanner as ImageBannerBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { CMSLink } from '../../components/Link'

export const ImageBannerBlock: React.FC<ImageBannerBlockProps> = (props) => {
  const { image, richText, links } = props

  return (
    <div className="relative flex items-center justify-center" data-theme="dark">
      <div className="container z-10 relative pt-16 text-center flex flex-col items-center justify-center">
        <div className="max-w-xl">
          {richText && hasText(richText) && (
            <RichText
              className="mb-6 prose-lg prose-invert"
              data={richText}
              enableGutter={false}
              removeMargins
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4 justify-center">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[90vh] select-none">
        {image && typeof image === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={image} />
        )}
        <div
          className={`absolute pointer-events-none left-0 bottom-0 w-full h-full ${
            image && typeof image !== 'string' && richText && hasText(richText)
              ? 'bg-gray-600 opacity-50'
              : ''
          }`}
        />
      </div>
    </div>
  )
}
