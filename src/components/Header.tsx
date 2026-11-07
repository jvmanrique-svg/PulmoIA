import React from 'react';
import { PatientProfile, ThemeMode } from '../types';
import { Activity, LogOut, Sun, Moon, Database } from 'lucide-react';

interface HeaderProps {
  patient: PatientProfile;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
  onOpenCloudSync?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  patient, 
  theme,
  onToggleTheme,
  onOpenProfile, 
  onNavigateHome,
  onOpenCloudSync,
  onLogout 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base leading-none">PulmoIA</span>
              <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold px-1.5 py-0.5 rounded-full">Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Control Respiratorio</p>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Botón de Modo Oscuro / Claro */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar tema oscuro y claro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-300" />
            )}
          </button>

          {/* Botón de Persistencia / Nube */}
          {onOpenCloudSync && (
            <button
              type="button"
              onClick={onOpenCloudSync}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Respaldo y Nube (IndexedDB / Supabase / Firebase)"
            >
              <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </button>
          )}

          {/* Perfil del paciente */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 ml-1"
            title="Abrir perfil del paciente"
          >
            <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
              {patient.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold max-w-[75px] truncate hidden xs:inline">{patient.name.split(' ')[0]}</span>
          </button>

          {/* Cerrar sesión */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
