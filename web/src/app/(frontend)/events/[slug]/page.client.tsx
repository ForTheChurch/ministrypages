'use client'
import { Event } from '@/payload-types'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC<Event> = ({ eventImage }) => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    if (eventImage && typeof eventImage !== 'string') {
      setHeaderTheme('dark')
      return
    }
    setHeaderTheme('light')
  }, [setHeaderTheme, eventImage])
  return <React.Fragment />
}

export default PageClient
