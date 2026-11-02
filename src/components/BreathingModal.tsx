import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw, HeartPulse } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = 'inhala' | 'sosten' | 'exhala';

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<Phase>('inhala');
  const [counter, setCounter] = useState<number>(4);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      setPhase('inhala');
      setCounter(4);
      return;
    }

    if (!isActive) return;

    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev > 1) return prev - 1;

        // Cambiar fase del ciclo 4-7-8
        if (phase === 'inhala') {
          setPhase('sosten');
          return 7;
        } else if (phase === 'sosten') {
          setPhase('exhala');
          return 8;
        } else {
          setPhase('inhala');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  const phaseConfig = {
    inhala: {
      text: 'Inhala suavemente por la nariz',
      color: 'bg-teal-500 scale-125',
      badge: 'bg-teal-100 text-teal-800',
    },
    sosten: {
      text: 'Mantén el aire con calma',
      color: 'bg-sky-500 scale-110',
      badge: 'bg-sky-100 text-sky-800',
    },
    exhala: {
      text: 'Exhala despacio con labios fruncidos',
      color: 'bg-indigo-500 scale-90',
      badge: 'bg-indigo-100 text-indigo-800',
    },
  }[phase];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-sm">Respiración Guiada 4-7-8</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Círculo animado */}
        <div className="my-8 relative flex items-center justify-center">
          <div
            className={`w-36 h-36 rounded-full transition-all duration-1000 flex items-center justify-center text-white font-black text-4xl shadow-xl ${phaseConfig.color}`}
          >
            {isActive ? counter : '4-7-8'}
          </div>
        </div>

        {/* Indicador de fase */}
        <div className="space-y-1 mb-6">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${phaseConfig.badge}`}>
            {isActive ? phase.toUpperCase() : 'LISTO PARA EMPEZAR'}
          </span>
          <p className="text-xs text-slate-600 font-medium pt-1">
            {isActive ? phaseConfig.text : 'Presiona Iniciar para calmar el ritmo respiratorio y destensar el pecho.'}
          </p>
        </div>

        {/* Botones */}
        <div className="w-full flex gap-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Play className={`w-4 h-4 ${isActive ? 'rotate-90' : ''}`} />
            <span>{isActive ? 'Pausar' : 'Iniciar Ciclo'}</span>
          </button>
          {isActive && (
            <button
              onClick={() => {
                setIsActive(false);
                setPhase('inhala');
                setCounter(4);
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
