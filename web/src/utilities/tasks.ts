export const getLabelAsString = (label?: Record<string, string> | string) => {
  return typeof label === 'string' ? label : ''
}

export const reloadPage = () => {
  window.location.reload()
}

export const navigate = (url: string) => {
  window.location.href = url
}

export const getStatusClass = (status: string): string => {
  switch (status) {
    case 'queued':
      return 'convert-status-queued'
    case 'running':
      return 'convert-status-running'
    case 'completed':
      return 'convert-status-completed'
    case 'failed':
      return 'convert-status-failed'
    default:
      return 'convert-status-idle'
  }
}

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'queued':
      return '⏳'
    case 'running':
      return '🔄'
    case 'completed':
      return '✅'
    case 'failed':
      return '❌'
    default:
      return '⭕'
  }
}
