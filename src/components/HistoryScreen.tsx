import React from 'react';
import { SymptomLog } from '../types';
import { deleteSymptomLog } from '../db/localDB';
import { SymptomTempChart } from './SymptomTempChart';
import { 
  Calendar, 
  Trash2, 
  FileText, 
  Wind, 
  Sun, 
  Droplets,
  MapPin
} from 'lucide-react';

interface HistoryScreenProps {
  logs: SymptomLog[];
  onOpenDoctorReport: () => void;
  onDeleteLog: (id: string) => void;
  baselinePEF?: number;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  logs,
  onOpenDoctorReport,
  onDeleteLog,
  baselinePEF = 480,
}) => {
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro clínico de la base de datos local?')) {
      await deleteSymptomLog(id);
      onDeleteLog(id);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Encabezado y Reporte Médico */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Historial Clínico</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{logs.length} registros guardados localmente</p>
        </div>
        <button
          onClick={onOpenDoctorReport}
          className="py-2 px-3 bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 text-sky-700 dark:text-sky-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Informe Médico</span>
        </button>
      </div>

      {/* Gráficos del historial de temperatura y síntomas diarios */}
      {logs.length > 0 && (
        <SymptomTempChart logs={logs} baselinePEF={baselinePEF} />
      )}

      {/* Lista de Registros Cronológicos */}
      {logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Wind className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">No hay registros aún</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Registra tu primera medición de Flujo Espiratorio Máximo (PEF) desde la pestaña "Registrar".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Detalle de Mediciones Anteriores
          </h2>

          {logs.map((log) => {
            const date = new Date(log.timestamp);
            const dateFormatted = date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const zoneStyles = {
              green: 'border-l-4 border-l-emerald-500',
              yellow: 'border-l-4 border-l-amber-500',
              red: 'border-l-4 border-l-rose-500',
            }[log.zone];

            return (
              <div
                key={log.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm ${zoneStyles} transition-colors`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>{dateFormatted}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{log.pef}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">L/min</span>
                    </div>

                    {/* Temperatura registrada */}
                    {log.temperature !== undefined && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/60">
                        <Sun className="w-3 h-3 text-amber-500" />
                        {log.temperature} °C
                      </span>
                    )}

                    {/* Humedad */}
                    {log.humidity !== undefined && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-md">
                        <Droplets className="w-3 h-3 text-sky-500" />
                        {log.humidity}%
                      </span>
                    )}
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    log.zone === 'green' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' :
                    log.zone === 'yellow' ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300' : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  }`}>
                    Zona {log.zone === 'green' ? 'Verde' : log.zone === 'yellow' ? 'Amarilla' : 'Roja'}
                  </span>
                </div>

                {/* Síntomas y Desencadenantes */}
                {(log.symptoms.length > 0 || log.triggers.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {log.symptoms.map((s, i) => (
                      <span key={i} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                        {s}
                      </span>
                    ))}
                    {log.triggers.map((t, i) => (
                      <span key={i} className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                        ⚡ {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rescate o notas */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-700">
                  <span>Puffs de rescate: <strong>{log.rescuePuffs}</strong></span>
                  {log.location && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {log.location.split(',')[0]}
                    </span>
                  )}
                  {log.notes && <span className="italic truncate max-w-[140px] text-slate-600 dark:text-slate-300">"{log.notes}"</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
