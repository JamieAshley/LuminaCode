import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // Échange le code contre une session utilisateur
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirige l'utilisateur vers ta page de login une fois validé
  return NextResponse.redirect(`${requestUrl.origin}/apprendre/login`)
}