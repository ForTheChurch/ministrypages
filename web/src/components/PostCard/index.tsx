'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { ArrowUpRight } from 'lucide-react'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'authors' | 'publishedAt'
>

export const PostCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, authors, publishedAt } = doc || {}
  const { description, image: metaImage } = meta || {}

  // List of fallback images
  const fallbackImages = [
    '/images/creation (1).jpg',
    '/images/creation (2).jpg',
    '/images/creation (3).jpg',
    '/images/creation (4).jpg',
    '/images/creation (5).jpg',
  ]
  // Pick a deterministic fallback image per card based on slug to avoid hydration mismatch
  const fallbackIndex = slug
    ? Math.abs([...slug].reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackImages.length
    : 0
  const randomFallbackImage = {
    src: fallbackImages[fallbackIndex] ?? '',
    width: 1000,
    height: 800,
  }

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Get first author
  const firstAuthor = authors && Array.isArray(authors) && authors.length > 0 ? authors[0] : null

  return (
    <article className={cn('flex flex-col gap-4', className)}>
      <Link href={href} className="overflow-hidden rounded-2xl" tabIndex={-1}>
        <div className="aspect-[1.5] w-full overflow-hidden">
          {metaImage && typeof metaImage === 'object' ? (
            <Media
              resource={metaImage}
              size="33vw"
              className="w-full h-full object-cover transition duration-100 ease-linear hover:scale-105"
            />
          ) : (
            <Media
              src={randomFallbackImage}
              size="33vw"
              alt={titleToUse || ''}
              className="w-full h-full object-cover transition duration-100 ease-linear hover:scale-105"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          {showCategories && hasCategories && (
            <span className="text-sm font-semibold text-brand-secondary">
              {categories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category
                  const categoryTitle = titleFromCategory || 'Untitled category'
                  const isLast = index === categories.length - 1

                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment>, </Fragment>}
                    </Fragment>
                  )
                }
                return null
              })}
            </span>
          )}

          <div className="flex flex-col gap-1">
            <Link
              href={href}
              className="group/title flex justify-between gap-x-4 rounded-md text-xl font-semibold text-primary outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {titleToUse}
              <ArrowUpRight />
            </Link>

            {sanitizedDescription && (
              <p className="line-clamp-2 text-md text-tertiary">{sanitizedDescription}</p>
            )}
          </div>
        </div>

        {(firstAuthor || publishedAt) && (
          <div className="flex gap-2">
            {firstAuthor && typeof firstAuthor === 'object' && (
              <>
                <Link href="#" tabIndex={-1} className="flex">
                  <div className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-avatar-bg group-outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2 outline-avatar-contrast-border size-10 outline-1 -outline-offset-1">
                    <div className="size-full rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                      {firstAuthor.name ? firstAuthor.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  </div>
                </Link>
                <div>
                  <Link
                    href="#"
                    className="block rounded-xs text-sm font-semibold text-primary outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {firstAuthor.name || 'Anonymous'}
                  </Link>
                  {publishedAt && (
                    <time className="block text-sm text-tertiary">{formatDate(publishedAt)}</time>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
