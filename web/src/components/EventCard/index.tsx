'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Event } from '@/payload-types'

import { Media } from '@/components/Media'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'
import { formatEventDateTime } from '@/utilities/formatEventDateAndTime'

export type CardEventData = Pick<
  Event,
  'slug' | 'meta' | 'title' | 'eventImage' | 'startTime' | 'endTime' | 'location'
>

export const EventCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardEventData
  relationTo?: 'events'
  title?: string
}> = (props) => {
  const { className, doc, relationTo, title: titleFromProps } = props

  const { slug, meta, title, eventImage, startTime, endTime, location } = doc || {}
  const { description } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  // Format date for display
  const formatDateForCard = (startTime: string | null | undefined) => {
    if (!startTime) return null
    const date = new Date(startTime)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }
  }

  const dateInfo = formatDateForCard(startTime)

  return (
    <Link href={href} className="block">
      <article className={cn('flex flex-col gap-4 group/card cursor-pointer', className)}>
        <div className="overflow-hidden rounded-2xl relative">
          <div className="aspect-[1.5] w-full overflow-hidden">
            {eventImage && typeof eventImage === 'object' ? (
              <Media
                resource={eventImage}
                size="33vw"
                className="w-full h-full object-cover transition duration-200 ease-in-out group-hover/card:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition duration-200 ease-in-out group-hover/card:scale-105">
                <div className="text-muted-foreground text-6xl">📅</div>
              </div>
            )}
          </div>

          {/* Date badge overlay */}
          {dateInfo && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-center shadow-lg">
              <div className="text-lg font-bold leading-none">{dateInfo.day}</div>
              <div className="text-xs leading-none mt-1">{dateInfo.month}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {/* Event time and location info */}
            <div className="flex flex-col gap-1 text-sm text-brand-secondary font-semibold">
              {dateInfo && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatEventDateTime(startTime, endTime)}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between gap-x-4 rounded-md text-xl font-semibold text-primary">
                {titleToUse}
                <ArrowUpRight className="transition-transform duration-200 ease-out group-hover/card:translate-x-1 group-hover/card:-translate-y-1" />
              </div>

              {sanitizedDescription && (
                <p className="line-clamp-2 text-md text-tertiary">{sanitizedDescription}</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
