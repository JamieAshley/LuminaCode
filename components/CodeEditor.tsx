'use client';
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

// Interface pour typer l'objet Pyodide
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<string>;
}

interface CodeEditorProps {
  initialCode?: string;
  onValidation?: (output: string) => void;
}

export default function CodeEditor({ initialCode = "", onValidation }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("Prêt.");
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    async function load() {
      if (typeof window !== "undefined") {
        const win = window as unknown as { loadPyodide: () => Promise<PyodideInterface> };
        if (win.loadPyodide) {
          try {
            const res = await win.loadPyodide();
            setPyodide(res);
            setOutput("Python est prêt !");
          } catch { 
            // On ne met pas (err) si on ne s'en sert pas, 
            // ça évite l'avertissement "unused variable"
            setOutput("Erreur de chargement du moteur Python.");
          }
        }
      }
    }
    load();
  }, []);

  const runCode = async () => {
    if (!pyodide) return;
    
    setOutput("Exécution...");
    try {
      // Configuration de la capture de sortie (stdout)
      await pyodide.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
      `);
      
      await pyodide.runPythonAsync(code);
      const result = await pyodide.runPythonAsync("sys.stdout.getvalue()");
      const finalOutput = result.trim();
      
      setOutput(finalOutput || "Code exécuté avec succès (pas de sortie).");
      setIsSuccess(true);
      
      if (onValidation) onValidation(finalOutput);

    } catch (err: unknown) {
      let msg = "Erreur inconnue";
      if (err instanceof Error) msg = err.message;
      setOutput("Erreur Python :\n" + msg);
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full text-left">
      <div className="rounded-xl overflow-hidden border-2 border-blue-500 shadow-xl">
        <Editor
          height="300px"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{ fontSize: 16, minimap: { enabled: false }, automaticLayout: true }}
        />
      </div>
      <button 
        onClick={runCode}
        disabled={!pyodide}
        className={`font-bold py-3 px-6 rounded-lg transition-all ${
          !pyodide ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {pyodide ? "▶ Exécuter et Valider" : "Initialisation..."}
      </button>
<div className={`bg-black p-4 rounded-lg border border-slate-700 font-mono text-sm min-h-24 ${isSuccess ? 'text-green-400' : 'text-red-500'}`}>
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}