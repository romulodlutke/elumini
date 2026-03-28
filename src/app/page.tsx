import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  Leaf, Star, ArrowRight, CheckCircle2,
  Users, Calendar, Heart, Shield, ChevronRight
} from 'lucide-react'

import { THERAPY_HIGHLIGHTS } from '@/constants/therapies'

const STATS = [
  { value: '500+', label: 'Terapeutas certificados' },
  { value: '12k+', label: 'Sessões realizadas' },
  { value: '4.9',  label: 'Avaliação média' },
  { value: '98%',  label: 'Satisfação' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Users size={20} className="text-green-600" />,
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de 2 minutos.',
  },
  {
    step: '02',
    icon: <Star size={20} className="text-green-600" />,
    title: 'Encontre seu terapeuta',
    description: 'Filtre por terapia, modalidade e preço.',
  },
  {
    step: '03',
    icon: <Calendar size={20} className="text-green-600" />,
    title: 'Agende sua sessão',
    description: 'Escolha data e horário na agenda do profissional.',
  },
  {
    step: '04',
    icon: <Heart size={20} className="text-green-600" />,
    title: 'Comece sua jornada',
    description: 'Inicie seu processo de cura com suporte holístico.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Isabela Fonseca',
    role: 'Paciente',
    text: 'Encontrei minha terapeuta de Constelação Familiar em menos de 10 minutos. A plataforma é incrível.',
    stars: 5,
  },
  {
    name: 'Rafael Nunes',
    role: 'Paciente',
    text: 'Já são 6 meses de sessões de Reiki. Mudou completamente minha qualidade de vida.',
    stars: 5,
  },
  {
    name: 'Carla Menezes',
    role: 'Terapeuta',
    text: 'Como terapeuta, o EALumini me trouxe pacientes que realmente buscam crescimento.',
    stars: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={15} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-lg tracking-tight">EALumini</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-slate-500 font-medium">
            <Link href="#como-funciona" className="hover:text-slate-900 transition-colors duration-200">Como funciona</Link>
            <Link href="#terapias"      className="hover:text-slate-900 transition-colors duration-200">Terapias</Link>
            <Link href="/register?role=TERAPEUTA" className="hover:text-slate-900 transition-colors duration-200">Seja terapeuta</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        {/* Gradiente sutil de fundo */}
        <div className="absolute top-0 left-0 right-0 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(22,163,74,0.07), transparent)' }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg mb-8 border border-green-200">
                <Shield size={12} />
                Plataforma líder em terapias holísticas
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-slate-900 mb-5">
                Cuide da sua{' '}
                <span className="text-green-600">mente</span>
                {' '}e da sua{' '}
                <span className="text-indigo-600">alma</span>
              </h1>

              <p className="text-base text-slate-600 max-w-lg mb-8 leading-relaxed">
                Mais de <strong className="text-slate-900 font-semibold">500 terapeutas certificados</strong>. Reiki,
                Acupuntura, Meditação e muito mais. Atendimento online ou presencial.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/register">
                  <Button size="xl">
                    Encontrar terapeuta
                    <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link href="/register?role=TERAPEUTA">
                  <Button variant="outline" size="xl">
                    Sou terapeuta
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                {[
                  'Cadastro 100% gratuito',
                  'Sem mensalidade',
                  'Pagamento por sessão',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-indigo-100 rounded-2xl blur-2xl scale-95 opacity-60" />
                <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="h-2 w-24 bg-slate-100 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">A</div>
                    <div className="flex-1 min-w-0">
                      <div className="h-2.5 bg-slate-200 rounded w-24 mb-2" />
                      <div className="h-2 bg-green-200 rounded w-16 mb-2" />
                      <div className="flex gap-0.5">
                        {Array.from({length:5}).map((_,i) => (
                          <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-2 bg-slate-100 rounded w-12 mb-1.5" />
                      <div className="h-5 bg-green-50 border border-green-200 rounded-lg w-16" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00','10:00','11:00','14:00','15:00','16:00'].map((h,i) => (
                      <div key={h} className={`text-center py-2 rounded-lg text-xs font-medium ${i===1 ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>{h}</div>
                    ))}
                  </div>
                  <div className="bg-green-600 rounded-lg py-2.5 text-center text-white text-sm font-semibold shadow-sm">
                    Agendar sessão
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-1 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">Como funciona</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Em 4 passos simples</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg tracking-widest">
                  {item.step}
                </div>
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4 mt-2">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terapias ──────────────────────────────────────── */}
      <section id="terapias" className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">Especialidades</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
              Explore as terapias
            </h2>
            <p className="text-slate-500 text-sm">Mais de 30 modalidades disponíveis na plataforma.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {THERAPY_HIGHLIGHTS.map((name) => (
              <Link
                key={name}
                href={`/register?therapy=${encodeURIComponent(name)}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-green-600 hover:text-white border border-slate-200 hover:border-transparent text-slate-700 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">Depoimentos</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Histórias reais</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">Comece hoje</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Pronto para sua jornada?
          </h2>
          <p className="text-slate-600 mb-10 text-base max-w-md mx-auto leading-relaxed">
            Junte-se a milhares de pessoas que transformaram suas vidas com terapias holísticas.
          </p>
          <Link href="/register">
            <Button size="xl">
              Criar conta gratuita
              <ArrowRight size={17} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf size={13} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">EALumini</span>
          </div>
          <p className="text-xs text-slate-400">© 2025 EALumini. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-xs font-medium">
            <Link href="/privacidade" className="hover:text-slate-700 transition-colors duration-200">Privacidade</Link>
            <Link href="/termos"      className="hover:text-slate-700 transition-colors duration-200">Termos</Link>
            <Link href="/suporte"     className="hover:text-slate-700 transition-colors duration-200">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
