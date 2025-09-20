export const formatEventDateTime = (
  startTime: string | null | undefined,
  endTime: string | null | undefined,
) => {
  if (!startTime) return null

  const startDate = new Date(startTime)
  const endDate = endTime ? new Date(endTime) : null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const startDateStr = formatDate(startDate)
  const startTimeStr = formatTime(startDate)

  if (endDate) {
    const endTimeStr = formatTime(endDate)
    return `${startDateStr} at ${startTimeStr} - ${endTimeStr}`
  }

  return `${startDateStr} at ${startTimeStr}`
}
