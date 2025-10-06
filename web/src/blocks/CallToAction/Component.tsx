import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { ArrowUpRight } from 'lucide-react'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container py-16">
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border/50 p-8 md:p-12 lg:p-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex-1 max-w-3xl">
            {richText && (
              <RichText
                className="mb-0 [&>*:first-child]:text-2xl md:[&>*:first-child]:text-3xl lg:[&>*:first-child]:text-4xl [&>*:first-child]:font-bold [&>*:first-child]:text-primary [&>*:first-child]:mb-4 [&>*:last-child]:text-lg [&>*:last-child]:text-tertiary [&>*:last-child]:mb-0"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6 lg:min-w-0 lg:shrink-0">
            {(links || []).map(({ link }, i) => {
              return (
                <div key={i} className="group/cta">
                  <CMSLink
                    key={i}
                    size="lg"
                    {...link}
                    className="relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-2 min-w-[160px] group-hover/cta:scale-105"
                  >
                    {link?.label}
                    <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
                  </CMSLink>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
