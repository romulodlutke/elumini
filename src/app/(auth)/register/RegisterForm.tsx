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

export default function RegisterForm() {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FAFAF9]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-xl">EALumini</span>
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Crie sua conta</h1>
          <p className="text-slate-500 text-sm mt-1">Grátis, sem mensalidade</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7">
          {/* Seleção de tipo */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setValue('role', 'PACIENTE')}
              className={cn(
                'flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium',
                selectedRole === 'PACIENTE'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <Heart size={22} className={selectedRole === 'PACIENTE' ? 'text-green-600' : 'text-slate-300'} />
              Sou Paciente
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'TERAPEUTA')}
              className={cn(
                'flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium',
                selectedRole === 'TERAPEUTA'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <Stethoscope size={22} className={selectedRole === 'TERAPEUTA' ? 'text-green-600' : 'text-slate-300'} />
              Sou Terapeuta
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('role')} />

            <Input
              label="Nome completo"
              placeholder="Seu nome"
              leftIcon={<User size={15} />}
              error={errors.name?.message}
              {...register('name')}
            />
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
              placeholder="Mín. 8 caracteres"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              hint="Use letras maiúsculas e números"
              {...register('password')}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              leftIcon={<Lock size={15} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {selectedRole === 'TERAPEUTA' && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 leading-relaxed">
                Após o cadastro, complete seu perfil. Ele passará por aprovação antes de aparecer na plataforma.
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              Criar conta grátis
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-400">
            Ao criar conta, você concorda com os{' '}
            <Link href="/termos" className="text-green-600 hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-green-600 hover:underline">Privacidade</Link>.
          </p>

          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Já tem conta?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
