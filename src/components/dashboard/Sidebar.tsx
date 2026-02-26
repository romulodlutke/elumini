'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, BarChart3, Settings,
  Search, Clock, Star, LogOut, ChevronLeft, Leaf, Shield,
  UserCheck, DollarSign, Bell
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Usuários', href: '/dashboard/admin/users', icon: <Users size={18} /> },
  { label: 'Terapeutas', href: '/dashboard/admin/therapists', icon: <UserCheck size={18} /> },
  { label: 'Relatórios', href: '/dashboard/admin/reports', icon: <BarChart3 size={18} /> },
  { label: 'Comissão', href: '/dashboard/admin/commission', icon: <DollarSign size={18} /> },
]

const therapistNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/terapeuta', icon: <LayoutDashboard size={18} /> },
  { label: 'Agenda', href: '/dashboard/terapeuta/agenda', icon: <Calendar size={18} /> },
  { label: 'Meu Perfil', href: '/dashboard/terapeuta/perfil', icon: <Settings size={18} /> },
]

const patientNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/paciente', icon: <LayoutDashboard size={18} /> },
  { label: 'Buscar Terapeutas', href: '/dashboard/paciente/buscar', icon: <Search size={18} /> },
  { label: 'Agendamentos', href: '/dashboard/paciente/agendamentos', icon: <Clock size={18} /> },
  { label: 'Meu Perfil', href: '/dashboard/paciente/perfil', icon: <Settings size={18} /> },
]

const navByRole: Record<string, NavItem[]> = {
  ADMIN: adminNav,
  TERAPEUTA: therapistNav,
  PACIENTE: patientNav,
}

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN: { label: 'Administrador', color: 'text-purple-700', bg: 'bg-purple-50' },
  TERAPEUTA: { label: 'Terapeuta', color: 'text-primary-700', bg: 'bg-primary-50' },
  PACIENTE: { label: 'Paciente', color: 'text-blue-700', bg: 'bg-blue-50' },
}

interface SidebarProps {
  userName: string
  userRole: string
  userEmail: string
  avatarUrl?: string | null
}

export function Sidebar({ userName, userRole, userEmail, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = navByRole[userRole] || []
  const roleInfo = roleLabels[userRole] || roleLabels.PACIENTE

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Até logo!')
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-white border-r border-surface-200 transition-all duration-300 sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-surface-100 h-16">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Holos</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Perfil do usuário */}
      {!collapsed && (
        <div className="p-4 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.split(' ').slice(0, 2).map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', roleInfo.bg, roleInfo.color)}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:bg-surface-50 hover:text-slate-900',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className={cn(isActive ? 'text-primary-600' : 'text-slate-400')}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-surface-100">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600',
            'hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  )
}
