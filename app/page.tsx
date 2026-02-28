'use client';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext'; // Import du hook global

export default function Home() {
  // On récupère l'état et la fonction depuis le contexte global
  const { isDark, toggleTheme } = useTheme();

  // Configuration des couleurs selon le thème (inchangé, utilise isDark global)
  const theme = {
    bg: isDark ? '#0d1117' : '#f8f9fa',
    bgGradient: isDark 
      ? 'radial-gradient(circle at 50% 50%, #1a1f2e 0%, #0d1117 70%)'
      : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f2f5 70%)',
    textMain: isDark ? '#ffffff' : '#1a1f2e',
    textSecondary: isDark ? '#8b949e' : '#4a5568',
    cardInner: isDark ? '#0d1123' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    terminalBg: isDark ? 'rgba(48, 105, 152, 0.15)' : 'rgba(48, 105, 152, 0.08)',
    buttonShadow: isDark ? '0 4px 25px rgba(48, 105, 152, 0.4)' : '0 10px 25px rgba(48, 105, 152, 0.15)'
  };

  return (
    <main style={{
      minHeight: '100vh',
      width: '100vw',
      background: theme.bg,
      backgroundImage: theme.bgGradient,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      position: 'relative',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      transition: 'all 0.4s ease'
    }}>

      {/* BOUTON SWITCH THEME (Utilise maintenant toggleTheme global) */}
      <button 
        onClick={toggleTheme} 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          color: isDark ? '#FFD43B' : '#306998',
          transition: 'transform 0.3s ease',
          zIndex: 100 // Assure qu'il reste au dessus
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 512 512">
          {isDark ? (
            <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391.4 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391.4 391l-19.8 107.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.2c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121l19.8-107.9c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 0 192 0 96 96 0 1 0 -192 0z"/>
          ) : (
            <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/>
          )}
        </svg>
      </button>

      <style jsx global>{`
        @keyframes spin-border {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (max-width: 640px) {
          .cards-container { gap: 15px !important; }
          .main-title { margin-top: 10px !important; }
        }
      `}</style>

      {/* Logo Python */}
      <div style={{ marginBottom: '15px', flexShrink: 0 }}>
        <svg viewBox="0 0 128 128" style={{ width: 'clamp(60px, 15vw, 90px)', height: 'auto' }}>
          <linearGradient id="blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5A9FD4" />
            <stop offset="100%" stopColor="#306998" />
          </linearGradient>
          <linearGradient id="yellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD43B" />
            <stop offset="100%" stopColor="#FFE873" />
          </linearGradient>
          <path fill="url(#blue)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" />
          <path fill="url(#yellow)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" />
        </svg>
      </div>

      <h1 className="main-title" style={{
        fontSize: 'clamp(2rem, 8vw, 4.5rem)',
        fontWeight: 900,
        margin: '0 0 10px 0',
        letterSpacing: '-2px',
        lineHeight: 1.1,
        color: theme.textMain
      }}>
        <span style={{ color: '#306998' }}>LUMINA</span>
        <span style={{ color: '#FFD43B' }}>CODE</span>
      </h1>

      <p style={{
        color: '#306998',
        fontFamily: 'monospace',
        fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
        marginBottom: '20px',
        background: theme.terminalBg,
        padding: '8px 15px',
        borderRadius: '20px',
        border: `1px solid ${isDark ? 'rgba(48, 105, 152, 0.3)' : 'rgba(48, 105, 152, 0.15)'}`,
        display: 'inline-block'
      }}>
        {'>>> '}<span style={{ color: isDark ? '#fff' : '#1a1f2e' }}>Apprenez Python pas à pas</span>
      </p>

      <p style={{
        color: theme.textSecondary,
        fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
        maxWidth: '600px',
        lineHeight: 1.6,
        marginBottom: '30px',
        padding: '0 10px'
      }}>
        « Apprenez. Validez. Propulsez. Votre futur Python commence ici. »
      </p>

      {/* CONTAINER DES CARDS */}
      <div className="cards-container" style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '40px',
        width: '100%',
        maxWidth: '1100px',
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap'
      }}>
        {[
          { icon: '📖', titre: 'Théorie', desc: 'Leçons structurées', color: isDark ? 'white' : '#306998' },
          { icon: '📝', titre: 'Quiz', desc: 'Testez vos acquis', color: '#FFD43B' },
          { icon: '💻', titre: 'Pratique', desc: 'Codez en direct', color: '#00ced1' }
        ].map((item, i) => (
          <div
            key={i}
            className="card-container"
            style={{
              position: 'relative',
              flex: '1 1 280px',
              maxWidth: '350px',
              minHeight: '180px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              boxShadow: isDark ? 'none' : '0 10px 30px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              const spinner = e.currentTarget.querySelector('.spinner');
              e.currentTarget.style.transform = 'translateY(-5px)';
              if (spinner) (spinner as HTMLElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              const spinner = e.currentTarget.querySelector('.spinner');
              e.currentTarget.style.transform = 'translateY(0)';
              if (spinner) (spinner as HTMLElement).style.opacity = '0';
            }}
          >
            <div className="spinner" style={{
              position: 'absolute', top: '50%', left: '50%', width: '250%', height: '250%',
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 80deg, ${item.color} 140deg, transparent 230deg)`,
              transform: 'translate(-50%, -50%)',
              animation: 'spin-border 3s linear infinite',
              opacity: 0, transition: 'opacity 0.3s ease', zIndex: 0
            }} />
            
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', zIndex: 1 }} />

            <div style={{
              position: 'relative', zIndex: 2, background: theme.cardInner,
              width: 'calc(100% - 4px)', height: 'calc(100% - 4px)',
              borderRadius: '14px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '25px 15px',
              transition: 'background 0.4s ease'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ color: item.color, fontWeight: 700, marginBottom: '5px' }}>{item.titre}</div>
              <div style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Link href="/apprendre" style={{ textDecoration: 'none', width: '100%', maxWidth: '320px' }}>
        <button style={{
          width: '100%',
          padding: '16px 30px',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: isDark ? '#0d1117' : '#ffffff',
          background: isDark 
            ? 'linear-gradient(135deg, #306998, #FFD43B)' 
            : 'linear-gradient(135deg, #306998 0%, #4a90e2 100%)',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: theme.buttonShadow
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
          e.currentTarget.style.boxShadow = isDark 
            ? '0 8px 30px rgba(255, 212, 59, 0.4)' 
            : '0 12px 30px rgba(48, 105, 152, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = theme.buttonShadow;
        }}>
          🐍 Commencer maintenant
        </button>
      </Link>
    </main>
  );
}