import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container grid lg:grid-cols-2 gap-8 -mt-16">
      <div className="lg:py-16 flex flex-col justify-center items-start gap-4">
        {richText && <RichText data={richText} hero enableGutter={false} />}

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
      <div className="order-first lg:order-last max-h-[50vh] lg:max-h-full h-full">
        {media && typeof media === 'object' && (
          <>
            <Media
              className="max-h-full overflow-hidden"
              imgClassName="object-cover"
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-2">
                <RichText data={media.caption} hero enableGutter={false} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
