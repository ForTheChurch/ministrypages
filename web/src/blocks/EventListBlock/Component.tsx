import type { Event, EventListBlock } from '@/payload-types'

import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { EventsList } from '@/components/EventList'

export const EventList: React.FC<
  EventListBlock & {
    id?: string
  }
> = async (props) => {
  const { id, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let events: Event[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const fetchedEvents = await payload.find({
      collection: 'events',
      depth: 1,
      draft: false,
      overrideAccess: false,
      limit,
    })

    events = fetchedEvents.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((event) => {
        if (typeof event.value === 'object') return event.value
      }) as Event[]

      events = filteredSelectedPosts
    }
  }
  const hasEvents = events.length > 0
  return (
    <>
      {hasEvents && (
        <div className="py-28" id={`block-${id}`}>
          {introContent && (
            <div className="container mb-8">
              <RichText
                className="ms-0 max-w-3xl"
                data={introContent}
                removeMargins
                enableGutter={false}
              />
            </div>
          )}
          <EventsList events={events} />
        </div>
      )}
    </>
  )
}
