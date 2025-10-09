'use client'

import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import React from 'react'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import clsx from 'clsx'
import { useTheme } from '@/providers/Theme'
import { defaultTheme } from '@/providers/Theme/shared'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, sectionColor, bottomPadding, topPadding } = props

  const { theme } = useTheme()

  // Use defaultTheme when theme is undefined to ensure SSR/client consistency
  const currentTheme = theme || defaultTheme

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <section
      className={clsx({
        'pt-28': topPadding === 'large' || !topPadding, // default to large
        'pt-10': topPadding === 'small',
        'pt-0': topPadding === 'none',
        'pb-28': bottomPadding === 'large' || !bottomPadding, // default to large
        'pb-10': bottomPadding === 'small',
        'pb-0': bottomPadding === 'none',
        'bg-accent text-card-foreground': sectionColor === 'accent' && currentTheme === 'light',
        'bg-secondary text-card-foreground':
          sectionColor === 'secondary' && currentTheme === 'light',
        'bg-primary text-primary-foreground': sectionColor === 'dark' && currentTheme === 'light',
      })}
    >
      <div className="container grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} className="mt-4" />}
              </div>
            )
          })}
      </div>
    </section>
  )
}
