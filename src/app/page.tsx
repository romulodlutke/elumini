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
    icon: <Users size={22} className="text-brand-500" />,
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de 2 minutos.',
  },
  {
    step: '02',
    icon: <Star size={22} className="text-brand-500" />,
    title: 'Encontre seu terapeuta',
    description: 'Filtre por terapia, modalidade e preço.',
  },
  {
    step: '03',
    icon: <Calendar size={22} className="text-brand-500" />,
    title: 'Agende sua sessão',
    description: 'Escolha data e horário na agenda do profissional.',
  },
  {
    step: '04',
    icon: <Heart size={22} className="text-brand-500" />,
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
    <div className="min-h-screen" style={{ backgroundColor: '#F6F3EE' }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <Leaf size={15} className="text-white" />
            </div>
            <span className="font-bold text-sand-900 text-lg tracking-tight">EALumini</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-sand-600 font-medium">
            <Link href="#como-funciona" className="hover:text-sand-900 transition-colors">Como funciona</Link>
            <Link href="#terapias" className="hover:text-sand-900 transition-colors">Terapias</Link>
            <Link href="/register?role=TERAPEUTA" className="hover:text-sand-900 transition-colors">Seja terapeuta</Link>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-6">
        {/* Mesh gradient sutil */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(ellipse, rgba(58,141,123,0.18) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-600 text-xs font-semibold px-4 py-2 rounded-pill mb-8 border border-brand-500/20 uppercase tracking-widest">
            <Sparkles size={12} className="fill-brand-500" />
            Plataforma líder em terapias holísticas
          </div>

          {/* Headline com Bebas Neue */}
          <h1
            className="display-heading text-sand-900 mb-6"
            style={{ fontSize: 'clamp(56px, 10vw, 110px)' }}
          >
            Cuide da sua{' '}
            <span className="text-brand-500">mente</span>
            {' '}e da sua{' '}
            <span className="text-secondary-500">alma</span>
          </h1>

          <p className="text-base md:text-lg text-sand-600 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Mais de <strong className="text-sand-800 font-semibold">500 terapeutas certificados</strong>. Reiki,
            Acupuntura, Meditação e muito mais. Atendimento online ou presencial.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/register">
              <Button size="xl">
                Encontrar terapeuta
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link href="/register?role=TERAPEUTA">
              <Button variant="outline" size="xl">
                Sou terapeuta
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            {[
              'Cadastro 100% gratuito',
              'Sem mensalidade',
              'Pagamento por sessão',
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-sand-500">
                <CheckCircle2 size={15} className="text-brand-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section className="bg-white border-y border-sand-200 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="display-heading text-brand-500 mb-1"
                style={{ fontSize: '2.8rem' }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-sand-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="label-caps mb-3">Como funciona</p>
            <h2
              className="display-heading text-sand-900"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
            >
              Em 4 passos simples
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="relative flex gap-4 md:flex-col md:gap-0">
                {/* Connector */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-40px)] h-px bg-sand-200 z-10" />
                )}
                <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-card text-center relative flex-1">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-pill tracking-widest">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-sand-900 mb-2 text-sm">{item.title}</h3>
                  <p className="text-sm text-sand-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terapias ──────────────────────────────────────── */}
      <section id="terapias" className="py-24 px-6 bg-white border-y border-sand-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-caps mb-3">Especialidades</p>
            <h2
              className="display-heading text-sand-900 mb-4"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
            >
              Explore as terapias
            </h2>
            <p className="text-sand-500 text-sm">Mais de 30 modalidades disponíveis na plataforma.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {THERAPY_HIGHLIGHTS.map((name) => (
              <Link
                key={name}
                href={`/register?therapy=${encodeURIComponent(name)}`}
                className="group flex items-center gap-2 px-5 py-2.5 bg-sand-100 hover:bg-brand-500 border border-sand-200 hover:border-brand-500 text-sand-700 hover:text-white rounded-pill text-sm font-medium transition-all duration-200"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ───────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="label-caps mb-3">Depoimentos</p>
            <h2
              className="display-heading text-sand-900"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
            >
              Histórias reais
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-sand-200 shadow-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sand-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-sand-100 pt-4">
                  <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-600 font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sand-900">{t.name}</p>
                    <p className="text-xs text-sand-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-500">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brand-100/70 text-xs font-semibold uppercase tracking-widest mb-4">Comece hoje</p>
          <h2
            className="display-heading text-white mb-5"
            style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
          >
            Pronto para sua jornada?
          </h2>
          <p className="text-brand-100/80 mb-9 text-base max-w-md mx-auto leading-relaxed">
            Junte-se a milhares de pessoas que transformaram suas vidas com terapias holísticas.
          </p>
          <Link href="/register">
            <Button
              size="xl"
              className="bg-white text-brand-600 hover:bg-sand-100 shadow-lg"
            >
              Criar conta gratuita
              <ArrowRight size={17} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-sand-900 text-sand-500 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-500 rounded-xl flex items-center justify-center">
              <Leaf size={13} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">EALumini</span>
          </div>
          <p className="text-xs text-sand-600">© 2025 EALumini. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-xs font-medium">
            <Link href="/privacidade" className="hover:text-sand-300 transition-colors">Privacidade</Link>
            <Link href="/termos"      className="hover:text-sand-300 transition-colors">Termos</Link>
            <Link href="/suporte"     className="hover:text-sand-300 transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
