'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { email: string }) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) setSent(true)
      else toast.error(result.error)
    } catch {
      toast.error('Erro de conexão')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900">HolosConnect</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">E-mail enviado!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Se este e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha em breve.
              </p>
              <Link href="/login">
                <Button fullWidth variant="outline">
                  <ArrowLeft size={16} />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Esqueceu a senha?</h2>
                <p className="text-slate-500 text-sm">Digite seu e-mail para receber as instruções.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="E-mail cadastrado"
                  type="email"
                  placeholder="seu@email.com"
                  leftIcon={<Mail size={16} />}
                  error={errors.email?.message as string}
                  {...register('email')}
                />
                <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                  Enviar instruções
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1">
                  <ArrowLeft size={14} />
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
