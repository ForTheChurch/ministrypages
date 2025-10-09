import type { Post, PostListBlock } from '@/payload-types'

import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { PostsList } from '@/components/PostList'

export const PostList: React.FC<
  PostListBlock & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      overrideAccess: false,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }
  const hasPosts = posts.length > 0
  return (
    <>
      {hasPosts && (
        <section className="py-28" id={`block-${id}`}>
          {introContent && (
            <div className="container mb-8">
              <RichText
                className="ms-0 max-w-3xl"
                data={introContent}
                removeMargins
                enableGutter={false}
              />
            </div>
          )}
          <PostsList posts={posts} />
        </section>
      )}
    </>
  )
}
