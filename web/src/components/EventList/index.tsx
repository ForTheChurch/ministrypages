import { cn } from '@/utilities/ui'
import React from 'react'

import { CardEventData, EventCard } from '../EventCard'

export type Props = {
  events: CardEventData[]
}

export const EventsList: React.FC<Props> = (props) => {
  const { events } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {events?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div key={index}>
                  <EventCard className="h-full" doc={result} relationTo="events" />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
