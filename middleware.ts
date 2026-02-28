import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Utilisation de getSession pour éviter les lags de validation au login
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const path = request.nextUrl.pathname

  const isAuthPage = path === '/apprendre/login' || path === '/apprendre/register'
  const isLessonPage = path.startsWith('/apprendre/') && !isAuthPage

  // RÈGLE 1 : Non connecté -> Rediriger vers Login
  if (!user && isLessonPage) {
    return NextResponse.redirect(new URL('/apprendre/login', request.url))
  }

  // RÈGLE 2 : Déjà connecté -> Rediriger vers la plateforme
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/apprendre/1', request.url))
  }

  return response
}

export const config = {
  matcher: ['/apprendre/:path*'],
}