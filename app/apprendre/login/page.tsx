/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Terminal, Zap, ChevronRight, Mail, Lock, CheckCircle2, AlertCircle, X, Loader2, ShieldCheck, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext' // 1. Import du Hook Global

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // 2. Récupération du thème global
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  // GESTION DU POP-UP (TOAST)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'loading'} | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (toast && toast.type !== 'loading') {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showNotify = (message: string, type: 'success' | 'error' | 'loading') => {
    setToast({ message, type })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    showNotify("Initialisation de la séquence d'accès...", 'loading');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data?.user) {
        const { data: prog } = await supabase
          .from('progressions')
          .select('completed_steps')
          .eq('user_id', data.user.id)
          .maybeSingle();

        let startLevel = 1;
        if (prog?.completed_steps && prog.completed_steps.length > 0) {
          startLevel = Math.max(...prog.completed_steps) + 2; 
        }

        showNotify("Signature digitale validée. Accès autorisé.", 'success');

        setTimeout(() => {
          window.location.replace(`/apprendre/${startLevel}`);
        }, 1200);
      }
    } catch (err: any) {
      showNotify(err.message || "Échec de l'authentification", 'error');
      setLoading(false);
    }
  };

  if (!mounted) return null

  return (
    // 3. Application dynamique des couleurs de fond via isDarkMode
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#FFD43B] selection:text-black transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-[#F8FAFC]'}`}>
      
      {/* BOUTON SWITCH THÈME (Optionnel mais pratique ici) */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 left-6 z-[110] p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-[#306998]/20 transition-all"
      >
        {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-[#306998]" />}
      </button>

      {/* POP-UP (TOAST) */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[100] flex items-center gap-5 p-6 rounded-3xl border backdrop-blur-3xl animate-toast-in shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all overflow-hidden ${
          toast.type === 'success' ? 'bg-[#306998]/20 border-[#FFD43B]/40 text-white' : 
          toast.type === 'loading' ? 'bg-black/80 border-[#306998]/30 text-white' :
          'bg-red-500/10 border-red-500/30 text-red-200'
        }`}>
          {toast.type === 'loading' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#306998]/10 to-transparent h-1/2 w-full animate-scan" />
            </div>
          )}

          <div className={`relative p-3 rounded-2xl flex items-center justify-center ${
            toast.type === 'success' ? 'bg-[#FFD43B]/20' : 
            toast.type === 'loading' ? 'bg-[#306998]/20' : 'bg-red-500/20'
          }`}>
            {toast.type === 'success' && <ShieldCheck size={24} className="text-[#FFD43B] animate-pulse" />}
            {toast.type === 'loading' && <Loader2 size={24} className="text-[#306998] animate-spin" />}
            {toast.type === 'error' && <AlertCircle size={24} className="text-red-500" />}
          </div>
          
          <div className="relative flex flex-col min-w-[200px]">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">
              {toast.type === 'success' ? 'Terminal : Success' : toast.type === 'loading' ? 'Terminal : Processing' : 'Terminal : Abort'}
            </p>
            <p className="text-sm font-bold tracking-wider italic">
              {toast.message}
            </p>
          </div>

          {toast.type !== 'loading' && (
            <button onClick={() => setToast(null)} className="relative z-10 opacity-30 hover:opacity-100 transition-all hover:rotate-90">
              <X size={20} />
            </button>
          )}

          {toast.type !== 'loading' && (
            <div className={`absolute bottom-0 left-0 h-[3px] rounded-full animate-progress ${
              toast.type === 'success' ? 'bg-[#FFD43B]' : 'bg-red-500'
            }`} />
          )}
        </div>
      )}

      {/* FOND ANIMÉ */}
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse transition-opacity duration-1000 ${isDarkMode ? 'bg-[#306998]/10' : 'bg-[#306998]/5'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse delay-1000 transition-opacity duration-1000 ${isDarkMode ? 'bg-[#FFD43B]/10' : 'bg-[#FFD43B]/5'}`} />

      {/* FORMULAIRE */}
      <div className="relative w-full max-w-[480px] group animate-fade-in-up">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#306998] via-[#FFD43B] to-[#306998] rounded-[2.5rem] opacity-20 group-hover:opacity-100 group-hover:blur-[2px] transition-all duration-700"></div>
        
        <div className={`relative backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border shadow-2xl transition-all duration-500 group-hover:translate-y-[-4px] ${isDarkMode ? 'bg-[#0d1117]/95 border-white/5' : 'bg-white/90 border-slate-200'}`}>
          
          <div className="text-center mb-10 animate-slide-down">
            <div className="relative inline-flex items-center justify-center mb-4 group/logo">
              <div className={`p-4 rounded-2xl border shadow-inner transition-all duration-500 group-hover/logo:border-[#FFD43B]/50 ${isDarkMode ? 'bg-black border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <Terminal className="w-10 h-10 text-[#FFD43B]" />
                <Zap className="w-5 h-5 text-[#306998] absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>
            <h1 className={`text-4xl font-black tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Lumina<span className="text-[#FFD43B]">Code</span>
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 opacity-0 animate-fade-in delay-200" style={{ animationFillMode: 'forwards' }}>
              <label className="text-[10px] font-bold text-[#306998] uppercase tracking-[0.2em] ml-2 transition-colors">Utilisateur</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#306998] w-4 h-4 opacity-30 group-focus-within/input:opacity-100 transition-all z-10" />
                <input 
                  type="email" 
                  required
                  placeholder="nom@exemple.com"
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full border p-4 pl-12 rounded-2xl outline-none focus:border-[#306998] transition-all ${isDarkMode ? 'bg-black/50 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>
            
            <div className="space-y-2 opacity-0 animate-fade-in delay-300" style={{ animationFillMode: 'forwards' }}>
              <label className="text-[10px] font-bold text-[#306998] uppercase tracking-[0.2em] ml-2">Mot de passe</label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD43B] w-4 h-4 opacity-30 group-focus-within/input:opacity-100 transition-all z-10" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)} 
                  className={`w-full border p-4 pl-12 pr-12 rounded-2xl outline-none focus:border-[#FFD43B] transition-all ${isDarkMode ? 'bg-black/50 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#FFD43B] z-20">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full relative group/btn overflow-hidden h-[60px] rounded-2xl bg-[#306998] transition-all active:scale-[0.97] opacity-0 animate-fade-in delay-500"
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD43B] to-[#FFE873] translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500 flex items-center justify-center text-black font-black uppercase tracking-widest gap-2">
                Initialiser <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </div>
              <span className="relative z-10 text-white font-black uppercase tracking-widest group-hover/btn:opacity-0 transition-opacity">
                {loading ? 'Séquence...' : 'Se Connecter'}
              </span>
            </button>
          </form>

          <div className="mt-10 text-center opacity-0 animate-fade-in delay-700" style={{ animationFillMode: 'forwards' }}>
            <Link href="/apprendre/register" className={`text-[11px] font-bold uppercase tracking-widest transition-all inline-flex items-center gap-1 group/link ${isDarkMode ? 'text-gray-500 hover:text-[#FFD43B]' : 'text-slate-400 hover:text-[#306998]'}`}>
              Nouveau ici ? <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover/link:underline decoration-[#306998]`}>Créer un compte</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast-in { from { opacity: 0; transform: translateX(30px) scale(0.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
        @keyframes progress { from { width: 100%; } to { width: 0%; } }
        @keyframes scan { 
          0% { transform: translateY(-100%); } 
          100% { transform: translateY(200%); } 
        }
        .animate-scan { animation: scan 1.5s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.8s ease-out; }
        .animate-toast-in { animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-progress { animation: progress 5s linear forwards; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  )
}