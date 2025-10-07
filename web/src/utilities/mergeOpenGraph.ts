import type { Metadata } from 'next'
import { getChurchData, getChurchImageUrl } from './getChurchData'
import { getServerSideURL } from './getURL'

const getDefaultOpenGraph = async (): Promise<Metadata['openGraph']> => {
  const churchData = await getChurchData()
  const churchImageUrl = getChurchImageUrl(churchData)

  return {
    type: 'website',
    description: churchData?.description || 'Learn about our church',
    images: churchImageUrl
      ? [{ url: churchImageUrl }]
      : [{ url: `${getServerSideURL()}/images/hero.jpg` }],
    siteName: churchData?.name || 'MinistryPages',
    title: churchData?.name || 'MinistryPages',
  }
}

export const mergeOpenGraph = async (
  og?: Metadata['openGraph'],
): Promise<Metadata['openGraph']> => {
  const defaultOpenGraph = await getDefaultOpenGraph()

  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph?.images,
  }
}
