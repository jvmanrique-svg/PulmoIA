import React from 'react';
import { PatientProfile, SymptomLog } from '../types';
import { X, Printer, Download, FileText, CheckCircle2 } from 'lucide-react';

interface DoctorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  logs: SymptomLog[];
  selectedQuestions: string[];
}

export const DoctorReportModal: React.FC<DoctorReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  logs,
  selectedQuestions,
}) => {
  if (!isOpen) return null;

  const averagePEF = logs.length > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + curr.pef, 0) / logs.length)
    : patient.baselinePEF;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera del modal */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-slate-800 text-sm">Informe Clínico para Consulta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido imprimible */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Ficha Paciente */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <p className="font-bold text-sm text-slate-800">{patient.name}</p>
            <p className="text-slate-600">Edad: {patient.age} años • Diagnóstico: {patient.asthmaType}</p>
            <p className="text-slate-600">Médico tratante: {patient.doctorContact.name} ({patient.doctorContact.specialty})</p>
          </div>

          {/* Estadísticas de control */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-center">
              <span className="text-[10px] text-sky-700 font-semibold uppercase">PEF Promedio</span>
              <p className="text-xl font-bold text-sky-900">{averagePEF} L/min</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-700 font-semibold uppercase">PEF Personal Óptimo</span>
              <p className="text-xl font-bold text-emerald-900">{patient.baselinePEF} L/min</p>
            </div>
          </div>

          {/* Preguntas para la consulta */}
          {selectedQuestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800">Dudas prioritarias para la consulta:</h3>
              <ul className="space-y-1.5">
                {selectedQuestions.map((q, i) => (
                  <li key={i} className="p-2 bg-slate-50 rounded-lg flex items-start gap-2 text-slate-700">
                    <span className="text-primary font-bold">Q{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicación actual */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800">Tratamiento prescrito activo:</h3>
            <div className="space-y-1">
              {patient.currentMedications.map((m, i) => (
                <div key={i} className="p-2 border border-slate-100 rounded-lg text-slate-600 flex justify-between">
                  <span>{m.name}</span>
                  <span className="font-semibold">{m.dosage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-primary hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
