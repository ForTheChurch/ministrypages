import { getCachedGlobal } from '@/utilities/getGlobals'

import type { Logo as LogoType } from '@/payload-types'

import { Logo } from './Component'

interface ServerLogoProps {
  className?: string
}

export async function ServerLogo({ className }: ServerLogoProps) {
  let globalLogoData: LogoType | null = null

  try {
    globalLogoData = await getCachedGlobal('logo', 1)()
  } catch (error) {
    // Silently fail if global logo can't be loaded
    console.warn('Failed to load global logo data:', error)
  }

  return <Logo globalLogoData={globalLogoData} className={className} />
}
