'use client'

import RichText from '@/components/RichText'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import type { TwoColumn as TwoColumnBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { useTheme } from '@/providers/Theme'
import { defaultTheme } from '@/providers/Theme/shared'
import { CMSLink } from '../../components/Link'

export const TwoColumnBlock: React.FC<TwoColumnBlockProps> = (props) => {
  const {
    imagePosition,
    imagePositionOnMobile,
    image,
    richText,
    centerTextOnMobile,
    enableLink,
    link,
    sectionColor,
    topPadding,
    bottomPadding,
  } = props
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before applying theme-dependent styles
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use defaultTheme when theme is undefined or not mounted yet to ensure SSR/client consistency
  const currentTheme = mounted ? theme || defaultTheme : defaultTheme

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
      <div className="container grid gap-8 md:gap-12 md:grid-cols-2 items-center">
        <div
          className={clsx('md:py-6', {
            'md:order-first': imagePosition === 'left',
            'md:order-last': imagePosition === 'right',
            'order-last': imagePositionOnMobile === 'bottom',
          })}
        >
          {image && <Media resource={image} />}
        </div>
        <div className={clsx({ 'text-center md:text-left': centerTextOnMobile })}>
          {richText && (
            <RichText
              data={richText}
              removeMargins
              enableGutter={false}
              className={
                sectionColor === 'dark' ? 'prose-invert prose-p:text-white' : 'prose-current'
              }
            />
          )}

          {enableLink && (
            <CMSLink
              {...link}
              className={clsx('mt-6', {
                'bg-primary-foreground text-primary hover:bg-muted':
                  sectionColor === 'dark' &&
                  link?.appearance === 'default' &&
                  currentTheme === 'light',
                'border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary':
                  sectionColor === 'dark' &&
                  link?.appearance === 'outline' &&
                  currentTheme === 'light',
              })}
            />
          )}
        </div>
      </div>
    </section>
  )
}
