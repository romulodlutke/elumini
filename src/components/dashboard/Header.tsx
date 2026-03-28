'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title?: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const [notifications] = useState(2)

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="min-w-0 flex-1 mr-3">
        {title && (
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight truncate">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block truncate">
            {description}
          </p>
        )}
      </div>

      <button
        aria-label="Notificações"
        className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center
                   rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
      >
        <Bell size={17} />
        {notifications > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>
    </header>
  )
}

// ────────────────────────────────────────────────────────────────
// StatCard — KPI card responsivo
// ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  color?: 'teal' | 'purple' | 'blue' | 'orange'
}

const colorStyles = {
  teal:   { bg: 'bg-green-50',  icon: 'text-green-600',  accent: 'text-green-600' },
  purple: { bg: 'bg-indigo-50', icon: 'text-indigo-600', accent: 'text-indigo-600' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   accent: 'text-blue-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', accent: 'text-orange-500' },
}

export function StatCard({ title, value, description, icon, trend, color = 'teal' }: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 leading-snug max-w-[75%]">
          {title}
        </p>
        <div className={`p-2 rounded-lg ${styles.bg} flex-shrink-0`}>
          <span className={styles.icon}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900 mb-1 tracking-tight">{value}</p>
      {description && <p className="text-xs text-slate-400">{description}</p>}
      {trend && (
        <p className={`text-xs font-semibold mt-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% este mês
        </p>
      )}
    </div>
  )
}
