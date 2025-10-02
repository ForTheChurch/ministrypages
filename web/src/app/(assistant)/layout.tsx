import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getChurchData } from '@/utilities/getChurchData'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { getServerSideURL } from '@/utilities/getURL'
import '../(frontend)/globals.css'

export default async function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const churchData = await getChurchData()

  return {
    metadataBase: new URL(getServerSideURL()),
    title: churchData?.name || 'ForTheChurch',
    description: churchData?.description || 'Learn about our church',
    openGraph: await mergeOpenGraph(),
  }
}

