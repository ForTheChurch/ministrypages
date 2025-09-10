'use client'
import { Post } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC<Post> = ({ heroImage }) => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    if (heroImage && typeof heroImage !== 'string') {
      setHeaderTheme('dark')
      return
    }
    setHeaderTheme('light')
  }, [setHeaderTheme, heroImage])
  return <React.Fragment />
}

export default PageClient
