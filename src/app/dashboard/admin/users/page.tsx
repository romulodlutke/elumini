'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getAvatarUrl, formatDate } from '@/lib/utils'
import { Search, UserCheck, Users, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

type Role = 'ADMIN' | 'TERAPEUTA' | 'PACIENTE'

interface User {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  avatarUrl: string | null
  createdAt: string
  therapistProfile: { approved: boolean } | null
  patientProfile: { gender: string | null } | null
}

const roleLabel: Record<Role, string> = {
  ADMIN: 'Admin',
  TERAPEUTA: 'Terapeuta',
  PACIENTE: 'Paciente',
}

const roleVariant: Record<Role, 'info' | 'success' | 'default'> = {
  ADMIN: 'info',
  TERAPEUTA: 'success',
  PACIENTE: 'default',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users?perPage=100')
      const data = await res.json()
      if (data.success) setUsers(data.data || [])
    } catch {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(active ? 'Usuário ativado com sucesso' : 'Usuário desativado')
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, active } : u))
        )
      } else {
        toast.error(data.error || 'Erro ao atualizar usuário')
      }
    } catch {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || u.role === filterRole
    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && u.active) ||
      (filterActive === 'inactive' && !u.active)
    return matchSearch && matchRole && matchActive
  })

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === 'ADMIN').length,
    terapeuta: users.filter((u) => u.role === 'TERAPEUTA').length,
    paciente: users.filter((u) => u.role === 'PACIENTE').length,
    inactive: users.filter((u) => !u.active).length,
  }

  return (
    <div>
      <Header title="Gerenciar Usuários" description="Visualize e gerencie todos os usuários da plataforma" />

      <div className="p-6 space-y-5">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: counts.total, icon: <Users size={16} />, color: 'bg-blue-50 text-blue-700' },
            { label: 'Terapeutas', value: counts.terapeuta, icon: <UserCheck size={16} />, color: 'bg-teal-50 text-teal-700' },
            { label: 'Pacientes', value: counts.paciente, icon: <Users size={16} />, color: 'bg-purple-50 text-purple-700' },
            { label: 'Inativos', value: counts.inactive, icon: <ShieldAlert size={16} />, color: 'bg-red-50 text-red-700' },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl p-4 flex items-center gap-3 ${card.color}`}>
              <div className="opacity-70">{card.icon}</div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs font-medium opacity-80">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-surface-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'ADMIN', 'TERAPEUTA', 'PACIENTE'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterRole === r
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'
                }`}
              >
                {r === 'ALL' ? 'Todos' : roleLabel[r]}
              </button>
            ))}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as typeof filterActive)}
              className="px-3 py-2 rounded-xl text-sm border border-surface-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="all">Todos status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Usuário</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Perfil</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Cadastro</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={getAvatarUrl(user.name, user.avatarUrl)}
                            alt={user.name}
                            width={36}
                            height={36}
                            className="rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={roleVariant[user.role]} size="sm">
                            {roleLabel[user.role]}
                          </Badge>
                          {user.role === 'TERAPEUTA' && user.therapistProfile && (
                            <Badge
                              variant={user.therapistProfile.approved ? 'success' : 'warning'}
                              size="sm"
                            >
                              {user.therapistProfile.approved ? 'Aprovado' : 'Pendente'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            user.active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`} />
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={user.active ? 'danger' : 'secondary'}
                          onClick={() => handleToggleActive(user.id, !user.active)}
                          className="gap-1.5"
                        >
                          {user.active ? (
                            <><ToggleLeft size={14} /> Desativar</>
                          ) : (
                            <><ToggleRight size={14} /> Ativar</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-surface-100 text-xs text-slate-400">
              Exibindo {filtered.length} de {users.length} usuários
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
