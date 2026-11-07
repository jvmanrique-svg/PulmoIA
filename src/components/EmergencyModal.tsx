import React from 'react';
import { X, AlertTriangle, Phone } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-rose-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-rose-500 animate-in fade-in zoom-in-95">
        <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-sm tracking-wide">Protocolo de Crisis Asmática</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-rose-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Señales de alarma */}
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900/60">
            <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">Signos de Alarma Inmediata:</p>
            <ul className="list-disc list-inside text-rose-700 dark:text-rose-400 space-y-0.5">
              <li>Dificultad severa para completar una frase sin parar a respirar.</li>
              <li>Hundimiento de costillas o cuello al respirar (tiraje).</li>
              <li>Labios o uñas de tono azulado/grisáceo (cianosis).</li>
              <li>PEF menor al 50% de tu valor personal óptimo.</li>
            </ul>
          </div>

          {/* Pasos de acción 1-2-3-4 */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Pasos Inmediatos a Seguir:</h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-l-rose-500">
                <p className="font-bold text-slate-800 dark:text-white">1. Mantén la calma y siéntate erguido</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">No te acuestes; sentarse erguido favorece la expansión pulmonar.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-l-rose-500">
                <p className="font-bold text-slate-800 dark:text-white">2. Inhalador de rescate (Salbutamol)</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Aplica 2 a 4 pulsaciones (1 pulsación cada minuto, usando cámara espaciadora si dispones de ella).</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-l-rose-500">
                <p className="font-bold text-slate-800 dark:text-white">3. Espera 5 minutos</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Si los síntomas no mejoran, repite 2 pulsaciones adicionales.</p>
              </div>

              <div className="p-3 bg-rose-100/70 dark:bg-rose-950/70 rounded-xl border-l-4 border-l-rose-600">
                <p className="font-bold text-rose-900 dark:text-rose-200">4. Si persiste: Llama a emergencias</p>
                <p className="text-rose-700 dark:text-rose-400 mt-0.5">No demores en acudir a la guardia médica de urgencias más cercana.</p>
              </div>
            </div>
          </div>

          {/* Botones de llamada rápida */}
          <div className="pt-2 space-y-2">
            <a
              href="tel:911"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
            >
              <Phone className="w-5 h-5" />
              <span className="text-sm">Llamar a Emergencias (911 / 112)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
