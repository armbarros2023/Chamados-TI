import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button type="button" onClick={toggleTheme} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 ${className}`} aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'} title={isDark ? 'Tema claro' : 'Tema escuro'}>
      {isDark ? <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4" /><path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg> : <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 15.1A8.25 8.25 0 0 1 8.9 3.75 8.25 8.25 0 1 0 20.25 15.1Z" /></svg>}
    </button>
  );
};

export default ThemeToggle;
