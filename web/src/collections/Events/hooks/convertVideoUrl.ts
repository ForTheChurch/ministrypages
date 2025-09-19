import type { FieldHook } from 'payload'

/**
 * Converts YouTube and Vimeo URLs to their embeddable format
 */
export const convertVideoUrl: FieldHook = ({ value, siblingData }) => {
  if (!value || typeof value !== 'string') {
    return value
  }

  const url = value.trim()

  // YouTube URL conversions
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
  }

  // YouTube embed URL (already correct format)
  if (url.includes('youtube.com/embed/')) {
    return url
  }

  // Vimeo URL conversions
  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    if (videoId && /^\d+$/.test(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`
    }
  }

  // Vimeo embed URL (already correct format)
  if (url.includes('player.vimeo.com/video/')) {
    return url
  }

  // Return original URL if no conversion needed
  return url
}
