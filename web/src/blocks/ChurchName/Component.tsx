'use server'
import React from 'react'

import type { ChurchName as ChurchNameProps } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

export const ChurchName: React.FC<ChurchNameProps> = async () => {
  const payload = await getPayload({ config })

  const { name } = await payload.findGlobal({ slug: 'church' })

  return <>{name}</>
}
