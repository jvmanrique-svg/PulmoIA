import React, { useState } from 'react';
import { PatientProfile } from '../types';
import { 
  X, 
  User, 
  Phone, 
  ShieldAlert, 
  FileText, 
  Globe, 
  Edit3, 
  Check, 
  AlertCircle, 
  LogOut,
  Sparkles,
  HeartPulse
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onOpenDoctorReport: () => void;
  onOpenEmergency: () => void;
  onLogout?: () => void;
}

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro país',
];

const RESPIRATORY_CONDITIONS = [
  'Asma Alérgica Moderada Persistente',
  'Asma No Alérgica Grave',
  'Asma Leve Intermitente',
  'EPOC (Enfermedad Pulmonar Obstructiva Crónica)',
  'Síndrome de Superposición Asma-EPOC (ACOS)',
  'Enfermedad Respiratoria en Evaluación',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  patient,
  onUpdatePatient,
  onOpenDoctorReport,
  onOpenEmergency,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [name, setName] = useState(patient.name);
  const [phone, setPhone] = useState(patient.phone || '');
  const [nationality, setNationality] = useState(patient.nationality || 'Argentina');
  const [age, setAge] = useState<number | string>(patient.age);
  const [asthmaType, setAsthmaType] = useState(patient.asthmaType);
  const [baselinePEF, setBaselinePEF] = useState<number | string>(patient.baselinePEF);

  // Contacts
  const [docName, setDocName] = useState(patient.doctorContact?.name || '');
  const [docSpecialty, setDocSpecialty] = useState(patient.doctorContact?.specialty || '');
  const [docPhone, setDocPhone] = useState(patient.doctorContact?.phone || '');

  const [emerName, setEmerName] = useState(patient.emergencyContact?.name || '');
  const [emerRelation, setEmerRelation] = useState(patient.emergencyContact?.relation || '');
  const [emerPhone, setEmerPhone] = useState(patient.emergencyContact?.phone || '');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Sync state when patient changes
  React.useEffect(() => {
    setName(patient.name);
    setPhone(patient.phone || '');
    setNationality(patient.nationality || 'Argentina');
    setAge(patient.age);
    setAsthmaType(patient.asthmaType);
    setBaselinePEF(patient.baselinePEF);
    setDocName(patient.doctorContact?.name || '');
    setDocSpecialty(patient.doctorContact?.specialty || '');
    setDocPhone(patient.doctorContact?.phone || '');
    setEmerName(patient.emergencyContact?.name || '');
    setEmerRelation(patient.emergencyContact?.relation || '');
    setEmerPhone(patient.emergencyContact?.phone || '');
    setIsEditing(false);
    setErrors({});
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const validatePhone = (val: string): boolean => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre completo es obligatorio.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio.';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Ingresa un formato de teléfono válido con al menos 7 dígitos.';
    }

    if (!nationality.trim()) {
      newErrors.nationality = 'Selecciona o ingresa tu nacionalidad.';
    }

    if (!age || Number(age) < 1 || Number(age) > 120) {
      newErrors.age = 'Ingresa una edad válida (1 - 120).';
    }

    if (!baselinePEF || Number(baselinePEF) < 100 || Number(baselinePEF) > 850) {
      newErrors.baselinePEF = 'El valor PEF debe estar entre 100 y 850 L/min.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const updated: PatientProfile = {
      ...patient,
      name: name.trim(),
      phone: phone.trim(),
      nationality: nationality.trim(),
      age: Number(age),
      asthmaType,
      baselinePEF: Number(baselinePEF),
      doctorContact: {
        name: docName.trim() || patient.doctorContact?.name || '',
        specialty: docSpecialty.trim() || patient.doctorContact?.specialty || 'Neumonología',
        phone: docPhone.trim() || patient.doctorContact?.phone || '',
      },
      emergencyContact: {
        name: emerName.trim() || patient.emergencyContact?.name || '',
        relation: emerRelation.trim() || patient.emergencyContact?.relation || 'Contacto',
        phone: emerPhone.trim() || patient.emergencyContact?.phone || '',
      },
    };

    onUpdatePatient(updated);
    try {
      localStorage.setItem('pulmo_patient', JSON.stringify(updated));
    } catch {
      // storage unavailable
    }

    setIsEditing(false);
    setSuccessMessage('¡Datos de paciente actualizados y persistidos con éxito!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-700">
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-bold text-slate-800 dark:text-white text-sm">
              {isEditing ? 'Editar Ficha del Paciente' : 'Perfil del Paciente'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="py-1 px-2.5 rounded-xl bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 text-sky-700 dark:text-sky-300 font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de confirmación */}
        {successMessage && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-100 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {isEditing ? (
            /* MODO EDICIÓN CON VALIDACIONES Y PERSISTENCIA */
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Nombre */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Elena Morales"
                  className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-rose-300 ring-rose-100' : 'border-slate-200 dark:border-slate-600 focus:ring-sky-100'
                  }`}
                />
                {errors.name && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +54 9 11 4521-8899"
                  className={`w-full px-3 py-2 rounded-xl border text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-rose-300 ring-rose-100' : 'border-slate-200 dark:border-slate-600 focus:ring-sky-100'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Nacionalidad y Edad */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nacionalidad <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.nationality && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.nationality}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Edad <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                  {errors.age && <p className="text-[10px] text-rose-600 mt-1">{errors.age}</p>}
                </div>
              </div>

              {/* Condición Respiratoria */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnóstico / Condición Clínica
                </label>
                <select
                  value={asthmaType}
                  onChange={(e) => setAsthmaType(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  {RESPIRATORY_CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              {/* PEF Óptimo */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PEF Óptimo Personal (L/min) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={100}
                  max={850}
                  value={baselinePEF}
                  onChange={(e) => setBaselinePEF(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Calibrado por neumonología como valor de referencia 100%.
                </p>
                {errors.baselinePEF && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.baselinePEF}</p>
                )}
              </div>

              {/* Contactos */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Médico Especialista</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Nombre del Médico"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs"
                  />
                  <input
                    type="tel"
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    placeholder="Teléfono médico"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Contacto de Emergencia</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emerName}
                    onChange={(e) => setEmerName(e.target.value)}
                    placeholder="Nombre Contacto"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs"
                  />
                  <input
                    type="tel"
                    value={emerPhone}
                    onChange={(e) => setEmerPhone(e.target.value)}
                    placeholder="Teléfono Emergencia"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                  }}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* MODO VISTA DE PERFIL */
            <>
              {/* Avatar y Datos Principales */}
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md">
                  {patient.name.charAt(0)}
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{patient.name}</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {patient.asthmaType} • {patient.age} años
                </p>
                <div className="flex items-center justify-center gap-3 pt-1 text-slate-600 dark:text-slate-300">
                  {patient.phone && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> {patient.phone}
                    </span>
                  )}
                  {patient.nationality && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> {patient.nationality}
                    </span>
                  )}
                </div>
              </div>

              {/* Valor de Referencia PEF */}
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">PEF Óptimo Personal</span>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{patient.baselinePEF} L/min</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
                  Calibrado
                </span>
              </div>

              {/* Contactos de Confianza */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Contactos de Respaldo Clínico</h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {patient.doctorContact?.name} ({patient.doctorContact?.specialty || 'Neumonología'})
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> {patient.doctorContact?.phone || 'No registrado'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {patient.emergencyContact?.name} ({patient.emergencyContact?.relation || 'Contacto'})
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-500" /> {patient.emergencyContact?.phone || 'No registrado'}
                  </p>
                </div>
              </div>

              {/* Accesos directos y Cerrar Sesión */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmergency();
                  }}
                  className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-rose-200 dark:border-rose-900/60"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Ver Plan de Emergencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDoctorReport();
                  }}
                  className="w-full py-2.5 bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 text-sky-700 dark:text-sky-300 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-sky-100 dark:border-slate-600"
                >
                  <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Generar Reporte para Neumonólogo</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-2 text-slate-400 hover:text-rose-600 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
