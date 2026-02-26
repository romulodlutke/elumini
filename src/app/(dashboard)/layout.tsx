import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')
  const userEmail = headersList.get('x-user-email')
  const userName = headersList.get('x-user-name')

  if (!userId || !userRole) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar
        userName={userName || 'Usuário'}
        userRole={userRole}
        userEmail={userEmail || ''}
        avatarUrl={null}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
