import React from 'react';
import { BookOpen, CheckSquare, Square, HeartPulse, FileText, HelpCircle } from 'lucide-react';

interface EducationScreenProps {
  onOpenBreathing: () => void;
  selectedQuestions: string[];
  onToggleQuestion: (question: string) => void;
  onOpenDoctorReport: () => void;
}

const FREQUENT_QUESTIONS = [
  '¿Mi técnica de inhalación actual está garantizando que el fármaco llegue a mis bronquios?',
  '¿Cuál es mi valor de Flujo Espiratorio Máximo (PEF) de referencia personal óptimo?',
  '¿En qué momento exacto debo escalar a la medicación de rescate según mi plan?',
  '¿Debo utilizar cámara de inhalación espaciadora con mi dispositivo de cartucho presurizado?',
  '¿Qué precauciones especiales debo tomar al realizar actividad aeróbica o ejercicio?',
];

export const EducationScreen: React.FC<EducationScreenProps> = ({
  onOpenBreathing,
  selectedQuestions,
  onToggleQuestion,
  onOpenDoctorReport,
}) => {
  return (
    <div className="space-y-5 pb-6">
      {/* Título */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Educación y Guías</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Técnicas clínicas y preguntas para tu consulta</p>
          </div>
        </div>
      </div>

      {/* Ejercicio de Respiración Guiada */}
      <div className="bg-gradient-to-r from-teal-500 to-sky-600 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <h3 className="text-base font-bold mb-1">Técnicas de Respiración Consciente</h3>
        <p className="text-xs text-sky-100 mb-4 max-w-[240px]">
          Alivia la hiperventilación y reduce la ansiedad durante episodios de tensión torácica.
        </p>
        <button
          onClick={onOpenBreathing}
          className="py-2.5 px-4 bg-white text-teal-800 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-teal-50 transition-colors shadow-sm"
        >
          <HeartPulse className="w-4 h-4 text-teal-600" />
          <span>Iniciar Respiración 4-7-8</span>
        </button>
      </div>

      {/* Preguntas para la Consulta Médica */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">Preguntas para tu Médico</h2>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-full">
            {selectedQuestions.length} seleccionadas
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Marca las dudas que quieras incluir automáticamente en tu informe médico:
        </p>

        <div className="space-y-2 pt-1">
          {FREQUENT_QUESTIONS.map((question, idx) => {
            const isSelected = selectedQuestions.includes(question);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onToggleQuestion(question)}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                  isSelected 
                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-slate-900 dark:text-white' 
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                )}
                <span className="text-xs font-medium leading-relaxed">{question}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenDoctorReport}
          className="w-full mt-3 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Ver Preguntas en el Informe Médico</span>
        </button>
      </div>

      {/* Regla de los 3 Pasos Inhalador */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Técnica Correcta de Inhalación</h3>
        <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside">
          <li><strong>Exhalar por completo</strong> el aire residual de los pulmones antes de aplicar.</li>
          <li><strong>Inhalar de forma suave y profunda</strong> al tiempo que accionas el pulsador.</li>
          <li><strong>Mantener la respiración (apnea)</strong> durante 10 segundos para fijar el fármaco.</li>
        </ol>
      </div>
    </div>
  );
};
