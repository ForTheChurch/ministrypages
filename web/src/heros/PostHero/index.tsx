import React from 'react'
import { formatDateTime } from 'src/utilities/formatDateTime'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, publishedAt, title, series } = post

  return (
    <div className="relative -mt-[10.4rem] flex items-end">
      <div
        className={`container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 ${
          heroImage && typeof heroImage !== 'string' ? 'text-white' : ''
        }`}
      >
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <div className="uppercase text-sm mb-6">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'No Category Title'

                const isLast = index === categories.length - 1

                return (
                  <React.Fragment key={index}>
                    {titleToUse}
                    {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                  </React.Fragment>
                )
              }
              return null
            })}
          </div>

          <div className="">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </div>
          {series && typeof series === 'object' && series.title && (
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {series.title}
              </span>
            </div>
          )}

          {publishedAt && (
            <div className="flex flex-col gap-1">
              <p className="text-sm">Date published</p>

              <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
            </div>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover" resource={heroImage} />
        )}
        <div
          className={`absolute pointer-events-none left-0 bottom-0 w-full h-full ${
            heroImage && typeof heroImage !== 'string' ? 'bg-gray-400 opacity-50' : ''
          }`}
        />
      </div>
    </div>
  )
}
