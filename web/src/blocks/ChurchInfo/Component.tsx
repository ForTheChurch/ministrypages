'use client'

import type { ChurchInfo as ChurchInfoProps } from '@/payload-types'
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
    case 'Service Times':
      const serviceTimes = (church.serviceTimes ?? []).map((time) => {
        if (!time.time) {
          return null
        }
        const formattedTime = new Date(time?.time).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
        return `${time.day} ${formattedTime}`
      })

      // Format the service times with commas and "and"
      const formattedServiceTimes =
        (serviceTimes ?? []).length > 1
          ? `${serviceTimes.slice(0, -1).join(', ')} and ${serviceTimes[serviceTimes.length - 1]}`
          : serviceTimes[0]

      return <div>{formattedServiceTimes}</div>
    default:
      return null
  }
}
