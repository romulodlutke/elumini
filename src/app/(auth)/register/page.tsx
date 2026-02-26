'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf, Mail, Lock, User, Stethoscope, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Inclua ao menos uma maiúscula')
    .regex(/[0-9]/, 'Inclua ao menos um número'),
  confirmPassword: z.string(),
  role: z.enum(['TERAPEUTA', 'PACIENTE']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

const DASHBOARD_BY_ROLE: Record<string, string> = {
  TERAPEUTA: '/dashboard/terapeuta',
  PACIENTE: '/dashboard/paciente',
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'TERAPEUTA' ? 'TERAPEUTA' : 'PACIENTE'
  const { setUser, setAccessToken } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...payload } = data
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!result.success) {
        toast.error(result.error || 'Erro ao criar conta')
        return
      }

      setUser(result.data.user)
      setAccessToken(result.data.accessToken)

      toast.success('Conta criada com sucesso!')
      router.push(DASHBOARD_BY_ROLE[result.data.user.role] || '/')
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900">HolosConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Crie sua conta</h1>
          <p className="text-slate-500 mt-1 text-sm">Grátis, sem mensalidade</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
          {/* Seletor de role */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setValue('role', 'PACIENTE')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                selectedRole === 'PACIENTE'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-surface-200 text-slate-600 hover:border-surface-300 hover:bg-surface-50'
              )}
            >
              <Heart size={22} className={selectedRole === 'PACIENTE' ? 'text-primary-600' : 'text-slate-400'} />
              Sou Paciente
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'TERAPEUTA')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                selectedRole === 'TERAPEUTA'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-surface-200 text-slate-600 hover:border-surface-300 hover:bg-surface-50'
              )}
            >
              <Stethoscope size={22} className={selectedRole === 'TERAPEUTA' ? 'text-primary-600' : 'text-slate-400'} />
              Sou Terapeuta
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('role')} />

            <Input
              label="Nome completo"
              placeholder="Seu nome"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mín. 8 caracteres"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              hint="Use letras maiúsculas e números"
              {...register('password')}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {selectedRole === 'TERAPEUTA' && (
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-700">
                Após o cadastro, complete seu perfil de terapeuta. Seu perfil passará por aprovação antes de aparecer na plataforma.
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Criar conta grátis
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-400">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/termos" className="text-primary-600 hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-primary-600 hover:underline">Política de Privacidade</Link>.
          </p>

          <div className="mt-6 pt-6 border-t border-surface-100 text-center">
            <p className="text-sm text-slate-500">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
