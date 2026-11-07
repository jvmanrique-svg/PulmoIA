import React from 'react';
import { TabType } from '../types';
import { Home, PlusCircle, History, Bot, Stethoscope } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'inicio' as TabType, label: 'Inicio', icon: Home },
    { id: 'asistente' as TabType, label: 'PulmoBot', icon: Bot },
    { id: 'registrar' as TabType, label: 'Registrar', icon: PlusCircle, isMain: true },
    { id: 'historial' as TabType, label: 'Historial', icon: History },
    { id: 'medico' as TabType, label: 'Médico', icon: Stethoscope },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-lg transition-colors duration-200">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                  isActive ? 'bg-sky-600 shadow-sky-600/40 ring-4 ring-sky-100 dark:ring-sky-950' : 'bg-sky-600 shadow-sky-600/30 hover:bg-sky-700'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all focus:outline-none ${
                isActive 
                  ? 'text-sky-600 dark:text-sky-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
