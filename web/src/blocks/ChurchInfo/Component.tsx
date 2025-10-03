'use client'

import React, { useEffect, useState } from 'react'

import type { Church, ChurchInfo as ChurchInfoProps } from '@/payload-types'

export const ChurchInfo: React.FC<ChurchInfoProps> = ({ content }) => {
  const [churchInfo, setChurchInfo] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChurchInfo = async () => {
      try {
        const response = await fetch('/api/globals/church?draft=false&depth=2')
        if (!response.ok) {
          throw new Error('Failed to fetch church info')
        }
        const data = await response.json()
        setChurchInfo(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load church info')
      } finally {
        setLoading(false)
      }
    }

    fetchChurchInfo()
  }, [])

  if (loading) return <span>...</span>
  if (error) return <span>{error}</span>
  if (!churchInfo) return <span>No church info found.</span>

  switch (content) {
    case 'Description':
      return <>{churchInfo.description}</>
    case 'Name':
      return <>{churchInfo.name}</>
    case 'Phone':
      return <>{churchInfo.contactInformation?.phone}</>
    case 'Email':
      return <>{churchInfo.contactInformation?.email}</>
    default:
      return null
  }
}
