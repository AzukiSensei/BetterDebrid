export function formatBytes(value?: number | null) {
  if (!value) return '0 o'
  const units = ['o', 'Ko', 'Mo', 'Go', 'To']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const amount = value / 1024 ** index
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: index ? 1 : 0 }).format(amount)} ${units[index]}`
}

export function formatDate(value?: string | number | null, includeTime = false) {
  if (!value) return '—'
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
  }).format(date)
}

export function magnetProgress(size: number, downloaded?: number) {
  if (!size || !downloaded) return 0
  return Math.min(100, Math.round((downloaded / size) * 100))
}
