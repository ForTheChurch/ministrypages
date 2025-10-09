'use client'

import { ChurchAddress } from '@/payload-types'
import { useChurch } from '@/providers/Church'

export const ChurchAddressBlock: React.FC<ChurchAddress> = (props) => {
  const { church } = useChurch()
  if (!church) return <>(Set your church information in the church global config)</>
  return (
    <div className="text-current">
      <div>{church.churchLocation?.address}</div>
      <div>{`${church.churchLocation?.city}, ${church.churchLocation?.state} ${church.churchLocation?.zip}`}</div>
    </div>
  )
}
