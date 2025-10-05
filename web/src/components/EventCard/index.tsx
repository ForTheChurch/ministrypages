'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import React from 'react'

import { Media } from '@/components/Media'
import { Event } from '@/payload-types'
import { formatEventDateTime } from '@/utilities/formatEventDateAndTime'
import Link from 'next/link'

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
  const { link } = useClickableCard({})
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
    <Link href={href} ref={link.ref}>
      <article
        className={cn(
          'group relative overflow-hidden cursor-pointer bg-card rounded-lg shadow-xs transition-all duration-300',
          className,
        )}
      >
        {/* Image Section */}
        <div className="relative w-full h-48 overflow-hidden">
          {eventImage && typeof eventImage === 'object' ? (
            <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
              <Media resource={eventImage} size="33vw" />
            </div>
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <div className="text-muted-foreground text-4xl">📅</div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Date badge */}
          {dateInfo && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg p-3 text-center shadow-lg">
              <div className="text-sm font-bold leading-none">{dateInfo.day}</div>
              <div className="text-xs leading-none mt-1">{dateInfo.month}</div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          {titleToUse && (
            <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {titleToUse}
            </h3>
          )}

          {/* Date and Time */}
          {formatEventDateTime(startTime, endTime) && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{dateInfo?.time}</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="line-clamp-1">{location}</span>
            </div>
          )}

          {/* Description */}
          {sanitizedDescription && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {sanitizedDescription}
            </p>
          )}

          {/* Learn More Link */}
          <div className="flex items-center justify-between overflow-hidden">
            <span className="text-primary font-medium text-sm group-hover:underline">
              Learn More
            </span>
            <svg
              className="w-4 h-4 text-primary transform group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}
