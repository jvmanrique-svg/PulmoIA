import React from 'react';
import { PatientProfile } from '../types';
import { Activity, LogOut, User } from 'lucide-react';

interface HeaderProps {
  patient: PatientProfile;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  patient, 
  onOpenProfile, 
  onNavigateHome,
  onLogout 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base leading-none">PulmoIA</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-full">Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Control Respiratorio</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
            title="Abrir perfil del paciente"
          >
            <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
              {patient.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold max-w-[85px] truncate">{patient.name.split(' ')[0]}</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
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
