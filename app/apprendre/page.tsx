/* eslint-disable @next/next/no-img-element */
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext' // 1. Import du hook global
import { 
  Terminal, Cpu, Zap, BookOpen, Trophy, 
  ChevronRight, ArrowRight, Sun, Moon, 
  Code2, Github, Twitter, Youtube, Instagram, ShieldCheck,
  CheckCircle2, Rocket, Layers, MousePointer2, LogIn, Menu, X
} from 'lucide-react'

export default function Home() {
  // 2. Utilisation du thème global au lieu du state local
  const { isDark, toggleTheme } = useTheme()
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const slides = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070"
  ]

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [slides.length])

  // L'hydratation est gérée par le ThemeProvider, mais on garde une sécurité ici
  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-[#FFD43B] selection:text-black overflow-x-hidden ${
      isDark ? 'bg-[#050505] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`}>
      
      {/* --- HEADER --- */}
      <header className={`fixed top-0 w-full z-[100] backdrop-blur-xl border-b px-4 md:px-8 py-4 flex items-center justify-between transition-all ${
        isDark ? 'border-white/10 bg-black/50' : 'border-black/5 bg-white/70'
      }`}>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/apprendre/login" className={`flex items-center gap-2 px-3 md:px-5 py-2 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all ${
            isDark ? 'bg-white/5 text-white hover:bg-[#306998]' : 'bg-black/5 text-[#0F172A] hover:bg-[#306998] hover:text-white'
          }`}>
            <LogIn size={14} className="md:w-4 md:h-4" /> <span className="hidden xs:inline">Connexion</span>
          </Link>
          
          {/* 3. Le bouton utilise maintenant toggleTheme() */}
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-transform active:scale-90 ${isDark ? 'text-[#FFD43B] hover:bg-white/5' : 'text-[#306998] hover:bg-black/5'}`}>
            {isDark ? <Sun size={18} fill="currentColor" /> : <Moon size={18} fill="currentColor" />}
          </button>
        </div>

        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-black italic text-lg md:text-xl tracking-tighter uppercase">
            Lumina<span className="text-[#306998]">Code</span>
          </span>
          <div className="bg-black p-1.5 md:p-2 rounded-lg border border-[#306998]/50 group-hover:border-[#FFD43B] transition-all duration-500">
            <svg width="18" height="18" className="md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
              <path d="M11.92 2C6.99 2 7.19 4.14 7.19 4.14V6.18H12.16V6.89H5.23C5.23 5.23 5.23 4.14 5.23 4.14C2.11 4.14 2 7.15 2 7.15V10.15C2 10.15 1.83 12.16 5.23 12.16H6.18V10.96C6.18 8.63 8.23 8.24 8.23 8.24H12.16C12.16 8.24 15.11 8.24 15.11 5.23V3.14C15.11 3.14 15.11 2 11.92 2Z" fill="#306998"/>
              <path d="M12.08 22C17.01 22 16.81 19.86 16.81 19.86V17.82H11.84V17.11H18.77C18.77 18.77 18.77 19.86 18.77 19.86C21.89 19.86 22 16.85 22 16.85V13.85C22 13.85 22.17 11.84 18.77 11.84H17.82V13.04C17.82 15.37 15.77 15.76 15.77 15.76H11.84C11.84 15.76 8.89 15.76 8.89 18.77V20.86C8.89 20.86 8.89 22 12.08 22Z" fill="#FFD43B"/>
            </svg>
          </div>
        </Link>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {slides.map((url, index) => (
          <div key={index} className={`absolute inset-0 transition-all duration-[2500ms] ${index === currentSlide ? 'opacity-30 scale-110' : 'opacity-0 scale-100'}`}
            style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        ))}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]' : 'bg-gradient-to-b from-transparent via-white/40 to-[#536374]'}`} />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-12 px-6 max-w-7xl w-full">
          <div className="text-center lg:text-left flex-1">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-[1.1]">
              Domptez <span className="text-[#FFD43B]">Python</span><br/>
              <span className="text-[#306998]">Illuminez</span> le Code.
            </h1>
            <p className={`text-base md:text-lg max-w-xl mx-auto lg:mx-0 mb-8 md:mb-10 font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              L'académie immersive où la théorie devient pratique. Transformez vos idées en algorithmes puissants.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/apprendre/register" className="w-full sm:w-auto px-8 py-4 bg-[#FFD43B] text-black font-black uppercase text-[11px] tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl text-center">
                S'inscrire
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[320px] md:max-w-[400px] animate-float">
            <div className={`rounded-2xl overflow-hidden shadow-2xl border transition-all ${isDark ? 'bg-[#0d1117]/95 border-white/10' : 'bg-white/70  border-black/10'}`}>
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"/><div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"/><div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"/></div>
                <span className="text-[9px] md:text-[10px] font-mono opacity-40 uppercase tracking-widest">lumina_terminal.py</span>
              </div>
              <div className="p-6 md:p-8 font-mono text-xs md:text-sm text-left">
                <p className="text-[#306998] mb-1">
                   {">>> "} <span className="text-[#c2b11bd5]">print</span>(<span className="text-green-400">"Success"</span>)
                </p>
                <p className={`${isDark ? 'text-white/40' : 'text-black/80'}`}>Success</p>
                <p className="text-[#306998] mt-2">
                   {">>> "} <span className="text-[#c7a014]">status</span> = <span className="text-green-400">"Online"</span>
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#FFD43B] animate-pulse" />
                  <span className="text-[9px] uppercase font-black opacity-30">System Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: PILIERS */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[
            { icon: <Trophy />, title: "Quiz", d: "Validez vos compétences avec des tests dynamiques." },
            { icon: <BookOpen />, title: "Théorie", d: "Des concepts clairs, sans superflu, pour maîtriser la logique." },
            { icon: <Code2 />, title: "Pratique", d: "Écrivez et testez votre code directement dans l'app." }
          ].map((item, i) => (
            <div key={i} className={`p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border transition-all hover:translate-y-[-5px] ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-black/5 shadow-lg'}`}>
              <div className="text-[#306998] mb-6">{item.icon}</div>
              <h3 className="text-lg md:text-xl font-black uppercase italic mb-4">{item.title}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: PRÉSENTATION */}
      <section className={`py-20 md:py-32 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070" className="rounded-[2rem] md:rounded-[3rem] shadow-2xl w-full object-cover h-[300px] md:h-auto" alt="Motive" />
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic">Apprendre <span className="text-[#FFD43B]">réellement</span> Python</h2>
            <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>
              Notre plateforme est conçue pour ceux qui veulent comprendre le "pourquoi" derrière le code. Apprenez à votre rythme, sans pression.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3 font-bold text-[#306998] uppercase text-xs tracking-widest">
              <CheckCircle2 size={18} /> Motivation & Rigueur
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICES */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-6">C'est quoi <span className="text-[#306998]">Python</span> ?</h2>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            C'est le langage leader en 2026 pour l'IA et le Web. Sa syntaxe est simple, mais ses possibilités sont infinies.
          </p>
          <ul className="space-y-4">
            {['Leçons Fondamentales', 'Logique de Programmation', 'Scripting Automatisé'].map((s, i) => (
              <li key={i} className="flex items-center gap-3 font-bold text-sm uppercase">
                <div className="w-1.5 h-1.5 bg-[#FFD43B] rounded-full" /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className={`p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] ${isDark ? 'bg-[#0d1117] border border-white/10' : 'bg-white shadow-2xl'}`}>
          <Layers className="text-[#306998] mb-6" />
          <h3 className="font-black uppercase italic mb-4">Notre Programme</h3>
          <p className="text-[10px] md:text-xs text-gray-500 uppercase font-black tracking-widest">Séquence 01 : Les Bases</p>
          <p className="text-[10px] md:text-xs text-gray-500 uppercase font-black tracking-widest mt-2">Séquence 02 : Projets Réels</p>
        </div>
      </section>

      {/* SECTION 4: CTA FINAL */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#306998] rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-8 md:mb-10">Prêt à coder ?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 relative z-10">
            <Link href="/apprendre/register" className="px-10 py-4 bg-[#FFD43B] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:scale-110 transition-all shadow-lg text-center">S'inscrire</Link>
            <Link href="/apprendre/login" className="px-10 py-4 bg-white/10 border border-white/20 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white/20 transition-all text-center">Se Connecter</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-8 md:py-12 border-t text-center transition-colors px-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-500">
          &copy; 2026 LuminaCode - Domptez la machine
        </p>
      </footer>

      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        @media (max-width: 400px) {
          .xs\:inline { display: inline; }
        }
      `}</style>
    </div>
  )
}