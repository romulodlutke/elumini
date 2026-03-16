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
    <header className="h-14 bg-white border-b border-sand-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        {title && <h1 className="text-base font-semibold text-sand-900 leading-tight">{title}</h1>}
        {description && <p className="text-xs text-sand-400 mt-0.5">{description}</p>}
      </div>
      <button className="relative p-2 rounded-xl text-sand-400 hover:bg-sand-100 hover:text-sand-700 transition-colors">
        <Bell size={17} />
        {notifications > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        )}
      </button>
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
  teal:   { bg: 'bg-brand-500/10',      icon: 'text-brand-500',     accent: 'text-brand-500' },
  purple: { bg: 'bg-secondary-500/10',  icon: 'text-secondary-500', accent: 'text-secondary-500' },
  blue:   { bg: 'bg-blue-50',           icon: 'text-blue-500',      accent: 'text-blue-500' },
  orange: { bg: 'bg-orange-50',         icon: 'text-orange-500',    accent: 'text-orange-500' },
}

export function StatCard({ title, value, description, icon, trend, color = 'teal' }: StatCardProps) {
  const styles = colorStyles[color]

  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-sand-500 uppercase tracking-wider leading-snug max-w-[80%]">{title}</p>
        <div className={`p-2.5 rounded-xl ${styles.bg} flex-shrink-0`}>
          <span className={styles.icon}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-sand-900 mb-1">{value}</p>
      {description && <p className="text-xs text-sand-400">{description}</p>}
      {trend && (
        <p className={`text-xs font-semibold mt-1 ${trend.positive ? 'text-brand-500' : 'text-red-500'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% este mês
        </p>
      )}
    </div>
  )
}
