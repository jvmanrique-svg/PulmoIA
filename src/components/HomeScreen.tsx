import React from 'react';
import { PatientProfile, SymptomLog, EnvironmentalData, TabType, Medication } from '../types';
import { WeatherAlertsCard } from './WeatherAlertsCard';
import { MedicationRemindersCard } from './MedicationRemindersCard';
import { 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Pill, 
  Clock, 
  Edit3 
} from 'lucide-react';

interface HomeScreenProps {
  patient: PatientProfile;
  logs: SymptomLog[];
  environment: EnvironmentalData;
  onUpdateEnvironment: (data: EnvironmentalData) => void;
  onNavigate: (tab: TabType) => void;
  onOpenBreathing: () => void;
  onOpenEmergency: () => void;
  onOpenMedicationManager: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  patient,
  logs,
  environment,
  onUpdateEnvironment,
  onNavigate,
  onOpenBreathing,
  onOpenEmergency,
  onOpenMedicationManager,
}) => {
  const latestLog = logs[0];
  const pefValue = latestLog ? latestLog.pef : patient.baselinePEF;
  const zone = latestLog ? latestLog.zone : 'green';

  const zoneBadge = {
    green: { label: 'Zona Verde - Control Óptimo', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    yellow: { label: 'Zona Amarilla - Precaución', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
    red: { label: 'Zona Roja - Crisis Médica', color: 'text-rose-700 bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
  }[zone];

  return (
    <div className="space-y-5">
      {/* Estado Actual del Paciente / Semáforo de Asma */}
      <section className="bg-gradient-to-br from-white to-sky-50/60 rounded-3xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
              Estado Respiratorio
            </span>
            <h2 className="text-lg font-bold text-slate-800">Hola, {patient.name.split(' ')[0]} 👋</h2>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${zoneBadge.color}`}>
            <span className={`w-2 h-2 rounded-full ${zoneBadge.dot}`} />
            <span>{zoneBadge.label.split(' - ')[1]}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{pefValue}</span>
          <span className="text-sm font-semibold text-slate-500">L/min (PEF actual)</span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Referencia óptima personal: <strong className="text-slate-800">{patient.baselinePEF} L/min</strong> ({Math.round((pefValue / patient.baselinePEF) * 100)}%)
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('registrar')}
            className="py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
          <button
            onClick={onOpenBreathing}
            className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <HeartPulse className="w-4 h-4 text-sky-600" />
            <span>Respiración 4-7-8</span>
          </button>
        </div>
      </section>

      {/* Botón de Emergencia Rápida */}
      <button
        onClick={onOpenEmergency}
        className="w-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 p-4 rounded-2xl flex items-center justify-between transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-rose-900">Plan de Acción de Emergencia</h3>
            <p className="text-[11px] text-rose-700">Pasos inmediatos y contactos de crisis</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-rose-400" />
      </button>

      {/* CLIMA, CALIDAD DEL AIRE, ÍNDICE UV Y ALERTAS CLÍNICAS */}
      <WeatherAlertsCard
        environment={environment}
        onUpdateEnvironment={onUpdateEnvironment}
        patientCondition={patient.asthmaType}
      />

      {/* SISTEMA DE RECORDATORIOS DE MEDICAMENTOS */}
      <MedicationRemindersCard
        medications={patient.currentMedications}
        onOpenMedicationManager={onOpenMedicationManager}
      />

      {/* PLAN DE MEDICAMENTOS DE CONTROL ACTIVO */}
      <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Medicamentos de Control
            </h3>
            <p className="text-[11px] text-slate-400">Plan prescrito activo</p>
          </div>

          <button
            type="button"
            onClick={onOpenMedicationManager}
            className="py-1 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Lista</span>
          </button>
        </div>

        <div className="space-y-2">
          {patient.currentMedications.map((med) => (
            <div
              key={med.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 flex items-start justify-between text-xs transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{med.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                      med.type === 'control' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {med.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {med.frequency} • {med.dosage}
                </p>
                {med.schedules && med.schedules.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Horarios: {med.schedules.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
