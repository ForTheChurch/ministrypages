import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container pb-16 md:py-16 grid lg:grid-cols-2 gap-8">
      <div className="lg:py-28 flex flex-col justify-center items-start gap-4">
        {richText && <RichText data={richText} removeMargins enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
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
      <div className="order-first lg:order-last max-h-[60vh] lg:max-h-full h-full overflow-hidden rounded-2xl">
        {media && typeof media === 'object' && (
          <>
            <Media
              className="h-full w-full"
              imgClassName="object-cover h-full w-full"
              pictureClassName="w-full h-full"
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-2">
                <RichText data={media.caption} removeMargins enableGutter={false} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
