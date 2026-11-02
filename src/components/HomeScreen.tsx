import React from 'react';
import { PatientProfile, SymptomLog, EnvironmentalData, TabType } from '../types';
import { Wind, AlertTriangle, ShieldCheck, HeartPulse, Droplets, Sun, Sparkles, ChevronRight, Plus } from 'lucide-react';

interface HomeScreenProps {
  patient: PatientProfile;
  logs: SymptomLog[];
  environment: EnvironmentalData;
  onNavigate: (tab: TabType) => void;
  onOpenBreathing: () => void;
  onOpenEmergency: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  patient,
  logs,
  environment,
  onNavigate,
  onOpenBreathing,
  onOpenEmergency,
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
      <section className="bg-gradient-to-br from-white to-sky-50/50 rounded-3xl p-5 border border-sky-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Estado Respiratorio</span>
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
            className="py-2.5 px-3 bg-primary hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
          <button
            onClick={onOpenBreathing}
            className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <HeartPulse className="w-4 h-4 text-primary" />
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

      {/* Clima y Calidad Ambiental */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Condición Ambiental ({environment.city})</h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            ICA {environment.aqi} - {environment.aqiLevel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-[10px] text-slate-500">Temperatura</p>
            <p className="font-bold text-xs text-slate-800">{environment.temperature} °C</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <Droplets className="w-4 h-4 text-sky-500 mx-auto mb-1" />
            <p className="text-[10px] text-slate-500">Humedad</p>
            <p className="font-bold text-xs text-slate-800">{environment.humidity}%</p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <Wind className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-[10px] text-slate-500">Polen</p>
            <p className="font-bold text-xs text-slate-800">{environment.pollenLevel}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
          💡 {environment.recommendation}
        </p>
      </section>

      {/* Medicación Diaria Programada */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Medicamentos de Control</h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">Hoy</span>
        </div>

        <div className="space-y-2">
          {patient.currentMedications.map((med, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{med.name}</p>
                <p className="text-[11px] text-slate-500">{med.frequency} • {med.dosage}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                med.type === 'control' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {med.type}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
