import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container py-16">
      <div className="bg-gradient-to-br from-muted/40 to-muted/20 dark:from-card dark:to-muted rounded-2xl border border-border/50 p-8 md:p-12 lg:p-16">
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="flex-1 max-w-3xl">
            {richText && (
              <RichText
                data={richText}
                enableGutter={false}
                removeMargins
                className="prose-p:text-lg"
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6 lg:min-w-0 lg:shrink-0">
            {(links || []).map(({ link }, i) => {
              return (
                <div key={i} className="group/cta">
                  <CMSLink key={i} {...link} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
