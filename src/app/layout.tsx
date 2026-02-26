import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'HolosConnect — Marketplace de Terapias Holísticas',
    template: '%s | HolosConnect',
  },
  description: 'Conectamos você aos melhores terapeutas holísticos. Reiki, Acupuntura, Meditação, Yoga e muito mais.',
  keywords: ['terapia holística', 'terapeuta', 'reiki', 'acupuntura', 'meditação', 'yoga', 'bem-estar'],
  openGraph: {
    title: 'HolosConnect',
    description: 'Sua plataforma de saúde holística',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#14b8a6', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
