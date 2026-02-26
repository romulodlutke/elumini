'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title?: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const [notifications] = useState(2)

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        {title && <h1 className="text-lg font-semibold text-slate-900">{title}</h1>}
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-surface-100 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: { value: number; positive: boolean }
  color?: 'teal' | 'purple' | 'blue' | 'orange'
}

const colorStyles = {
  teal:   { bg: 'bg-primary-50', icon: 'text-primary-600', border: 'border-primary-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  blue:   { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-100' },
}

export function StatCard({ title, value, description, icon, trend, color = 'teal' }: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${styles.bg} ${styles.border} border`}>
          <span className={styles.icon}>{icon}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
        {trend && (
          <p className={`text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% este mês
          </p>
        )}
      </div>
    </div>
  )
}
