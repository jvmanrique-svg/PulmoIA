import React, { useState } from 'react';
import { PatientProfile, SymptomLog, DoctorNote, AsthmaZone } from '../types';
import { getDoctorNotes, saveDoctorNote, deleteDoctorNote } from '../services/storageService';
import { 
  Stethoscope, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  Filter, 
  Activity, 
  Pill, 
  UserCheck,
  Thermometer,
  Wind
} from 'lucide-react';

interface DoctorPortalScreenProps {
  patient: PatientProfile;
  logs: SymptomLog[];
  onOpenDoctorReport: () => void;
}

export const DoctorPortalScreen: React.FC<DoctorPortalScreenProps> = ({
  patient,
  logs,
  onOpenDoctorReport,
}) => {
  const [filterZone, setFilterZone] = useState<'all' | AsthmaZone>('all');
  const [filterDays, setFilterDays] = useState<number>(30);

  // Notas médicas
  const [notesList, setNotesList] = useState<DoctorNote[]>(getDoctorNotes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState(patient.doctorContact?.name || 'Dr. Médico Tratante');
  const [newNoteText, setNewNoteText] = useState('');
  const [newActionPlanChange, setNewActionPlanChange] = useState('');
  const [newNextDate, setNewNextDate] = useState('');

  // Filtrado de logs
  const now = Date.now();
  const cutoff = now - filterDays * 86400000;

  const filteredLogs = logs.filter((log) => {
    const matchesTime = new Date(log.timestamp).getTime() >= cutoff;
    const matchesZone = filterZone === 'all' || log.zone === filterZone;
    return matchesTime && matchesZone;
  });

  // Cálculos clínicos del médico
  const totalLogs = filteredLogs.length;
  const avgPEF = totalLogs > 0
    ? Math.round(filteredLogs.reduce((acc, curr) => acc + curr.pef, 0) / totalLogs)
    : patient.baselinePEF;

  const yellowOrRedCount = filteredLogs.filter((l) => l.zone !== 'green').length;
  const totalRescuePuffs = filteredLogs.reduce((acc, curr) => acc + (curr.rescuePuffs || 0), 0);

  // Clasificación de Control según Guías GINA
  let ginaControlLevel: { label: string; color: string; badge: string; desc: string };
  if (yellowOrRedCount === 0 && totalRescuePuffs <= 2) {
    ginaControlLevel = {
      label: 'Asma Bien Controlada',
      color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      badge: 'Control Óptimo (GINA)',
      desc: 'El paciente mantiene su PEF ≥ 80% del valor basal personal sin exacerbaciones ni despertares nocturnos.',
    };
  } else if (yellowOrRedCount <= 2 && totalRescuePuffs <= 6) {
    ginaControlLevel = {
      label: 'Asma Parcialmente Controlada',
      color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      badge: 'Precaución Clínica',
      desc: 'Episodios leves o moderados de sibilancias o descenso de flujo espiratorio durante el último mes.',
    };
  } else {
    ginaControlLevel = {
      label: 'Asma No Controlada / Inestable',
      color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
      badge: 'Alerta de Control',
      desc: 'Frecuente uso de medicación de rescate y valores PEF en zona amarilla/roja. Evaluar adherencia o escalar paso terapéutico.',
    };
  }

  // Guardar nueva nota del médico
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const noteObj: DoctorNote = {
      id: `docnote-${Date.now()}`,
      date: new Date().toISOString(),
      doctorName: newDoctorName.trim() || 'Médico Tratante',
      note: newNoteText.trim(),
      actionPlanChange: newActionPlanChange.trim() ? newActionPlanChange.trim() : undefined,
      nextConsultationDate: newNextDate.trim() ? newNextDate.trim() : undefined,
    };

    const updated = saveDoctorNote(noteObj);
    setNotesList(updated);
    setNewNoteText('');
    setNewActionPlanChange('');
    setNewNextDate('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta nota clínica?')) {
      const updated = deleteDoctorNote(id);
      setNotesList(updated);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Cabecera del Panel Médico */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-600 text-white flex items-center justify-center shadow-md">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 dark:text-white">Panel para Médico Tratante</h1>
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 rounded-full">
                Vista Profesional
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluación longitudinal, métricas GINA y prescripción activa
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDoctorReport}
          className="py-2 px-3 bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 text-sky-700 dark:text-sky-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          title="Generar reporte imprimible"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar PDF</span>
        </button>
      </div>

      {/* Ficha Clínica Resumida del Paciente */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{patient.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {patient.asthmaType} • {patient.age} años • {patient.nationality || 'Nacionalidad no reg.'}
            </p>
            {patient.phone && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Teléfono: <strong>{patient.phone}</strong>
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">PEF Óptimo Calibrado</span>
            <p className="text-xl font-black text-slate-800 dark:text-white">{patient.baselinePEF} L/min</p>
          </div>
        </div>

        {/* Clasificación de Control GINA */}
        <div className={`p-3.5 rounded-2xl border ${ginaControlLevel.color} space-y-1`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span className="font-bold text-xs">{ginaControlLevel.label}</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/60">
              {ginaControlLevel.badge}
            </span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">{ginaControlLevel.desc}</p>
        </div>
      </section>

      {/* Métricas Clínicas Consolidadas */}
      <section className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">PEF Promedio</span>
          <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">{avgPEF} L/min</p>
          <span className="text-[10px] text-slate-500">
            {Math.round((avgPEF / patient.baselinePEF) * 100)}% del basal
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Días con Síntomas</span>
          <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{yellowOrRedCount}</p>
          <span className="text-[10px] text-slate-500">en {filterDays} días</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Uso de Rescate</span>
          <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{totalRescuePuffs}</p>
          <span className="text-[10px] text-slate-500">puffs de Salbutamol</span>
        </div>
      </section>

      {/* Esquema Farmacológico Prescrito Activo */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tratamiento Farmacológico Activo
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Verificado en consulta</span>
        </div>

        <div className="space-y-2">
          {patient.currentMedications.map((med) => (
            <div
              key={med.id}
              className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200/70 dark:border-slate-600 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{med.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {med.dosage} • {med.frequency}
                  {med.schedules && med.schedules.length > 0 ? ` (Tomas: ${med.schedules.join(', ')})` : ''}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  med.type === 'control'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}
              >
                {med.type}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Historial Clínico con Filtros Médicos */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Registros Clínicos del Paciente ({filteredLogs.length})
            </h3>
          </div>

          {/* Filtros de Rango y Zona */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(Number(e.target.value))}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border-none focus:outline-none text-[11px]"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={14}>Últimos 14 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>

            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value as any)}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border-none focus:outline-none text-[11px]"
            >
              <option value="all">Todas las Zonas</option>
              <option value="green">Solo Zona Verde</option>
              <option value="yellow">Solo Zona Amarilla</option>
              <option value="red">Solo Zona Roja</option>
            </select>
          </div>
        </div>

        {/* Tabla/Lista de Registros para el Médico */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-xs">No hay mediciones en este filtro.</p>
          ) : (
            filteredLogs.map((log) => {
              const d = new Date(log.timestamp);
              const formatted = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200/70 dark:border-slate-600 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{log.pef} L/min</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          log.zone === 'green'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.zone === 'yellow'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        Zona {log.zone}
                      </span>
                      {log.temperature !== undefined && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-0.5">
                          <Thermometer className="w-3 h-3" /> {log.temperature}°C
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{formatted}</p>
                    {log.symptoms.length > 0 && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-300">
                        Síntomas: {log.symptoms.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                    <p>Rescate: <strong>{log.rescuePuffs}</strong> puffs</p>
                    {log.notes && <p className="italic text-[10px] max-w-[120px] truncate">"{log.notes}"</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Sección de Notas y Recomendaciones del Médico Tratante */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Evolución y Notas de la Consulta
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="py-1 px-2.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingNote ? 'Cerrar' : 'Nueva Nota'}</span>
          </button>
        </div>

        {/* Formulario para agregar nota médica */}
        {isAddingNote && (
          <form onSubmit={handleSaveNote} className="p-3.5 bg-slate-50 dark:bg-slate-700/60 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Médico Firmante / Especialista
              </label>
              <input
                type="text"
                value={newDoctorName}
                onChange={(e) => setNewDoctorName(e.target.value)}
                placeholder="Dra. Sofía Valenzuela"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observaciones Clínicas / Ajuste Terapéutico *
              </label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Escribe la evaluación del control, respuesta broncodilatadora y plan de manejo..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ajuste en Plan de Acción
                </label>
                <input
                  type="text"
                  value={newActionPlanChange}
                  onChange={(e) => setNewActionPlanChange(e.target.value)}
                  placeholder="Ej: Mantener paso 3 GINA"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Próximo Control Sugerido
                </label>
                <input
                  type="date"
                  value={newNextDate}
                  onChange={(e) => setNewNextDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNote(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
              >
                Guardar en Ficha
              </button>
            </div>
          </form>
        )}

        {/* Lista de Notas Clínicas */}
        <div className="space-y-2.5">
          {notesList.map((n) => (
            <div
              key={n.id}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/80 dark:border-slate-600 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  {n.doctorName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(n.id)}
                    className="text-slate-300 hover:text-rose-500"
                    title="Eliminar nota"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">{n.note}</p>

              {n.actionPlanChange && (
                <div className="text-[10px] text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 p-2 rounded-lg font-medium">
                  <strong>Plan de acción:</strong> {n.actionPlanChange}
                </div>
              )}

              {n.nextConsultationDate && (
                <p className="text-[10px] text-slate-400 pt-0.5">
                  Próximo control previsto: <strong>{n.nextConsultationDate}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
