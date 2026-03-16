import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

// ==========================================
// MAPA DE ROTAS PROTEGIDAS POR ROLE
// ==========================================

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/dashboard/admin':     ['ADMIN'],
  '/dashboard/terapeuta': ['TERAPEUTA'],
  '/dashboard/paciente':  ['PACIENTE'],
  '/api/admin':           ['ADMIN'],
  '/api/availability':    ['TERAPEUTA', 'ADMIN'],
}

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas — sem verificação
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname.startsWith('/terapeutas') ||
    pathname.match(/\.(ico|png|jpg|svg|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Obter token do cookie ou header Authorization
  const token =
    request.cookies.get('access_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  // Redirecionar usuários autenticados fora das rotas de auth
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token) {
      const payload = await verifyAccessToken(token)
      if (payload) {
        return NextResponse.redirect(new URL(getDashboardPath(payload.role), request.url))
      }
    }
    return NextResponse.next()
  }

  // Verificar autenticação para rotas protegidas
  const isProtected = Object.keys(PROTECTED_ROUTES).some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected) {
    if (!token) {
      return redirectToLogin(request)
    }

    const payload = await verifyAccessToken(token)

    if (!payload) {
      // Token expirado ou inválido — redirecionar para login com flag
      const response = redirectToLogin(request)
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      return response
    }

    // Verificar se a role tem permissão para a rota
    const matchedRoute = Object.keys(PROTECTED_ROUTES).find((route) =>
      pathname.startsWith(route)
    )

    if (matchedRoute) {
      const allowedRoles = PROTECTED_ROUTES[matchedRoute]
      if (!allowedRoles.includes(payload.role)) {
        // Redirecionar para o dashboard correto da role
        return NextResponse.redirect(
          new URL(getDashboardPath(payload.role), request.url)
        )
      }
    }

    // Injetar dados do usuário no header para uso nos Server Components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub)
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-name', payload.name)

    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':     return '/dashboard/admin'
    case 'TERAPEUTA': return '/dashboard/terapeuta'
    case 'PACIENTE':  return '/dashboard/paciente'
    default:          return '/login'
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
