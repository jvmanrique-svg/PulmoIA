import React, { useState } from 'react';
import { SymptomLog, TabType, AsthmaZone, SymptomSeverity, EnvironmentalData } from '../types';
import { saveSymptomLog, calculateAsthmaZone } from '../db/localDB';
import { 
  Wind, 
  Activity, 
  CheckCircle2, 
  Pill, 
  FileText, 
  Plus, 
  Minus,
  Sparkles,
  ArrowRight,
  Sun,
  Droplets,
  MapPin
} from 'lucide-react';

interface RegisterScreenProps {
  onSaveLog: (newLog: SymptomLog) => void;
  onNavigate: (tab: TabType) => void;
  currentEnvironment?: EnvironmentalData;
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

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ 
  onSaveLog, 
  onNavigate,
  currentEnvironment 
}) => {
  const [pefValue, setPefValue] = useState<number>(440);
  const [severity, setSeverity] = useState<SymptomSeverity>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [rescuePuffs, setRescuePuffs] = useState<number>(0);
  const [medicationTaken, setMedicationTaken] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const [recordedTemp, setRecordedTemp] = useState<number>(currentEnvironment?.temperature ?? 21);
  const [recordedHumidity, setRecordedHumidity] = useState<number>(currentEnvironment?.humidity ?? 60);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<SymptomLog | null>(null);

  const currentZone: AsthmaZone = calculateAsthmaZone(pefValue, 480);

  const getZoneBadge = (zone: AsthmaZone) => {
    switch (zone) {
      case 'green':
        return {
          title: 'Zona Verde - Óptimo (≥ 80%)',
          description: 'Vías respiratorias despejadas. Buen control del asma.',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          indicator: 'bg-emerald-500',
        };
      case 'yellow':
        return {
          title: 'Zona Amarilla - Precaución (50-79%)',
          description: 'Precaución. Posible inicio de inflamación o estrechamiento.',
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          indicator: 'bg-amber-500',
        };
      case 'red':
        return {
          title: 'Zona Roja - Alerta Médica (< 50%)',
          description: 'Atención médica requerida. Inicia medicación de rescate.',
          bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          indicator: 'bg-rose-500',
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
      temperature: recordedTemp,
      humidity: recordedHumidity,
      aqi: currentEnvironment?.aqi,
      uvIndex: currentEnvironment?.uvIndex,
      location: currentEnvironment?.city,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    try {
      await saveSymptomLog(newLog);
      onSaveLog(newLog);
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Nuevo Registro Clínico</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Registra tus parámetros respiratorios, temperatura y síntomas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Medición PEF */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <label htmlFor="pef-slider" className="font-semibold text-slate-800 dark:text-white text-sm">
                Flujo Espiratorio Máximo (PEF)
              </label>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {pefValue} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">L/min</span>
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
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
              <span>100 L/min</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPefValue((v) => Math.max(100, v - 10))}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Minus className="w-3 h-3" /> -10
                </button>
                <button
                  type="button"
                  onClick={() => setPefValue((v) => Math.min(700, v + 10))}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> +10
                </button>
              </div>
              <span>700 L/min</span>
            </div>
          </div>
        </section>

        {/* 2. Registro de Temperatura y Condiciones Ambientales */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <label className="font-semibold text-slate-800 dark:text-white text-sm">
                Clima y Temperatura Registrada
              </label>
            </div>
            {currentEnvironment?.city && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                {currentEnvironment.city.split(',')[0]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200/80 dark:border-slate-600">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Temperatura actual
              </span>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setRecordedTemp((t) => t - 1)}
                  className="w-7 h-7 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-white"
                >
                  -
                </button>
                <span className="font-extrabold text-base text-slate-800 dark:text-white">{recordedTemp} °C</span>
                <button
                  type="button"
                  onClick={() => setRecordedTemp((t) => t + 1)}
                  className="w-7 h-7 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200/80 dark:border-slate-600">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Humedad relativa
              </span>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setRecordedHumidity((h) => Math.max(10, h - 5))}
                  className="w-7 h-7 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-white"
                >
                  -
                </button>
                <span className="font-extrabold text-base text-slate-800 dark:text-white">{recordedHumidity}%</span>
                <button
                  type="button"
                  onClick={() => setRecordedHumidity((h) => Math.min(100, h + 5))}
                  className="w-7 h-7 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 font-bold text-xs text-slate-800 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Severidad */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
          <label className="font-semibold text-slate-800 dark:text-white text-sm block">Severidad general en el día</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', label: 'Sin síntomas', desc: 'Normal' },
              { id: 'mild', label: 'Leve', desc: 'Actividades normales' },
              { id: 'moderate', label: 'Moderada', desc: 'Dificultad ligera' },
              { id: 'severe', label: 'Severa', desc: 'Interfiere con reposo' }
            ].map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSeverity(item.id as SymptomSeverity)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  severity === item.id
                    ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 ring-1 ring-sky-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="font-semibold text-xs">{item.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Síntomas */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
          <label className="font-semibold text-slate-800 dark:text-white text-sm block">Síntomas específicos identificados</label>
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
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Desencadenantes */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3 transition-colors">
          <label className="font-semibold text-slate-800 dark:text-white text-sm block">Desencadenantes ambientales / actividad</label>
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
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {trigger}
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. Medicación */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">Control de Medicación</h2>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">Inhalador de Rescate (Salbutamol)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">¿Cuántas inhalaciones de alivio utilizaste?</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRescuePuffs((v) => Math.max(0, v - 1))}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                -
              </button>
              <span className="w-6 text-center font-bold text-sm text-slate-800 dark:text-white">{rescuePuffs}</span>
              <button
                type="button"
                onClick={() => setRescuePuffs((v) => v + 1)}
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">Dosis de Mantenimiento Diaria</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Inhalador de control tomado según prescripción</p>
            </div>
            <input
              type="checkbox"
              checked={medicationTaken}
              onChange={(e) => setMedicationTaken(e.target.checked)}
              className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
            />
          </label>
        </section>

        {/* 7. Notas */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-2 transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <label htmlFor="notes-field" className="font-semibold text-slate-800 dark:text-white text-sm">
              Notas adicionales para tu médico
            </label>
          </div>
          <textarea
            id="notes-field"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe sensaciones adicionales, respuesta a la medicación o eventos particulares..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none h-20"
          />
        </section>

        {/* Botón de Enviar */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-50"
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

      {/* Modal de Confirmación */}
      {showSuccessModal && savedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-1">
              ¡Registro Guardado con Éxito!
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-5">
              Los datos clínicos y ambientales se han persistido correctamente.
            </p>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 space-y-2 mb-6 border border-slate-100 dark:border-slate-600 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-600">
                <span className="text-slate-500 dark:text-slate-400">Flujo PEF registrado:</span>
                <span className="font-bold text-slate-800 dark:text-white">{savedRecord.pef} L/min</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-600">
                <span className="text-slate-500 dark:text-slate-400">Clasificación de zona:</span>
                <span className={`font-bold capitalize ${
                  savedRecord.zone === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
                  savedRecord.zone === 'yellow' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  Zona {savedRecord.zone === 'green' ? 'Verde' : savedRecord.zone === 'yellow' ? 'Amarilla' : 'Roja'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-600">
                <span className="text-slate-500 dark:text-slate-400">Temperatura registrada:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{savedRecord.temperature} °C</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Puffs de rescate:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{savedRecord.rescuePuffs} inhalaciones</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate('historial');
                }}
                className="w-full py-3 bg-sky-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-sky-700 transition-colors"
              >
                <span>Ver en Historial y Gráficas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate('inicio');
                }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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
