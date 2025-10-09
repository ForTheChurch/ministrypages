import { tool } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { getFilename } from '@/utilities/tools'

export const uploadImageFromUrlTool = tool({
  description: 'Uploads an image from a URL to the Media collection',
  inputSchema: z.object({
    url: z.url().describe('The URL of the image to download'),
    alt: z.string().optional().describe('The alt text'),
  }),
  execute: async ({ url, alt }: { url: string; alt?: string }) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`)

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimetype = res.headers.get('content-type') || 'image/jpeg'
    const size = buffer.byteLength
    const filename = getFilename(res, url)

    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'media',
      data: {
        alt: alt || `Uploaded from ${url}`,
      },
      file: {
        data: buffer,
        mimetype,
        name: filename,
        size,
      },
    })

    return {
      id: doc.id,
      filename: doc.filename,
      url: doc.url,
    }
  },
})
