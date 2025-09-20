import { cn } from '@/utilities/ui'
import React from 'react'

import { CardPostData, PostCard } from '@/components/PostCard'

export type Props = {
  posts: CardPostData[]
}

export const PostsList: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div key={index}>
                  <PostCard className="h-full" doc={result} relationTo="posts" showCategories />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
