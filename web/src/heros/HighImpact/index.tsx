'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    if (media && typeof media === 'object') {
      setHeaderTheme('dark')
    }
  })

  return (
    <div
      className="relative -mt-[11rem] flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container z-10 relative pt-16">
        <div>
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} hero />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
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
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
        <div
          className={`absolute pointer-events-none left-0 bottom-0 w-full h-full ${
            media && typeof media !== 'string' ? 'bg-gray-600 opacity-50' : ''
          }`}
        />
      </div>
    </div>
  )
}
