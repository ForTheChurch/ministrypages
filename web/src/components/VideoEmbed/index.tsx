import { cn } from '@/utilities/ui'
import React, { Suspense } from 'react'
import { VideoSkeleton } from '../VideoSkeleton'

export const VideoEmbed: React.FC<{
  className?: string
  videoLink: string | null | undefined
}> = (props) => {
  const classes = cn(props.className, 'w-full aspect-video')
  return (
    <>
      {props.videoLink && props.videoLink !== '' && (
        <Suspense fallback={<VideoSkeleton />}>
          <iframe
            src={props.videoLink}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="video"
            className={classes}
          />
        </Suspense>
      )}
    </>
  )
}
