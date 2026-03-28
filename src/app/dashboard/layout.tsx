export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const userId   = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')
  const userEmail = headersList.get('x-user-email')
  const userName  = headersList.get('x-user-name')

  if (!userId || !userRole) {
    redirect('/login')
  }

  return (
    /*
     * Mobile-first layout:
     * - md-: Sidebar renderiza a barra inferior fixa; main recebe pb-16 para não
     *        ficar tapado pela barra. Largura total em coluna única.
     * - md+: Sidebar volta para coluna lateral; main ocupa o resto horizontal.
     */
    <div className="flex h-screen overflow-hidden bg-sand-100">
      <Sidebar
        userName={userName || 'Usuário'}
        userRole={userRole}
        userEmail={userEmail || ''}
        avatarUrl={null}
      />
      {/* pb-16 = espaço para a barra de navegação inferior no mobile */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
