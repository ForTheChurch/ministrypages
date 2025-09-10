import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { SeriesNavigation } from '@/components/SeriesNavigation'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PostHero } from '@/heros/PostHero'
import { Series } from '@/payload-types'
import { formatAuthors } from '@/utilities/formatAuthors'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />
  const { populatedAuthors, series } = post
  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const hasSeries = series && typeof series === 'object'

  const posts = await queryPostBySeries(series)

  return (
    <article className="pt-16 pb-16">
      <PageClient {...post} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <div className="max-w-[48rem] mx-auto grid gap-6">
            <RichText data={post.content} enableGutter={false} />
            {hasSeries && (
              <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{series.title}</h3>
                  {series.description && <p className="text-sm">{series.description}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Publicaciones de esta serie:</p>
                  <div className="flex flex-col gap-1">
                    {posts?.map((seriesPost, index) => {
                      const isCurrentPost = seriesPost.slug === slug
                      return (
                        <Link
                          key={seriesPost.id || index}
                          href={`/posts/${seriesPost.slug}`}
                          className={`text-sm -mx-2 px-3 py-2 rounded transition-colors ${
                            isCurrentPost
                              ? 'bg-blue-100 font-medium text-blue-900'
                              : 'hover:bg-blue-100 hover:text-blue-900'
                          }`}
                        >
                          {seriesPost.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-4">
              {hasAuthors && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm">By</p>
                  <p className="text-sm">{formatAuthors(populatedAuthors)}</p>
                </div>
              )}
            </div>
          </div>

          {hasSeries && posts && posts.length > 1 && (
            <SeriesNavigation posts={posts} currentSlug={slug} series={series} />
          )}

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryPostBySeries = cache(async (series: string | Series | undefined | null) => {
  if (!series) return []
  if (typeof series === 'string') return []

  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    draft,
    pagination: false,
    where: {
      'series.id': {
        equals: series.id,
      },
    },
    sort: 'createdAt',
  })

  return posts.docs || []
})
