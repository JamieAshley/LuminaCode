export {};

declare global {
  interface Window {
    loadPyodide: () => Promise<{
      runPythonAsync: (code: string) => Promise<string>;
    }>;
  }
}