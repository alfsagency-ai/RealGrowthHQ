'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const SIDEBAR_STYLE = {
  backgroundColor: '#0D0D0D',
  boxShadow: '6px 0 60px rgba(16,185,129,0.18), 2px 0 0 rgba(16,185,129,0.25)',
  borderRight: '1px solid rgba(255,255,255,0.05)',
}

const ACTIVE_STYLE = {
  backgroundColor: 'rgba(16,185,129,0.10)',
  color: '#6EE7B7',
  border: '1px solid rgba(16,185,129,0.25)',
  boxShadow: '0 0 18px rgba(16,185,129,0.20), inset 0 0 10px rgba(16,185,129,0.06)',
}

const INACTIVE_STYLE = {
  border: '1px solid transparent',
}

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <aside
      className="w-52 shrink-0 flex flex-col overflow-y-auto py-4 px-2.5"
      style={SIDEBAR_STYLE}
    >
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                active ? 'text-emerald-300' : 'text-[#555] hover:text-[#C8C8C8]'
              }`}
              style={active ? ACTIVE_STYLE : INACTIVE_STYLE}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
