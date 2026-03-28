'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/hooks/useAuth'

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN:     '/dashboard/admin',
  TERAPEUTA: '/dashboard/terapeuta',
  PACIENTE:  '/dashboard/paciente',
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

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
      toast.success(`Bem-vindo de volta, ${result.data.user.name.split(' ')[0]}!`)
      router.push(DASHBOARD_BY_ROLE[result.data.user.role] || '/')
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      {/* Painel esquerdo — visível só em md+ */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-green-600 p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Leaf size={15} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg">EALumini</span>
        </Link>
        <div>
          <h2 className="text-4xl font-semibold text-white mb-4 leading-tight tracking-tight">
            Cuide da sua mente.<br />Cuide da sua alma.
          </h2>
          <p className="text-green-100/80 text-sm leading-relaxed">
            Mais de 500 terapeutas certificados esperando para te atender.
          </p>
        </div>
        <p className="text-green-100/40 text-xs">© 2025 EALumini</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo mobile */}
        <div className="md:hidden mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-xl">EALumini</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm">Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              Entrar
              {!isSubmitting && <ArrowRight size={16} />}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
              Cadastre-se grátis
            </Link>
          </p>

          {/* Credenciais de teste */}
          <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Contas de teste</p>
            <div className="space-y-2">
              {[
                { role: 'Admin',     email: 'admin@ealumini.com',       pass: 'Admin@123' },
                { role: 'Terapeuta', email: 'ana.ribeiro@ealumini.com',  pass: 'Terapeuta@123' },
                { role: 'Paciente',  email: 'marcos.pereira@email.com',  pass: 'Paciente@123' },
              ].map((c) => (
                <div key={c.role} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{c.role}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{c.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
