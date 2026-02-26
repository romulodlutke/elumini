import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Leaf, Star, Shield, Zap, ArrowRight, CheckCircle2, Users, Calendar, Heart } from 'lucide-react'

const THERAPY_HIGHLIGHTS = [
  'Reiki', 'Acupuntura', 'Meditação', 'Yoga Terapêutico',
  'Constelação Familiar', 'Florais de Bach', 'Aromaterapia', 'Hipnoterapia',
]

const STATS = [
  { value: '500+', label: 'Terapeutas certificados' },
  { value: '12k+', label: 'Sessões realizadas' },
  { value: '4.9', label: 'Avaliação média' },
  { value: '98%', label: 'Satisfação dos pacientes' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <Users size={24} className="text-primary-600" />,
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de 2 minutos. Sem burocracia.',
  },
  {
    step: '02',
    icon: <Star size={24} className="text-primary-600" />,
    title: 'Encontre seu terapeuta',
    description: 'Filtre por tipo de terapia, modalidade, preço e avaliações.',
  },
  {
    step: '03',
    icon: <Calendar size={24} className="text-primary-600" />,
    title: 'Agende sua sessão',
    description: 'Escolha data e horário diretamente na agenda do terapeuta.',
  },
  {
    step: '04',
    icon: <Heart size={24} className="text-primary-600" />,
    title: 'Comece sua jornada',
    description: 'Inicie seu processo de cura e bem-estar com suporte holístico.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-xl tracking-tight">HolosConnect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <Link href="#como-funciona" className="hover:text-slate-900 transition-colors">Como funciona</Link>
            <Link href="#terapias" className="hover:text-slate-900 transition-colors">Terapias</Link>
            <Link href="/register?role=TERAPEUTA" className="hover:text-slate-900 transition-colors">Seja terapeuta</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-24 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(217,70,239,0.06),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Zap size={14} className="fill-primary-500" />
            Plataforma #1 em terapias holísticas no Brasil
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Conecte-se com seu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">
              terapeuta ideal
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Mais de 500 terapeutas holísticos certificados. Reiki, Acupuntura, Meditação, Constelação Familiar e muito mais.
            Atendimento online ou presencial, do jeito que você prefere.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/register">
              <Button size="xl">
                Encontrar terapeuta
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/register?role=TERAPEUTA">
              <Button variant="outline" size="xl">
                Sou terapeuta
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              'Cadastro 100% gratuito',
              'Sem mensalidade',
              'Pagamento por sessão',
            ].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 size={16} className="text-primary-500 fill-primary-100" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-surface-100 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary-600 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 px-6 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Como funciona</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Em 4 passos simples você está conectado com o terapeuta certo para a sua jornada.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%_-_12px)] w-full h-px bg-gradient-to-r from-surface-300 to-transparent z-10" />
                )}
                <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-card text-center relative">
                  <div className="absolute -top-3 left-4 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 mt-2">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terapias */}
      <section id="terapias" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Explore as terapias</h2>
            <p className="text-slate-600">Mais de 30 modalidades de terapias holísticas disponíveis.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {THERAPY_HIGHLIGHTS.map((therapy) => (
              <Link
                key={therapy}
                href={`/register?therapy=${encodeURIComponent(therapy)}`}
                className="px-5 py-2.5 bg-surface-50 hover:bg-primary-50 border border-surface-200 hover:border-primary-200 text-slate-700 hover:text-primary-700 rounded-full text-sm font-medium transition-all duration-200"
              >
                {therapy}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Junte-se a milhares de pessoas que já transformaram suas vidas com terapias holísticas.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="xl">
              Criar conta gratuita
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf size={14} className="text-white" />
            </div>
            <span className="font-semibold text-white">HolosConnect</span>
          </div>
          <p className="text-sm">© 2025 HolosConnect. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/suporte" className="hover:text-white transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
