/* eslint-disable react/no-unescaped-entities */
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogIn, LogOut, Terminal, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // ROUTES
  const isLanding = pathname === '/'
  const isAuth =
    pathname === '/apprendre/login' ||
    pathname === '/apprendre/register'

  // SESSION
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  // ⛔ Pas de header pendant le chargement
  if (loading) return null

  // ⛔ Pas de header sur login / register
  if (isAuth) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] h-20 px-6 flex items-center justify-between backdrop-blur-xl bg-black/60 border-b border-white/10">
      
      {/* LOGO */}
      <Link
        href={user ? '/apprendre' : '/'}
        className="flex items-center gap-3 pointer-events-auto"
      >
        <Terminal className="text-[#306998]" size={20} />
        <span className="text-xl font-black italic uppercase tracking-tight text-white">
          Lumina<span className="text-[#306998]">Code</span>
        </span>
      </Link>

      {/* ACTIONS */}
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* LANDING PAGE */}
        {isLanding && !user && (
          <>
            <Link
              href="/apprendre/login"
              className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white hover:bg-[#306998] transition"
            >
              <LogIn size={14} className="inline mr-2" />
              Connexion
            </Link>

            <Link
              href="/apprendre/register"
              className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#FFD43B] text-black hover:scale-105 transition"
            >
              S'inscrire
            </Link>
          </>
        )}

        {/* APP CONNECTÉE */}
        {user && (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white hover:text-red-400 transition"
          >
            {isLoggingOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            Déconnexion
          </button>
        )}
      </div>
    </header>
  )
}