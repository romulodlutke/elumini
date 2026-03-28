import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  Leaf, Star, ArrowRight, CheckCircle2,
  Users, Calendar, Heart, Sparkles, Shield, ChevronRight
} from 'lucide-react'

import { THERAPY_HIGHLIGHTS } from '@/constants/therapies'

const STATS = [
  { value: '500+', label: 'Terapeutas certificados' },
  { value: '12k+', label: 'Sessões realizadas' },
  { value: '4.9', label: 'Avaliação média' },
  { value: '98%', label: 'Satisfação' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Users size={22} className="text-emerald-400" />,
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de 2 minutos.',
  },
  {
    step: '02',
    icon: <Star size={22} className="text-emerald-400" />,
    title: 'Encontre seu terapeuta',
    description: 'Filtre por terapia, modalidade e preço.',
  },
  {
    step: '03',
    icon: <Calendar size={22} className="text-emerald-400" />,
    title: 'Agende sua sessão',
    description: 'Escolha data e horário na agenda do profissional.',
  },
  {
    step: '04',
    icon: <Heart size={22} className="text-emerald-400" />,
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
    <div className="min-h-screen bg-[#0F172A] text-[#F9FAFB]">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Leaf size={15} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">EALumini</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <Link href="#como-funciona" className="hover:text-white transition-colors duration-200">Como funciona</Link>
            <Link href="#terapias" className="hover:text-white transition-colors duration-200">Terapias</Link>
            <Link href="/register?role=TERAPEUTA" className="hover:text-white transition-colors duration-200">Seja terapeuta</Link>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-emerald-500/40">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28 px-6">
        {/* Radial gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[700px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.35) 0%, transparent 70%)' }} />
          <div className="absolute top-20 right-1/4 w-[500px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Split layout — texto esquerda, visual direita */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Lado esquerdo — texto */}
            <div>
              {/* Tag */}
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg mb-8 border border-emerald-500/20 uppercase tracking-widest">
                <Sparkles size={12} className="fill-emerald-400" />
                Plataforma líder em terapias holísticas
              </div>

              {/* Headline Inter bold */}
              <h1 className="font-bold tracking-tight leading-[1.1] text-4xl sm:text-5xl xl:text-6xl text-white mb-6">
                Cuide da sua{' '}
                <span className="text-emerald-400">mente</span>
                {' '}e da sua{' '}
                <span className="text-indigo-400">alma</span>
              </h1>

              <p className="text-base text-slate-400 max-w-lg mb-10 leading-relaxed">
                Mais de <strong className="text-white font-semibold">500 terapeutas certificados</strong>. Reiki,
                Acupuntura, Meditação e muito mais. Atendimento online ou presencial.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/register">
                  <Button size="xl" className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50">
                    Encontrar terapeuta
                    <ArrowRight size={17} />
                  </Button>
                </Link>
                <Link href="/register?role=TERAPEUTA">
                  <Button variant="outline" size="xl" className="border-white/20 text-white hover:bg-white/10 rounded-xl transition-all duration-200">
                    Sou terapeuta
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-5">
                {[
                  'Cadastro 100% gratuito',
                  'Sem mensalidade',
                  'Pagamento por sessão',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Lado direito — mockup dashboard */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow de fundo */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 rounded-3xl blur-2xl scale-95" />
                {/* Card principal mockup */}
                <div className="relative bg-[#111827] rounded-3xl border border-white/10 shadow-2xl p-6 space-y-4">
                  {/* Header do mockup */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                    </div>
                    <div className="h-2 w-28 bg-white/10 rounded-full" />
                  </div>
                  {/* Avatar + nome do terapeuta */}
                  <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/[0.06]">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">A</div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-white/20 rounded w-28 mb-2" />
                      <div className="h-2 bg-emerald-500/40 rounded w-20 mb-2" />
                      <div className="flex gap-0.5">
                        {Array.from({length:5}).map((_,i) => <div key={i} className="w-3 h-3 rounded-sm bg-amber-400/80" />)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-2 bg-white/10 rounded w-16 mb-1" />
                      <div className="h-4 bg-emerald-500/30 rounded w-20" />
                    </div>
                  </div>
                  {/* Slots de horário */}
                  <div className="grid grid-cols-3 gap-2">
                    {['09:00','10:00','11:00','14:00','15:00','16:00'].map((h,i) => (
                      <div key={h} className={`text-center py-2.5 rounded-xl text-xs font-medium transition-all ${i===1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/[0.06]'}`}>{h}</div>
                    ))}
                  </div>
                  {/* Botão agendar */}
                  <div className="bg-emerald-500 rounded-xl py-3 text-center text-white text-sm font-semibold shadow-lg shadow-emerald-500/25">
                    Agendar sessão
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section className="bg-[#111827] border-y border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bold text-emerald-400 mb-1 text-4xl sm:text-5xl tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────────── */}
      <section id="como-funciona" className="py-28 px-6 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Como funciona</p>
            <h2 className="font-bold tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl">
              Em 4 passos simples
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="relative flex gap-4 md:flex-col md:gap-0">
                {/* Connector */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-40px)] h-px bg-white/10 z-10" />
                )}
                <div className="bg-[#111827] rounded-2xl p-6 border border-white/[0.07] shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 text-center relative flex-1 group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg tracking-widest shadow-lg shadow-emerald-500/30">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2 group-hover:bg-emerald-500/20 transition-colors duration-200">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terapias ──────────────────────────────────────── */}
      <section id="terapias" className="py-28 px-6 bg-[#111827] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">Especialidades</p>
            <h2 className="font-bold tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl mb-4">
              Explore as terapias
            </h2>
            <p className="text-slate-500 text-sm">Mais de 30 modalidades disponíveis na plataforma.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {THERAPY_HIGHLIGHTS.map((name) => (
              <Link
                key={name}
                href={`/register?therapy=${encodeURIComponent(name)}`}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ───────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">Depoimentos</p>
            <h2 className="font-bold tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl">
              Histórias reais
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#111827] rounded-2xl p-6 border border-white/[0.07] shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#111827] border-t border-white/[0.06] relative overflow-hidden">
        {/* Glow fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.5) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-4">Comece hoje</p>
          <h2 className="font-bold tracking-tight text-white text-3xl sm:text-4xl lg:text-5xl mb-5">
            Pronto para sua jornada?
          </h2>
          <p className="text-slate-400 mb-10 text-base max-w-md mx-auto leading-relaxed">
            Junte-se a milhares de pessoas que transformaram suas vidas com terapias holísticas.
          </p>
          <Link href="/register">
            <Button
              size="xl"
              className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50"
            >
              Criar conta gratuita
              <ArrowRight size={17} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-white/[0.06] text-slate-500 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Leaf size={13} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">EALumini</span>
          </div>
          <p className="text-xs text-slate-600">© 2025 EALumini. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-xs font-medium">
            <Link href="/privacidade" className="hover:text-slate-300 transition-colors duration-200">Privacidade</Link>
            <Link href="/termos"      className="hover:text-slate-300 transition-colors duration-200">Termos</Link>
            <Link href="/suporte"     className="hover:text-slate-300 transition-colors duration-200">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
