import { formatNumber } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | null | undefined
  prevValue?: number | null
  prefix?: string
  suffix?: string
  large?: boolean
}

export function StatCard({ label, value, prevValue, prefix = '', suffix = '', large = false }: StatCardProps) {
  const delta = value != null && prevValue != null ? value - prevValue : null
  const positive = delta != null && delta > 0
  const negative = delta != null && delta < 0

  return (
    <div className="bg-[#141414] border border-[#252525] rounded-xl p-5 flex flex-col gap-2">
      <p className={`font-medium text-[#888888] uppercase tracking-wide ${large ? 'text-xs' : 'text-[11px]'}`}>
        {label}
      </p>
      <p className={`font-semibold text-[#F0F0F0] ${large ? 'text-3xl' : 'text-2xl'}`}>
        {prefix}{formatNumber(value ?? null)}{suffix}
      </p>
      {delta !== null && (
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-emerald-400' : negative ? 'text-red-500' : 'text-[#888888]'}`}>
          {positive && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
            </svg>
          )}
          {negative && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
            </svg>
          )}
          {delta === 0 ? 'No change' : `${positive ? '+' : ''}${formatNumber(delta)} vs last week`}
        </div>
      )}
      {delta === null && <p className="text-xs text-[#555555]">No previous data</p>}
    </div>
  )
}
