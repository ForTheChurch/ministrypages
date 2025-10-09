import path from 'path'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import { Page, Post } from '@/payload-types'

export function generatePreviewUrl(page: Page): string {
  const path = generatePreviewPath({
    slug: typeof page?.slug === 'string' ? page.slug : '',
    collection: 'pages',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: {} as any, // not used
  })
  return `${getServerSideURL()}${path}`
}

export function generatePublishedUrl(page: Page): string {
  const slug = page.slug === 'home' ? '' : page.slug
  return `${getServerSideURL()}/${slug}`
}

export function generatePublishedPostUrl(post: Post): string {
  return `${getServerSideURL()}/posts/${post.slug}`
}

export function getFileExt(res: Response) {
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.split('/')[1]
  return ext
}

export function getFilename(res: Response, imageUrl: string): string {
  // Try Content-Disposition
  const disposition = res.headers.get('content-disposition')
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/)
    if (match?.[1]) return match[1]
  }

  // Try URL path
  const ext = getFileExt(res) || '.jpg'
  try {
    const url = new URL(imageUrl)
    const base = path.basename(url.pathname)
    if (base && base.includes('.')) return base
    if (base && ext) return `${base}.${ext}`
  } catch {}

  // Fallback to extension from content-type
  return `downloaded.${ext}`
}

export function getPageSlug(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.pathname === '/') {
      return 'home'
    }

    // Converts /about/ministries to about-ministries
    return parsedUrl.pathname
      .replace(/^\/|\/$/g, '') // Trim leading and trailing slashes
      .replace(/\//g, '-') // Replace all remaining slashes with hyphens
  } catch (error) {
    throw new Error(`Error parsing URL: ${error}`)
  }
}
