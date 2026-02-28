'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Lock, Terminal, Sun, Moon, Menu, Download, Play, CheckCircle, ChevronRight, LogOut, Loader2
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { jsPDF } from 'jspdf';
import { useTheme } from '@/context/ThemeContext'; 

// Coloration
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; 

// --- CORRECTION DU TYPE POUR ÉVITER L'ERREUR VERCEL ---
declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<{
      runPythonAsync: (code: string) => Promise<string>;
      runPython: (code: string) => any;
    }>;
  }
}
interface Chapitre {
  id: number;
  titre: string;
  lecon: string;
  questions_cours: { q: string; r: string }[];
  exercices: { q: string; expected: string }[];
  terminal_requis: boolean;
}

export default function ApprendrePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  const { isDark: isDarkMode, toggleTheme } = useTheme();

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [data, setData] = useState<Chapitre[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(Number(params.id) - 1 || 0);
  const [unlockedStep, setUnlockedStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pyLoading, setPyLoading] = useState(true);

  // --- DÉCONNEXION ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/apprendre/login';
  };

  // --- LOGIQUE PDF ---
  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const cleanContent = current.lecon.replace(/<[^>]*>/g, '');

    doc.setFillColor(48, 105, 152);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("LuminaCode - Python", margin, 16);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(22);
    doc.text(current.titre, margin, 45);
    doc.setDrawColor(234, 179, 8);
    doc.line(margin, 50, 60, 50);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(cleanContent.trim(), pageWidth - (margin * 2));
    doc.text(splitText, margin, 65);
    doc.save(`LuminaCode_${current.titre.replace(/\s+/g, '_')}.pdf`);
    showToast("📄 PDF généré !");
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [codeInput, setCodeInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isChapterFinished, setIsChapterFinished] = useState(false);

  const pyodideRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (pairs[e.key]) {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const char = e.key;
      const closingChar = pairs[char];
      const newValue = codeInput.substring(0, selectionStart) + char + closingChar + codeInput.substring(selectionEnd);
      setCodeInput(newValue);
      setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = selectionStart + 1; }, 0);
    }
  };

  // --- INIT PYTHON ---
  useEffect(() => {
    async function initPython() {
      if (typeof window !== 'undefined' && window.loadPyodide && !pyodideRef.current) {
        try {
          pyodideRef.current = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
          setPyLoading(false);
        } catch (err) { console.error(err); }
      }
    }
    initPython();
  }, []);

  // --- CHARGEMENT DES DONNÉES ET PROGRESSION ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/apprendre/login');

        const res = await fetch('/donnees.json');
        const json = await res.json();
        setData(json.chapitres || []);

        const { data: prog } = await supabase.from('progressions').select('completed_steps').eq('user_id', session.user.id).maybeSingle();
        if (prog?.completed_steps) {
          setCompletedSteps(prog.completed_steps);
          const max = Math.max(...prog.completed_steps, 0);
          setUnlockedStep(max + 1); // Déverrouille le suivant
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    loadData();
  }, [supabase, router]); 

  // --- SAUVEGARDE DU NIVEAU ACTUEL (L'ENDROIT OÙ IL S'ARRÊTE) ---
  useEffect(() => {
    const syncCurrentPosition = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && params.id) {
        // AJOUT : On enregistre que l'utilisateur est sur ce niveau précisément
        await supabase.from('progressions').upsert({
          user_id: user.id,
          user_email: user.email,
          last_level_visited: Number(params.id),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      }
    };
    syncCurrentPosition();

    const stepIdx = Number(params.id) - 1;
    if (stepIdx >= 0 && data.length > 0) {
      setCurrentStep(stepIdx);
      setAnswers({});
      setCodeInput('');
      setCodeOutput('');
      setCurrentExIndex(0);
      setIsChapterFinished(completedSteps.includes(stepIdx));
    }
  }, [params.id, data, completedSteps, supabase]);

  const current = data[currentStep];

  const validateExercise = async () => {
    if (!pyodideRef.current) return showToast("Python charge...");
    try {
      await pyodideRef.current.runPythonAsync(`import sys, io\nsys.stdout = io.StringIO()`);
      await pyodideRef.current.runPythonAsync(codeInput);
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()").trim();
      setCodeOutput(stdout);

      if (stdout === current.exercices[currentExIndex].expected.trim()) {
        showToast("✅ Correct !");
        if (currentExIndex < current.exercices.length - 1) {
          setTimeout(() => { setCurrentExIndex(i => i + 1); setCodeInput(''); setCodeOutput(''); }, 1500);
        } else {
          setTimeout(() => { completeChapter(); }, 1500);
        }
      } else {
        showToast("❌ La sortie ne correspond pas.");
      }
    } catch (err: any) { setCodeOutput(err.message); }
  };

  const completeChapter = async () => {
    const nextLevelIndex = currentStep + 1;
    setIsChapterFinished(true);
    
    const newCompleted = Array.from(new Set([...completedSteps, currentStep]));
    setCompletedSteps(newCompleted);
    
    // AJOUT : Calcul du nouvel unlockedStep basé sur le chapitre fini
    if (nextLevelIndex > unlockedStep) setUnlockedStep(nextLevelIndex);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // AJOUT : On met à jour completed_steps ET on prépare déjà le last_level_visited pour le suivant
      await supabase.from('progressions').upsert({
        user_id: user.id,
        user_email: user.email,
        completed_steps: newCompleted,
        last_level_visited: nextLevelIndex + 1, // On le prépare pour le niveau d'après
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }
    showToast("🏆 Niveau Terminé !");
  };

  const handleNext = () => {
    const next = currentStep + 1;
    if (next < data.length) {
      router.push(`/apprendre/${next + 1}`);
    }
  };

  if (loading || !current) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 border-2 border-[#306998]/20 rounded-full animate-ping" />
        <Loader2 className="w-10 h-10 text-[#306998] animate-spin" />
      </div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#306998] animate-pulse">LuminaCode Séquence_Init</p>
    </div>
  );

  return (
    <main className={`h-screen flex flex-col lg:flex-row transition-colors duration-500 ${isDarkMode ? 'bg-[#0D1117] text-slate-300' : 'bg-[#F8FAFC] text-slate-700'}`}>
      
      <style jsx global>{`
        .token.comment { color: ${isDarkMode ? '#6a9955' : '#94a3b8'}; }
        .token.keyword { color: ${isDarkMode ? '#569cd6' : '#306998'}; font-weight: bold; }
        .token.string { color: ${isDarkMode ? '#ce9178' : '#059669'}; }
        .token.function { color: ${isDarkMode ? '#dcdcaa' : '#7c3aed'}; }
        .token.operator { color: ${isDarkMode ? '#d4d4d4' : '#64748b'}; }
        .token.punctuation { color: ${isDarkMode ? '#d4d4d4' : '#EAB308'}; }
      `}</style>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-[#0A0B10] border-white/5' : 'bg-white border-slate-200 shadow-xl'} border-r overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 select-none">
              <div className="p-2 bg-[#306998] rounded-lg text-white"><Terminal size={20} /></div>
              <h1 className="text-xl font-black">
                <span className="text-[#306998]">Lumina</span><span className="text-[#FFD43B]">Code</span>
              </h1>
          </div>
          <nav className="space-y-1">
            {data.map((chap, idx) => (
              <button
                key={chap.id}
                disabled={idx > unlockedStep}
                onClick={() => { router.push(`/apprendre/${idx + 1}`); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all ${currentStep === idx ? 'bg-[#306998] text-white shadow-lg' : idx > unlockedStep ? 'opacity-20 grayscale' : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
              >
                <span className="w-4">{idx > unlockedStep ? <Lock size={12} /> : idx + 1}</span>
                <span className="truncate">{chap.titre}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        <header className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2"><Menu /></button>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${pyLoading ? 'text-yellow-500 bg-yellow-500/10' : 'text-green-500 bg-green-500/10'}`}>
              {pyLoading ? 'PYTHON_LOADING...' : 'PYTHON_READY'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-[#306998]" />}
            </button>
            <div className={`w-[1px] h-4 mx-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${isDarkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-500/5'}`}
            >
              <LogOut size={16} /> <span className="hidden sm:inline">DÉCONNEXION</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-8 lg:p-10 rounded-3xl border ${isDarkMode ? 'bg-[#161B22] border-white/5 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`prose ${isDarkMode ? 'prose-invert' : 'prose-slate'} max-w-none
                prose-h2:text-[#306998] prose-h2:border-l-4 prose-h2:border-[#306998] prose-h2:pl-4 prose-h2:font-black
                prose-h3:text-[#FFD43B] prose-h3:font-bold`}>
                <h1 className="text-3xl font-black mb-6">{current.titre}</h1>
                <div dangerouslySetInnerHTML={{ __html: current.lecon }} />
              </div>
            </div>

            {current.questions_cours.length > 0 && (
              <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-[#161B22] border-white/5' : 'bg-white border-slate-200'}`}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#306998]"><CheckCircle size={20} /> Quiz Rapide</h3>
                <div className="space-y-4">
                  {current.questions_cours.map((q, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium mb-2 opacity-80">{q.q}</p>
                      <input 
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-[#306998] transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-[#F1F5F9] border-slate-200 text-slate-800'}`}
                        value={answers[i] || ''}
                        onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  let ok = true;
                  current.questions_cours.forEach((q, i) => { if(!(answers[i] || '').toLowerCase().includes(q.r.toLowerCase())) ok = false; });
                  if(ok) { showToast("✅ Quiz validé !"); if(!current.terminal_requis) completeChapter(); }
                  else showToast("❌ Vérifiez vos réponses.");
                }} className="mt-6 bg-[#306998] px-8 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 shadow-lg">VÉRIFIER</button>
              </div>
            )}

            {current.terminal_requis && (
              <div className="mt-10 space-y-4">
                <h2 className="text-xl font-bold px-2 flex items-center gap-2 font-black uppercase tracking-widest text-[11px] opacity-50">
                   <Terminal size={18} className="text-[#306998]" /> Éditeur de code
                </h2>
                <div className={`p-5 rounded-2xl border-l-4 border-[#306998] ${isDarkMode ? 'bg-[#306998]/10 text-blue-100 border-white/5' : 'bg-[#306998]/5 text-[#306998] border-[#306998]'}`}>
                  {current.exercices[currentExIndex]?.q}
                </div>
                
                <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#010409] border-white/10' : 'bg-[#F1F5F9] border-slate-200 shadow-inner'}`}>
                  <Editor
                    value={codeInput}
                    onValueChange={c => setCodeInput(c)}
                    highlight={c => highlight(c, languages.python, 'python')}
                    onKeyDown={handleKeyDown}
                    padding={25}
                    className={`font-mono text-sm min-h-[250px] ${!isDarkMode ? 'text-slate-800' : ''}`}
                  />
                  <div className={`p-4 flex justify-end border-t ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white/50 border-slate-200'}`}>
                    <button onClick={validateExercise} className="flex items-center gap-2 px-6 py-2 bg-[#306998] text-white rounded-lg font-bold transition-transform active:scale-95 shadow-md">
                      <Play size={16} fill="currentColor"/> TESTER
                    </button>
                  </div>
                </div>

                {codeOutput && (
                  <div className={`p-5 rounded-2xl border font-mono text-xs animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-black text-green-400 border-white/5' : 'bg-slate-800 text-green-300 border-slate-700 shadow-lg'}`}>
                    <pre className="whitespace-pre-wrap">{codeOutput}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className={`p-5 border-t flex justify-between items-center ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={downloadPDF}
            className={`p-4 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
          >
            <Download size={20} />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!isChapterFinished && currentStep >= unlockedStep}
            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all 
              ${isChapterFinished || currentStep < unlockedStep 
                ? 'bg-[#306998] text-white shadow-lg hover:scale-105 active:scale-95' 
                : isDarkMode ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400'}`}
          >
            Niveau Suivant <ChevronRight size={18} />
          </button>
        </footer>
      </section>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-8 py-4 rounded-2xl shadow-2xl z-[9999] text-white font-bold animate-in slide-in-from-right-full ${toast.includes('❌') ? 'bg-red-500' : 'bg-green-600'}`}>
          {toast}
        </div>
      )}
    </main>
  );
}