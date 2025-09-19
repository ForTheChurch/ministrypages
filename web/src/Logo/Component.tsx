'use client'
import type { Logo as LogoType } from '@/payload-types'
import { useTheme } from '@/providers/Theme'
import React from 'react'

import { Media } from '@/components/Media'

interface LogoProps {
  globalLogoData?: LogoType | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({
  globalLogoData,
  className = '',
  size = 'md',
  theme: themeOverride,
}) => {
  const { theme: contextTheme } = useTheme()
  const theme = themeOverride || contextTheme

  // Size classes
  const sizeClasses = {
    sm: 'max-w-12',
    md: 'max-w-20',
    lg: 'max-w-32',
  }

  // Get the appropriate logo based on theme
  const getLogo = () => {
    if (!globalLogoData) return '/logo.png'

    const currentTheme = theme || 'light'
    const themeLogo = currentTheme === 'dark' ? globalLogoData.darkLogo : globalLogoData.lightLogo

    return themeLogo || globalLogoData.lightLogo || globalLogoData.darkLogo || '/logo.png'
  }

  const logo = getLogo()
  const finalClassName = `${sizeClasses[size]} ${className}`.trim()

  return <Media resource={logo} className={finalClassName} />
}
