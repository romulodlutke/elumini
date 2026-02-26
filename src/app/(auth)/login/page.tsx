'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  TERAPEUTA: '/dashboard/terapeuta',
  PACIENTE: '/dashboard/paciente',
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!result.success) {
        toast.error(result.error || 'Credenciais inválidas')
        return
      }

      setUser(result.data.user)
      setAccessToken(result.data.accessToken)

      toast.success(`Bem-vindo, ${result.data.user.name.split(' ')[0]}!`)
      router.push(DASHBOARD_BY_ROLE[result.data.user.role] || '/')
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow-primary">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900">HolosConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
          <p className="text-slate-500 mt-1 text-sm">Entre para acessar sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-100 text-center">
            <p className="text-sm text-slate-500">
              Não tem conta?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <p className="font-semibold mb-2">Contas de teste:</p>
          <p>Admin: admin@holosconnect.com / Admin@123</p>
          <p>Terapeuta: ana.ribeiro@holosconnect.com / Terapeuta@123</p>
          <p>Paciente: marcos.pereira@email.com / Paciente@123</p>
        </div>
      </div>
    </div>
  )
}
