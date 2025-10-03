'use server'
import React from 'react'

import type { ChurchInfo as ChurchInfoProps } from '@/payload-types'
import config from '@payload-config'
import { getPayload } from 'payload'

export const ChurchInfo: React.FC<ChurchInfoProps> = async (props) => {
  const payload = await getPayload({ config })

  const churchInfo = await payload.findGlobal({ slug: 'church' })

  return (
    <>
      {props.content === 'Description' && churchInfo?.description}
      {props.content === 'Name' && churchInfo?.name}
      {props.content === 'Phone' && churchInfo?.contactInformation?.phone}
      {props.content === 'Email' && churchInfo?.contactInformation?.email}
    </>
  )
}
