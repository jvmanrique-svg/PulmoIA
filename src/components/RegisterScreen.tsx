import React, { useState } from 'react';
import { SymptomLog, TabType, AsthmaZone, SymptomSeverity } from '../types';
import { saveSymptomLog, calculateAsthmaZone } from '../db/localDB';
import { 
  Wind, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Pill, 
  Calendar, 
  FileText, 
  Plus, 
  Minus,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RegisterScreenProps {
  onSaveLog: (newLog: SymptomLog) => void;
  onNavigate: (tab: TabType) => void;
}

const COMMON_SYMPTOMS = [
  'Tos persistente',
  'Silbidos (Sibilancias)',
  'Falta de aire (Disnea)',
  'Opresión en el pecho',
  'Despertar nocturno',
  'Fatiga al hablar/caminar'
];

const COMMON_TRIGGERS = [
  'Ejercicio intenso',
  'Polvo / Ácaros',
  'Frío / Humedad',
  'Humo / Tabaco',
  'Polen / Plantas',
  'Mascotas',
  'Estrés o ansiedad',
  'Infección o resfriado'
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSaveLog, onNavigate }) => {
  // Estado del formulario
  const [pefValue, setPefValue] = useState<number>(440);
  const [severity, setSeverity] = useState<SymptomSeverity>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [rescuePuffs, setRescuePuffs] = useState<number>(0);
  const [medicationTaken, setMedicationTaken] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  
  // Feedback y confirmación
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<SymptomLog | null>(null);

  // Zona calculada según el PEF
  const currentZone: AsthmaZone = calculateAsthmaZone(pefValue, 480);

  const getZoneBadge = (zone: AsthmaZone) => {
    switch (zone) {
      case 'green':
        return {
          title: 'Zona Verde - Óptimo (≥ 80%)',
          description: 'Vías respiratorias despejadas. Buen control del asma.',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          indicator: 'bg-emerald-500',
          textColor: 'text-emerald-700'
        };
      case 'yellow':
        return {
          title: 'Zona Amarilla - Precaución (50-79%)',
          description: 'Precaución. Posible inicio de inflamación o estrechamiento.',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          indicator: 'bg-amber-500',
          textColor: 'text-amber-700'
        };
      case 'red':
        return {
          title: 'Zona Roja - Alerta Médica (< 50%)',
          description: 'Atención médica requerida. Inicia medicación de rescate.',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          indicator: 'bg-rose-500',
          textColor: 'text-rose-700'
        };
    }
  };

  const zoneInfo = getZoneBadge(currentZone);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLog: SymptomLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      pef: pefValue,
      zone: currentZone,
      severity,
      symptoms: selectedSymptoms,
      triggers: selectedTriggers,
      rescuePuffs,
      medicationTaken,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    try {
      // 1. Guardar en Base de Datos Local (IndexedDB + LocalStorage)
      await saveSymptomLog(newLog);

      // 2. Notificar al estado de la aplicación App.tsx
      onSaveLog(newLog);

      // 3. Mostrar confirmación con datos guardados
      setSavedRecord(newLog);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al guardar registro:', error);
      alert('Hubo un inconveniente al guardar en la base de datos local.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Título de Cabecera */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Nuevo Registro Clínico</h1>
            <p className="text-xs text-slate-500">Registra tus parámetros respiratorios y síntomas de hoy</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Medición PEF (Peak Expiratory Flow) */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-primary" />
              <label htmlFor="pef-slider" className="font-semibold text-slate-800 text-sm">Flujo Espiratorio Máximo (PEF)</label>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {pefValue} <span className="text-xs font-medium text-slate-500">L/min</span>
            </span>
          </div>

          {/* Semáforo Informativo Dinámico */}
          <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${zoneInfo.bg}`}>
            <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${zoneInfo.indicator}`} />
            <div>
              <p className="text-xs font-bold leading-none mb-1">{zoneInfo.title}</p>
              <p className="text-xs opacity-90">{zoneInfo.description}</p>
            </div>
          </div>

          {/* Slider y Controles de ajuste fino */}
          <div className="space-y-3 pt-2">
            <input
              id="pef-slider"
              type="range"
              min={100}
              max={700}
              step={5}
              value={pefValue}
              onChange={(e) => setPefValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>100 L/min</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPefValue(v => Math.max(100, v - 10))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Minus className="w-3 h-3" /> -10
                </button>
                <button
                  type="button"
                  onClick={() => setPefValue(v => Math.min(700, v + 10))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> +10
                </button>
              </div>
              <span>700 L/min</span>
            </div>
          </div>
        </section>

        {/* 2. Nivel de Severidad de Síntomas */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <label className="font-semibold text-slate-800 text-sm block">Severidad general en el día</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', label: 'Sin síntomas', desc: 'Normal' },
              { id: 'mild', label: 'Leve', desc: 'Actividades normales' },
              { id: 'moderate', label: 'Moderada', desc: 'Dificultad ligera' },
              { id: 'severe', label: 'Severa', desc: 'Interfiere con reposo' }
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSeverity(item.id as SymptomSeverity)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  severity === item.id
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <p className="font-semibold text-xs">{item.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Síntomas Presentes */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <label className="font-semibold text-slate-800 text-sm block">Síntomas específicos identificados</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  type="button"
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Desencadenantes Detectados */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <label className="font-semibold text-slate-800 text-sm block">Desencadenantes ambientales / actividad</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_TRIGGERS.map((trigger) => {
              const isSelected = selectedTriggers.includes(trigger);
              return (
                <button
                  type="button"
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {trigger}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Medicación Administrada */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-800 text-sm">Control de Medicación</h2>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-800">Inhalador de Rescate (Puffs de Salbutamol)</p>
              <p className="text-[11px] text-slate-500">¿Cuántas inhalaciones de alivio utilizaste?</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRescuePuffs(v => Math.max(0, v - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
              >
                -
              </button>
              <span className="w-6 text-center font-bold text-sm text-slate-800">{rescuePuffs}</span>
              <button
                type="button"
                onClick={() => setRescuePuffs(v => v + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-800">Dosis de Mantenimiento Diaria</p>
              <p className="text-[11px] text-slate-500">Budesonida/Formoterol administrada a tiempo</p>
            </div>
            <input
              type="checkbox"
              checked={medicationTaken}
              onChange={(e) => setMedicationTaken(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </label>
        </section>

        {/* 6. Observaciones y Notas */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <label htmlFor="notes-field" className="font-semibold text-slate-800 text-sm">Notas adicionales para tu médico</label>
          </div>
          <textarea
            id="notes-field"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe sensaciones adicionales, respuesta a la medicación o eventos particulares..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none h-20"
          />
        </section>

        {/* Botón de Enviar Formulario */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Guardando en base de datos local...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Guardar Registro en Base de Datos</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal / Alerta de Confirmación interactiva */}
      {showSuccessModal && savedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Ícono de éxito */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-center text-slate-900 mb-1">
              ¡Registro Guardado con Éxito!
            </h3>
            <p className="text-xs text-center text-slate-500 mb-5">
              Los datos se han persistido correctamente en la base de datos local (IndexedDB + Storage).
            </p>

            {/* Resumen Clínico */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-6 border border-slate-100 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Flujo PEF registrado:</span>
                <span className="font-bold text-slate-800">{savedRecord.pef} L/min</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Clasificación de zona:</span>
                <span className={`font-bold capitalize ${
                  savedRecord.zone === 'green' ? 'text-emerald-600' :
                  savedRecord.zone === 'yellow' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  Zona {savedRecord.zone === 'green' ? 'Verde' : savedRecord.zone === 'yellow' ? 'Amarilla' : 'Roja'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Severidad de síntomas:</span>
                <span className="font-semibold text-slate-800 capitalize">{savedRecord.severity}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Puffs de rescate:</span>
                <span className="font-semibold text-slate-800">{savedRecord.rescuePuffs} inhalaciones</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate('historial');
                }}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <span>Ver en Historial Clínico</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate('inicio');
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
