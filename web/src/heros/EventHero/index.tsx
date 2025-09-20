import React from 'react'

import type { Event } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatEventDateTime } from '@/utilities/formatEventDateAndTime'

export const EventHero: React.FC<{
  event: Event
}> = ({ event }) => {
  const { eventImage, title, startTime, endTime, location } = event

  return (
    <div className="relative -mt-[11rem] flex items-end">
      <div className="min-h-[60vh] select-none">
        {eventImage && typeof eventImage !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover" resource={eventImage} />
        )}
        <div
          className={`absolute pointer-events-none left-0 bottom-0 w-full h-full ${
            eventImage && typeof eventImage !== 'string' ? 'bg-gray-900 opacity-20' : ''
          }`}
        />
      </div>
      <div
        className={`container lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 opacity-100 ${
          eventImage && typeof eventImage !== 'string' ? 'text-white' : ''
        }`}
      >
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <div className="uppercase text-sm mb-4">Event</div>

          <div className="">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </div>

          {startTime && (
            <div className="mb-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm">Event Date & Time</p>
                <time dateTime={startTime} className="font-medium">
                  {formatEventDateTime(startTime, endTime)}
                </time>
              </div>
            </div>
          )}

          {location && (
            <div className="mb-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm">Location</p>
                <p className="font-medium">{location}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
