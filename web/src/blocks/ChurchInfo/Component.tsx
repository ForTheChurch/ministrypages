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
    case 'Service Times': {
      // Group service times by day
      const grouped: Record<string, string[]> = {}
      ;(church.serviceTimes ?? []).forEach((time) => {
        if (!time?.time || !time?.day) return
        const formattedTime = new Date(time.time).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
        if (!grouped[time.day]) grouped[time.day] = []
        ;(grouped[time.day] ?? []).push(formattedTime)
      })

      // Build formatted strings like "Sunday at 9:00 AM, 11:00 AM" for each day
      const dayStrings = Object.entries(grouped).map(([day, times]) => {
        if (times.length === 1) return `${day} at ${times[0]}`
        return `${day} at ${times.slice(0, -1).join(', ')}${times.length > 1 ? ',' : ''} and ${times[times.length - 1]}`
      })

      // Join all day strings with commas and "and" for the last one
      let formattedServiceTimes: string = ''
      if (dayStrings.length === 1) {
        formattedServiceTimes = dayStrings[0] ?? ''
      } else if (dayStrings.length > 1) {
        formattedServiceTimes = `${dayStrings.slice(0, -1).join(', ')} and ${dayStrings[dayStrings.length - 1]}`
      }

      return <>{formattedServiceTimes}</>
    }
    default:
      return null
  }
}
