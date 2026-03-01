/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, ChevronRight, Cpu, Zap, Lock, AlertCircle, CheckCircle2, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext' // 1. Import du Hook Global

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // 2. Récupération du thème global
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  // GESTION DU POP-UP (TOAST)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  
  const router = useRouter()

  useEffect(() => { 
    setMounted(true) 
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showNotify = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

 const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // LA SOLUTION EST ICI : 
      // On vérifie explicitement que data et data.user ne sont pas null
      if (data && data.user) {
        showNotify("Séquence d'accès validée. Initialisation...", 'success');
        
        // TypeScript sait maintenant que data.user n'est pas null ici
        const userId = data.user.id; 
        
        setTimeout(() => {
          router.push(`/apprendre/${userId}`);
        }, 1500);
      } else {
        showNotify("Vérifiez vos emails pour valider l'accès.", 'success');
      }
    } catch (err: any) {
      showNotify(err.message || "Erreur d'authentification", 'error');
    } finally {
      setLoading(false);
    }
  };
  if (!mounted) return null

  return (
    // 3. Application dynamique du background
    <div className={`min-h-screen lg:h-screen w-full flex items-center justify-center py-10 lg:py-0 px-4 lg:overflow-hidden relative font-sans selection:bg-[#FFD43B] selection:text-black transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
      
      {/* BOUTON SWITCH THÈME */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 left-6 z-[110] p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md hover:bg-[#306998]/20 transition-all"
      >
        {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-[#306998]" />}
      </button>

      {/* COMPOSANT POP-UP (TOAST) */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl animate-toast-in shadow-2xl ${
          toast.type === 'success' 
          ? 'bg-[#306998]/20 border-[#306998]/50 text-white' 
          : 'bg-red-500/10 border-red-500/50 text-red-200'
        }`}>
          <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-[#306998]/30' : 'bg-red-500/20'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} className="text-[#FFD43B]" /> : <AlertCircle size={20} />}
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{toast.type === 'success' ? 'Système' : 'Erreur Critique'}</p>
            <p className="text-sm font-bold leading-tight">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
          <div className={`absolute bottom-0 left-0 h-[2px] rounded-full animate-progress ${toast.type === 'success' ? 'bg-[#FFD43B]' : 'bg-red-500'}`} />
        </div>
      )}

      {/* LUMIÈRES D'AMBIANCE */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse transition-opacity duration-1000 ${isDarkMode ? 'bg-[#FFD43B]/10' : 'bg-[#FFD43B]/5'}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse delay-1000 transition-opacity duration-1000 ${isDarkMode ? 'bg-[#306998]/10' : 'bg-[#306998]/5'}`} />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in-up my-auto group">
        
        {/* BORDURE LASER TOURNANTE */}
        <div className="absolute -inset-[2px] rounded-[2.6rem] overflow-hidden">
          <div className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#306998_0%,#FFD43B_25%,#306998_50%,#FFD43B_75%,#306998_100%)] opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
        </div>
        
        <div className={`relative backdrop-blur-3xl p-8 sm:p-10 rounded-[2.5rem] border shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:scale-[1.01] ${isDarkMode ? 'bg-[#0d1117]/95 border-white/10' : 'bg-white/90 border-slate-200 shadow-slate-200'}`}>
          
          {/* HEADER LOGO */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="relative inline-flex items-center justify-center mb-4 group/logo">
              <div className={`p-4 rounded-2xl border transition-all duration-700 group-hover/logo:border-[#FFD43B] ${isDarkMode ? 'bg-black border-[#306998]/30 shadow-inner' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                <Cpu className="w-8 h-8 text-[#FFD43B]" />
                <Zap className="w-4 h-4 text-[#306998] absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <h1 className={`text-3xl font-black tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Lumina<span className="text-[#306998]">Code</span>
            </h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* INPUT USERNAME */}
            <div className="space-y-2 opacity-0 animate-fade-in delay-150" style={{ animationFillMode: 'forwards' }}>
              <label className="text-[11px] font-black text-[#FFD43B] uppercase tracking-[0.25em] ml-2 block italic">Identité Digitale</label>
              <div className="relative group/in">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD43B] w-4 h-4 opacity-0 scale-50 group-hover/in:opacity-100 group-focus-within/in:opacity-100 group-hover/in:scale-110 transition-all duration-500 z-10" />
                <input 
                  type="text" 
                  required
                  placeholder="Python_Explorer"
                  onChange={(e) => setUsername(e.target.value)} 
                  className={`w-full border p-4 pl-6 group-hover/in:pl-12 group-focus-within/in:pl-12 rounded-2xl outline-none focus:border-[#FFD43B] transition-all duration-500 placeholder:text-gray-700 ${isDarkMode ? 'bg-black/60 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>

            {/* INPUT EMAIL */}
            <div className="space-y-2 opacity-0 animate-fade-in delay-300" style={{ animationFillMode: 'forwards' }}>
              <label className="text-[11px] font-black text-[#FFD43B] uppercase tracking-[0.25em] ml-2 block italic">Port Email</label>
              <div className="relative group/in">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD43B] w-4 h-4 opacity-0 scale-50 group-hover/in:opacity-100 group-focus-within/in:opacity-100 group-hover/in:scale-110 transition-all duration-500 z-10" />
                <input 
                  type="email" 
                  required
                  placeholder="dev@lumina.com"
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full border p-4 pl-6 group-hover/in:pl-12 group-focus-within/in:pl-12 rounded-2xl outline-none focus:border-[#FFD43B] transition-all duration-500 placeholder:text-gray-700 ${isDarkMode ? 'bg-black/60 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>
            
            {/* INPUT PASSWORD */}
            <div className="space-y-2 opacity-0 animate-fade-in delay-450" style={{ animationFillMode: 'forwards' }}>
              <label className="text-[11px] font-black text-[#306998] uppercase tracking-[0.25em] ml-2 block italic">Clé de Cryptage</label>
              <div className="relative group/in">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#306998] w-4 h-4 opacity-0 scale-50 group-hover/in:opacity-100 group-focus-within/in:opacity-100 group-hover/in:scale-110 transition-all duration-500 z-10" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)} 
                  className={`w-full border p-4 pl-6 group-hover/in:pl-12 group-focus-within/in:pl-12 pr-12 rounded-2xl outline-none focus:border-[#306998] transition-all duration-500 placeholder:text-gray-700 ${isDarkMode ? 'bg-black/60 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#306998] z-20">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full relative group/btn overflow-hidden h-[60px] mt-2 rounded-2xl bg-[#FFD43B] transition-all duration-500 active:scale-[0.97]"
            >
              <div className="absolute inset-0 bg-[#306998] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 flex items-center justify-center z-20">
                <span className="text-white font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  Validation <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </div>
              <span className="relative z-10 text-black font-black uppercase tracking-[0.2em] block group-hover/btn:-translate-y-full transition-all duration-500">
                {loading ? 'Séquence...' : "S'inscrire"}
              </span>
            </button>
          </form>

          {/* LIEN VERS CONNEXION */}
          <div className="mt-8 text-center opacity-0 animate-fade-in delay-700" style={{ animationFillMode: 'forwards' }}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
              Déjà un compte ? 
              <Link href="/apprendre/login" className={`ml-2 border-b transition-all duration-300 pb-0.5 ${isDarkMode ? 'text-white border-[#FFD43B]/50 hover:border-[#306998] hover:text-[#FFD43B]' : 'text-slate-900 border-[#306998]/50 hover:border-[#FFD43B] hover:text-[#306998]'}`}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast-in { 
          from { opacity: 0; transform: translateX(50px) scale(0.9); } 
          to { opacity: 1; transform: translateX(0) scale(1); } 
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-in { animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-progress { animation: progress 5s linear forwards; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.8s ease-out; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-450 { animation-delay: 0.45s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  )
}