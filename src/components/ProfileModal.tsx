import React from 'react';
import { PatientProfile } from '../types';
import { X, User, Phone, ShieldAlert, FileText, Heart } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onOpenDoctorReport: () => void;
  onOpenEmergency: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onOpenDoctorReport,
  onOpenEmergency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-slate-800 text-sm">Perfil del Paciente</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Avatar y Datos Principales */}
          <div className="text-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md">
              {patient.name.charAt(0)}
            </div>
            <h3 className="text-base font-bold text-slate-800">{patient.name}</h3>
            <p className="text-slate-500">{patient.asthmaType} • {patient.age} años</p>
          </div>

          {/* Valor de Referencia */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">PEF Óptimo Personal</span>
              <p className="text-lg font-black text-slate-800">{patient.baselinePEF} L/min</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Calibrado
            </span>
          </div>

          {/* Contactos de Confianza */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700">Contactos de Respaldo Clínico</h4>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-semibold text-slate-800">{patient.doctorContact.name} ({patient.doctorContact.specialty})</p>
              <p className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-primary" /> {patient.doctorContact.phone}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="font-semibold text-slate-800">{patient.emergencyContact.name}</p>
              <p className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-rose-500" /> {patient.emergencyContact.phone}</p>
            </div>
          </div>

          {/* Accesos directos */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenEmergency();
              }}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Ver Plan de Emergencia</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenDoctorReport();
              }}
              className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span>Generar Reporte para Neumonólogo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
