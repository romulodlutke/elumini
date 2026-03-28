'use client'

import { APP_NAME } from '@/lib/brand'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, BarChart3, Settings,
  Search, Clock, LogOut, ChevronLeft, Leaf,
  UserCheck, DollarSign, Tags, HeartHandshake,
} from 'lucide-react'
import { useMemo, useState } from 'react'
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
  { label: 'Terapias',   href: '/dashboard/admin/therapies',   icon: <Tags size={17} /> },
  { label: 'Relatórios', href: '/dashboard/admin/reports',     icon: <BarChart3 size={17} /> },
  { label: 'Comissão',   href: '/dashboard/admin/commission',  icon: <DollarSign size={17} /> },
]

const therapistNav: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard/terapeuta',         icon: <LayoutDashboard size={17} /> },
  { label: 'Agenda',     href: '/dashboard/terapeuta/agenda',  icon: <Calendar size={17} /> },
  { label: 'Terapias',   href: '/dashboard/terapeuta/terapias', icon: <HeartHandshake size={17} /> },
  { label: 'Meu Perfil', href: '/dashboard/terapeuta/perfil',  icon: <Settings size={17} /> },
]

const patientNav: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard/paciente',              icon: <LayoutDashboard size={17} /> },
  { label: 'Buscar',      href: '/dashboard/paciente/buscar',       icon: <Search size={17} /> },
  { label: 'Agendamentos',href: '/dashboard/paciente/agendamentos', icon: <Clock size={17} /> },
  { label: 'Perfil',      href: '/dashboard/paciente/perfil',       icon: <Settings size={17} /> },
]

const navByRole: Record<string, NavItem[]> = {
  ADMIN:     adminNav,
  TERAPEUTA: therapistNav,
  PACIENTE:  patientNav,
}

const roleConfig: Record<string, { label: string; dot: string }> = {
  ADMIN:     { label: 'Admin',     dot: 'bg-indigo-500' },
  TERAPEUTA: { label: 'Terapeuta', dot: 'bg-green-600' },
  PACIENTE:  { label: 'Paciente',  dot: 'bg-blue-500' },
}

function resolveActiveHref(pathname: string, items: NavItem[]): string | null {
  let best: string | null = null
  let bestLen = -1
  for (const { href } of items) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      if (href.length > bestLen) {
        bestLen = href.length
        best = href
      }
    }
  }
  return best
}

interface SidebarProps {
  userName: string
  userRole: string
  userEmail: string
  avatarUrl?: string | null
}

export function Sidebar({ userName, userRole, userEmail: _userEmail, avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = navByRole[userRole] || []
  const activeHref = useMemo(() => resolveActiveHref(pathname, navItems), [pathname, navItems])
  const role = roleConfig[userRole] || roleConfig.PACIENTE
  const initials = userName.split(' ').slice(0, 2).map(n => n[0]).join('')

  const mobileNavItems = navItems.slice(0, 4)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Até logo!')
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  const avatarEl = avatarUrl ? (
    <img src={avatarUrl} alt={userName} className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  )

  return (
    <>
      {/* ─────────────────────────────────────────────
          DESKTOP SIDEBAR (md e acima)
      ───────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen bg-white border-r border-slate-200',
          'transition-all duration-300 sticky top-0 flex-shrink-0',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-700 transition-colors">
                <Leaf size={13} className="text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight">{APP_NAME}</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className={cn(
              'p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150',
              collapsed && 'mx-auto'
            )}
          >
            <ChevronLeft size={15} className={cn('transition-transform duration-200', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Perfil */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              {avatarEl}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{userName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', role.dot)} />
                  <span className="text-[11px] text-slate-500">{role.label}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === activeHref
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  collapsed && 'justify-center'
                )}
              >
                <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-slate-400')}>
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sair' : undefined}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500',
              'hover:bg-red-50 hover:text-red-600 transition-all duration-150 w-full',
              collapsed && 'justify-center'
            )}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────
          MOBILE BOTTOM TAB BAR (abaixo de md)
      ───────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex items-stretch">
          {mobileNavItems.map((item) => {
            const isActive = item.href === activeHref
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5',
                  'min-h-[56px] py-2 px-1 text-[10px] font-medium transition-colors',
                  isActive ? 'text-green-600' : 'text-slate-400 hover:text-slate-700'
                )}
              >
                <span className={cn(
                  'flex items-center justify-center w-9 h-6 rounded-lg transition-colors',
                  isActive ? 'bg-green-50' : ''
                )}>
                  <span className={isActive ? 'text-green-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                </span>
                <span className="leading-none truncate max-w-[60px] text-center">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5',
              'min-h-[56px] py-2 px-1 text-[10px] font-medium transition-colors',
              'text-slate-400 hover:text-red-500'
            )}
          >
            <span className="flex items-center justify-center w-9 h-6">
              <LogOut size={17} />
            </span>
            <span className="leading-none">Sair</span>
          </button>
        </div>
      </nav>
    </>
  )
}
