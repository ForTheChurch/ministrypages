import type { Church } from '../payload-types'
import { getCachedGlobal } from './getGlobals'

/**
 * Fetches Church global data with caching
 * This provides the Church's branding information for use in meta tags and SEO
 */
export const getChurchData = async (): Promise<Church | null> => {
  try {
    const churchData = (await getCachedGlobal('church', 1)()) as Church
    return churchData
  } catch (error) {
    console.error('Failed to fetch Church data:', error)
    return null
  }
}

/**
 * Gets the Church's default image URL for social media sharing
 */
export const getChurchImageUrl = (churchData: Church | null): string | null => {
  if (!churchData?.image) return null

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  if (typeof churchData.image === 'object' && 'url' in churchData.image) {
    const ogUrl = churchData.image.sizes?.og?.url
    return ogUrl ? `${serverUrl}${ogUrl}` : `${serverUrl}${churchData.image.url}`
  }

  return null
}
