export function getWeekNumber(createdAt: string | null): number {
  if (!createdAt) return 1
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)) + 1)
}

export function getPackageLabel(pkg: string | null): string {
  switch (pkg) {
    case 'growth': return 'Premium Client'
    case 'starter': return 'Premium Client'
    case 'retainer': return 'Premium Client'
    default: return 'Premium Client'
  }
}

export function getPackageBadgeColor(pkg: string | null): string {
  switch (pkg) {
    case 'growth': return 'bg-white/10 text-[#E0E0E0]'
    case 'retainer': return 'bg-purple-500/10 text-purple-300'
    default: return 'bg-white/10 text-[#A0A0A0]'
  }
}

export function getMondayOfCurrentWeek(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short'
  })
}
