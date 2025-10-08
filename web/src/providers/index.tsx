import React from 'react'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { ChurchProvider } from './Church'
import type { Church } from '@/payload-types'
import { getChurchData } from '@/utilities/getChurchData'

type ProvidersProps = {
  children: React.ReactNode
}

export const Providers = async ({ children }: ProvidersProps) => {
  const church: Church | null = await getChurchData()

  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <ChurchProvider initialChurch={church}>{children}</ChurchProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
