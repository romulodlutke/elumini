'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { withAuth } from '@/lib/auth-fetch'
import toast from 'react-hot-toast'
import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, Save, X } from 'lucide-react'

interface TherapyTypeRow {
  id: string
  name: string
  slug: string
  active: boolean
  sortOrder: number
}

export default function AdminTherapiesPage() {
  const [items, setItems] = useState<TherapyTypeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newOrder, setNewOrder] = useState('0')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState('')
  const [editActive, setEditActive] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/therapy-types', withAuth({ cache: 'no-store' }))
      const data = await res.json()
      if (data.success) setItems(data.data || [])
      else toast.error(data.error || 'Erro ao carregar')
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startEdit = (row: TherapyTypeRow) => {
    setEditId(row.id)
    setEditName(row.name)
    setEditOrder(String(row.sortOrder))
    setEditActive(row.active)
  }

  const cancelEdit = () => {
    setEditId(null)
  }

  const saveEdit = async () => {
    if (!editId) return
    const sortOrder = parseInt(editOrder, 10)
    if (!editName.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    setSavingId(editId)
    try {
      const res = await fetch(
        `/api/admin/therapy-types/${editId}`,
        withAuth({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editName.trim(),
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
            active: editActive,
          }),
        })
      )
      const data = await res.json()
      if (data.success) {
        toast.success('Tipo atualizado')
        setEditId(null)
        await load()
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSavingId(null)
    }
  }

  const createRow = async () => {
    if (!newName.trim()) {
      toast.error('Informe o nome')
      return
    }
    const sortOrder = parseInt(newOrder, 10)
    setCreating(true)
    try {
      const res = await fetch(
        '/api/admin/therapy-types',
        withAuth({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newName.trim(),
            sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
            active: true,
          }),
        })
      )
      const data = await res.json()
      if (data.success) {
        toast.success('Tipo criado')
        setNewName('')
        setNewOrder('0')
        await load()
      } else {
        toast.error(data.error || 'Erro ao criar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setCreating(false)
    }
  }

  const deactivate = async (id: string, name: string) => {
    if (!confirm(`Desativar "${name}"? Ele deixa de aparecer em novas buscas e no cadastro; dados antigos permanecem nos perfis.`)) return
    try {
      const res = await fetch(`/api/admin/therapy-types/${id}`, withAuth({ method: 'DELETE' }))
      const data = await res.json()
      if (data.success) {
        toast.success('Tipo desativado')
        await load()
        if (editId === id) cancelEdit()
      } else {
        toast.error(data.error || 'Erro')
      }
    } catch {
      toast.error('Erro de conexão')
    }
  }

  return (
    <div>
      <Header
        title="Tipos de terapia"
        description="Catálogo global usado em busca, perfil do terapeuta e landing. Editar o nome atualiza perfis e serviços com o mesmo rótulo."
      />

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Plus size={18} className="text-primary-600" />
            Novo tipo
          </h2>
          <div className="grid sm:grid-cols-[1fr_6rem_auto] gap-3 items-end">
            <Input label="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Aromaterapia" />
            <Input
              label="Ordem"
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
            />
            <Button onClick={createRow} loading={creating} className="h-[46px]">
              Incluir
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="font-semibold text-slate-900">Lista ({items.length})</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Carregando…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Nenhum tipo cadastrado. Rode o seed ou inclua acima. Após migrar o banco, execute{' '}
              <code className="text-xs bg-slate-100 px-1 rounded">npx prisma db seed</code>.
            </p>
          ) : (
            <ul className="divide-y divide-surface-100">
              {items.map((row) => (
                <li key={row.id} className="p-4 sm:p-5">
                  {editId === row.id ? (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input label="Nome" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        <Input label="Ordem" type="number" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                          className="rounded border-surface-300 text-primary-600"
                        />
                        Ativo (visível na plataforma)
                      </label>
                      <p className="text-xs text-slate-500">Slug: {row.slug} (atualizado ao mudar o nome)</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={saveEdit} loading={savingId === row.id}>
                          <Save size={14} className="mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X size={14} className="mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-900">{row.name}</span>
                          {!row.active && (
                            <Badge variant="default" size="sm" className="bg-slate-200 text-slate-700">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          ordem {row.sortOrder} · slug {row.slug}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="p-2 text-slate-400 hover:text-primary-600 rounded-lg"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        {row.active && (
                          <button
                            type="button"
                            onClick={() => deactivate(row.id, row.name)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                            title="Desativar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
