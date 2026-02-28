'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // On initialise à true par défaut pour éviter le flash blanc au chargement (SSR)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // 1. Vérifier si un choix existe déjà dans le stockage local
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    } else {
      // 2. Sinon, on suit les préférences du système
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(systemPrefersDark)
    }

    // 3. Écouter les changements du système en temps réel
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) { // On ne change que si l'utilisateur n'a pas forcé un choix
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)