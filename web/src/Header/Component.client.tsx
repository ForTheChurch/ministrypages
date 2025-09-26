'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Logo as LogoType } from '@/payload-types'

import { Logo } from '@/Logo/Component'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  header: Header
  logo: LogoType
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ logo, header }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between items-center">
        <Link href="/" className="text-current z-10">
          <Logo globalLogoData={logo} theme={theme as 'light' | 'dark'} className="h-16" />
        </Link>
        <HeaderNav data={header} />
      </div>
    </header>
  )
}
