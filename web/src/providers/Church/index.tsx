'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Church } from '@/payload-types'

type ChurchContextType = {
  church: Church | null
  setChurch: React.Dispatch<React.SetStateAction<Church | null>>
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined)

export function ChurchProvider({
  initialChurch,
  children,
}: {
  initialChurch: Church | null
  children: React.ReactNode
}) {
  const [church, setChurch] = useState<Church | null>(initialChurch)
  return <ChurchContext.Provider value={{ church, setChurch }}>{children}</ChurchContext.Provider>
}

export function useChurch() {
  const ctx = useContext(ChurchContext)
  if (!ctx) throw new Error('useChurch must be used within a ChurchProvider')
  return ctx
}
