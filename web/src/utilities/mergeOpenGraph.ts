import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Learn about our church',
  images: [
    {
      url: `${getServerSideURL()}/images/hero.jpg`,
    },
  ],
  siteName: 'ForTheChurch',
  title: 'ForTheChurch',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
