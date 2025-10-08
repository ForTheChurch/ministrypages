'use client'

import React, { useEffect, useState } from 'react'

import type { Church, ChurchInfo as ChurchInfoProps } from '@/payload-types'
import { useChurch } from '@/providers/Church'

export const ChurchInfo: React.FC<ChurchInfoProps> = ({ content }) => {
  const { church } = useChurch()
  if (!church) return <>(Set your church information in the church global config)</>

  switch (content) {
    case 'Description':
      return <>{church.description}</>
    case 'Name':
      return <>{church.name}</>
    case 'Phone':
      return <>{church.contactInformation?.phone}</>
    case 'Email':
      return <>{church.contactInformation?.email}</>
    default:
      return null
  }
}
