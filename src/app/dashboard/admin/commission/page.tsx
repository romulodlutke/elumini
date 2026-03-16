'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DollarSign, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

export default function AdminCommissionPage() {
  const [currentRate, setCurrentRate] = useState<number | null>(null)
  const [newRate, setNewRate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/commission')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCurrentRate(data.data.commissionRate)
          setNewRate(String(data.data.commissionRate))
        }
      })
  }, [])

  const handleSave = async () => {
    const rate = parseFloat(newRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Insira um valor entre 0 e 100')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rate }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Taxa atualizada com sucesso!')
        setCurrentRate(data.data.commissionRate)
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Configurar Comissão" description="Taxa cobrada sobre cada agendamento confirmado" />
      <div className="p-6 max-w-xl">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm">
            <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Como funciona a comissão?</p>
              <p className="mt-1 text-blue-700">
                A comissão é calculada automaticamente quando um agendamento muda para "Confirmado".
                O valor é descontado do pagamento do terapeuta e registrado como receita da plataforma.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Taxa atual</p>
            <p className="text-3xl font-bold text-primary-600">
              {currentRate !== null ? `${currentRate}%` : '—'}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Nova taxa de comissão (%)"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              leftIcon={<DollarSign size={16} />}
              hint="Valor entre 0% e 100%. Ex: 10 para 10% de comissão."
            />

            {/* Preview de cálculo */}
            {parseFloat(newRate) >= 0 && !isNaN(parseFloat(newRate)) && (
              <div className="p-4 bg-surface-50 rounded-xl text-sm space-y-2">
                <p className="font-medium text-slate-700">Exemplo de cálculo (sessão de R$ 200,00):</p>
                <div className="flex justify-between text-slate-600">
                  <span>Valor da sessão</span>
                  <span className="font-medium">R$ 200,00</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Comissão EALumini ({parseFloat(newRate)}%)</span>
                  <span className="font-medium">- R$ {(200 * parseFloat(newRate) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-700 border-t border-surface-200 pt-2 font-semibold">
                  <span>Valor líquido do terapeuta</span>
                  <span>R$ {(200 - 200 * parseFloat(newRate) / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button onClick={handleSave} loading={loading} fullWidth size="lg">
              Salvar nova taxa
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
