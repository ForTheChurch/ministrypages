'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
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

  return (
    <article
      className={cn('rounded-lg shadow-sm overflow-hidden bg-card hover:cursor-pointer', className)}
      ref={card.ref}
    >
      <div className="relative w-full max-h-48 overflow-hidden">
        {metaImage && typeof metaImage === 'object' ? (
          <Media resource={metaImage} size="33vw" />
        ) : (
          <Media src={randomFallbackImage} size="33vw" alt={titleToUse || ''} />
        )}
      </div>
      <div className="p-6">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            <div>
              {categories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category

                  const categoryTitle = titleFromCategory || 'Untitled category'

                  const isLast = index === categories.length - 1

                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment>, &nbsp;</Fragment>}
                    </Fragment>
                  )
                }

                return null
              })}
            </div>
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && <div className="mt-2">{description && <p>{sanitizedDescription}</p>}</div>}
      </div>
    </article>
  )
}
