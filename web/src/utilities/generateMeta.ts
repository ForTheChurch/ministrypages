import type { Metadata } from 'next'

import type { Config, Event, Media, Page, Post } from '../payload-types'

import { getChurchData, getChurchImageUrl } from './getChurchData'
import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/images/hero.jpg'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Event> | null
}): Promise<Metadata> => {
  const { doc } = args

  // Get Church data for fallbacks
  const churchData = await getChurchData()
  const churchImageUrl = getChurchImageUrl(churchData)

  // Use page-specific image or fall back to Church image or default
  const ogImage = getImageURL(doc?.meta?.image) || churchImageUrl
  const churchName = churchData?.name || 'ForTheChurch'
  // Use page title or fall back to Church name or default
  const title = doc?.meta?.title
    ? `${doc.meta.title} | ${churchName}`
    : doc?.title
      ? `${doc.title} | ${churchName}`
      : churchName

  // Use page description or fall back to Church description
  const description = doc?.meta?.description || churchData?.description

  return {
    description,
    openGraph: await mergeOpenGraph({
      description: description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
