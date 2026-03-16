'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, BarChart3, Settings,
  Search, Clock, LogOut, ChevronLeft, Leaf,
  UserCheck, DollarSign
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const adminNav: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard/admin',             icon: <LayoutDashboard size={17} /> },
  { label: 'Usuários',   href: '/dashboard/admin/users',       icon: <Users size={17} /> },
  { label: 'Terapeutas', href: '/dashboard/admin/therapists',  icon: <UserCheck size={17} /> },
  { label: 'Relatórios', href: '/dashboard/admin/reports',     icon: <BarChart3 size={17} /> },
  { label: 'Comissão',   href: '/dashboard/admin/commission',  icon: <DollarSign size={17} /> },
]

const therapistNav: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard/terapeuta',        icon: <LayoutDashboard size={17} /> },
  { label: 'Agenda',     href: '/dashboard/terapeuta/agenda', icon: <Calendar size={17} /> },
  { label: 'Meu Perfil', href: '/dashboard/terapeuta/perfil', icon: <Settings size={17} /> },
]

const patientNav: NavItem[] = [
  { label: 'Dashboard',        href: '/dashboard/paciente',              icon: <LayoutDashboard size={17} /> },
  { label: 'Buscar Terapeutas', href: '/dashboard/paciente/buscar',       icon: <Search size={17} /> },
  { label: 'Agendamentos',      href: '/dashboard/paciente/agendamentos', icon: <Clock size={17} /> },
  { label: 'Meu Perfil',        href: '/dashboard/paciente/perfil',       icon: <Settings size={17} /> },
]

const navByRole: Record<string, NavItem[]> = {
  ADMIN:     adminNav,
  TERAPEUTA: therapistNav,
  PACIENTE:  patientNav,
}

const roleConfig: Record<string, { label: string; dot: string }> = {
  ADMIN:     { label: 'Admin', dot: 'bg-secondary-500' },
  TERAPEUTA: { label: 'Terapeuta', dot: 'bg-brand-500' },
  PACIENTE:  { label: 'Paciente', dot: 'bg-blue-400' },
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
  const role = roleConfig[userRole] || roleConfig.PACIENTE
  const initials = userName.split(' ').slice(0, 2).map(n => n[0]).join('')

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
        'flex flex-col h-screen bg-white border-r border-sand-200 transition-all duration-300 sticky top-0 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-sand-100">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 transition-colors">
              <Leaf size={13} className="text-white" />
            </div>
            <span className="font-bold text-sand-900 text-base tracking-tight">Holos</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-xl text-sand-400 hover:text-sand-700 hover:bg-sand-100 transition-all duration-150',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronLeft size={16} className={cn('transition-transform duration-200', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Perfil */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-sand-100">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sand-900 truncate leading-tight">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', role.dot)} />
                <span className="text-[11px] text-sand-500 font-medium">{role.label}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-sand-600 hover:bg-sand-100 hover:text-sand-900',
                collapsed && 'justify-center'
              )}
            >
              <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-sand-400')}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-sand-100">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sair' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sand-500',
            'hover:bg-red-50 hover:text-red-500 transition-all duration-150 w-full',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  )
}
