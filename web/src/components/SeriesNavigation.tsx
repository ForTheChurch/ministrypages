import type { Post, Series } from '@/payload-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface SeriesNavigationProps {
  posts: Post[]
  currentSlug: string
  series?: Series
}

export const SeriesNavigation: React.FC<SeriesNavigationProps> = ({
  posts,
  currentSlug,
  series,
}) => {
  if (!posts || posts.length <= 1) return null

  const currentIndex = posts.findIndex((post) => post.slug === currentSlug)
  const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null

  return (
    <div className="mt-12 p-6 bg-card rounded-lg border">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex-1">
          {previousPost && (
            <Link
              href={`/posts/${previousPost.slug}`}
              className="group flex items-center gap-2 text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs">Previous</span>
                <span className="font-medium">{previousPost.title}</span>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-col md:items-center px-4">
          <span className="text-sm font-medium">
            {currentIndex + 1} of {posts.length}
          </span>
          {series && <span className="text-xs mb-1">In {series.title}</span>}
        </div>

        <div className="flex-1 flex justify-end">
          {nextPost && (
            <Link
              href={`/posts/${nextPost.slug}`}
              className="group flex items-center gap-2 text-sm transition-colors text-right"
            >
              <div className="flex flex-col">
                <span className="text-xs">Next</span>
                <span className="font-medium">{nextPost.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
