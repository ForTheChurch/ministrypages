import type { Metadata } from 'next/types'

import { EventsList } from '@/components/EventList'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getChurchData } from '@/utilities/getChurchData'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import PageClient from './page.client'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      meta: true,
      eventImage: true,
      startTime: true,
      endTime: true,
      location: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Events</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="events"
          currentPage={events.page}
          limit={12}
          totalDocs={events.totalDocs}
        />
      </div>

      <EventsList events={events.docs} />

      <div className="container">
        {events.totalPages > 1 && events.page && (
          <Pagination page={events.page} totalPages={events.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const churchData = await getChurchData()
  const churchName = churchData?.name || 'ForTheChurch'

  return {
    title: `Events`,
    description: `View events at ${churchName}`,
  }
}
