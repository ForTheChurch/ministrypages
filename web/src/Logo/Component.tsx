'use client'
import type { Logo as LogoType } from '@/payload-types'
import { useTheme } from '@/providers/Theme'
import React from 'react'

import { Logo as DefaultLogo } from '@/components/Logo'
import { Media } from '@/components/Media'

interface LogoProps {
  globalLogoData?: LogoType | null
  className?: string
  theme?: 'light' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({
  globalLogoData,
  className = '',
  theme: themeOverride,
}) => {
  const { theme: contextTheme } = useTheme()
  const theme = themeOverride || contextTheme

  // Get the appropriate logo based on theme
  const getLogo = () => {
    if (!globalLogoData) return null

    const currentTheme = theme || 'light'
    const themeLogo = currentTheme === 'dark' ? globalLogoData.darkLogo : globalLogoData.lightLogo

    return themeLogo || globalLogoData.lightLogo || globalLogoData.darkLogo
  }

  const logo = getLogo()
  return logo ? (
    <Media
      resource={logo}
      className={className}
      priority
      pictureClassName="h-full w-full"
      imgClassName="w-full h-full"
    />
  ) : (
    <DefaultLogo />
  )
}
