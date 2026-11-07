import React, { useState } from 'react';
import { Medication } from '../types';
import { 
  X, 
  Pill, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Check, 
  AlertCircle, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface MedicationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  onSaveMedications: (meds: Medication[]) => void;
}

const COMMON_CONTROL_MEDS = [
  'Budesonida / Formoterol (160/4.5 mcg)',
  'Fluticasona / Salmeterol (250/50 mcg)',
  'Beclometasona (250 mcg)',
  'Tiotropio Respimat (2.5 mcg)',
  'Bromuro de Ipratropio / Fenoterol',
  'Montelukast (10 mg)',
  'Salbutamol (100 mcg)',
];

const PRESET_HOURS = ['07:00', '08:00', '12:00', '14:00', '19:00', '20:00', '22:00'];

export const MedicationManagerModal: React.FC<MedicationManagerModalProps> = ({
  isOpen,
  onClose,
  medications,
  onSaveMedications,
}) => {
  const [medsList, setMedsList] = useState<Medication[]>(medications);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for add / edit
  const [name, setName] = useState('');
  const [type, setType] = useState<'control' | 'rescate'>('control');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [schedules, setSchedules] = useState<string[]>(['08:00', '20:00']);
  const [newScheduleTime, setNewScheduleTime] = useState('08:00');
  const [instructions, setInstructions] = useState('');
  const [formError, setFormError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Keep list updated when modal opens
  React.useEffect(() => {
    setMedsList(medications);
  }, [medications, isOpen]);

  if (!isOpen) return null;

  const startNewMedication = () => {
    setEditingId('new');
    setName('');
    setType('control');
    setDosage('1 inhalación');
    setFrequency('Cada 12 horas');
    setSchedules(['08:00', '20:00']);
    setInstructions('');
    setFormError('');
  };

  const startEditMedication = (med: Medication) => {
    setEditingId(med.id);
    setName(med.name);
    setType(med.type);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setSchedules(med.schedules && med.schedules.length > 0 ? [...med.schedules] : ['08:00']);
    setInstructions(med.instructions || '');
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormError('');
  };

  const addScheduleTime = (timeToAdd: string) => {
    if (!timeToAdd) return;
    if (!schedules.includes(timeToAdd)) {
      setSchedules([...schedules, timeToAdd].sort());
    }
  };

  const removeScheduleTime = (timeToRemove: string) => {
    setSchedules(schedules.filter((t) => t !== timeToRemove));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('El nombre del medicamento es requerido.');
      return;
    }
    if (!dosage.trim()) {
      setFormError('Indica la dosis (ej: 1 inhalación, 1 cápsula).');
      return;
    }
    if (!frequency.trim()) {
      setFormError('Indica la frecuencia de administración.');
      return;
    }
    if (schedules.length === 0) {
      setFormError('Agrega al menos un horario para programar las tomas.');
      return;
    }

    setFormError('');

    let updated: Medication[];
    if (editingId === 'new') {
      const newMed: Medication = {
        id: `med-${Date.now()}`,
        name: name.trim(),
        type,
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        schedules: schedules,
        instructions: instructions.trim() ? instructions.trim() : undefined,
      };
      updated = [...medsList, newMed];
    } else {
      updated = medsList.map((m) =>
        m.id === editingId
          ? {
              ...m,
              name: name.trim(),
              type,
              dosage: dosage.trim(),
              frequency: frequency.trim(),
              schedules: schedules,
              instructions: instructions.trim() ? instructions.trim() : undefined,
            }
          : m
      );
    }

    setMedsList(updated);
    onSaveMedications(updated);
    setEditingId(null);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleDeleteMedication = (id: string) => {
    if (window.confirm('¿Deseas eliminar este medicamento de tu plan de tratamiento?')) {
      const updated = medsList.filter((m) => m.id !== id);
      setMedsList(updated);
      onSaveMedications(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Gestionar Medicamentos de Control</h2>
              <p className="text-[11px] text-slate-500">Horarios, dosis y recordatorios automáticos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación Toast de éxito */}
        {showSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-xs text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Medicamento guardado y sincronizado correctamente.</span>
          </div>
        )}

        {/* Contenido interactivo */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Si estamos editando o creando */}
          {editingId ? (
            <form onSubmit={handleSaveForm} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-sky-600" />
                  <span>{editingId === 'new' ? 'Añadir Nuevo Medicamento' : 'Editar Medicamento'}</span>
                </h3>
                <span className="text-[10px] text-slate-500">* Campos obligatorios</span>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nombre con autocompletar sugerido */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Fármaco / Principio Activo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Budesonida / Formoterol"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Comunes:</span>
                  {COMMON_CONTROL_MEDS.slice(0, 3).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setName(sug)}
                      className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {sug.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de medicamento */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Medicación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('control')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      type === 'control'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Control (Diario)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('rescate')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      type === 'rescate'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Rescate (Alivio Rápido)</span>
                  </button>
                </div>
              </div>

              {/* Dosis y Frecuencia */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosis Prescrita *</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Ej: 1 inhalación"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frecuencia *</label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Ej: Cada 12 horas"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              {/* Horarios de toma */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Horarios de Toma Programados *</span>
                </label>

                {/* Lista de horas añadidas */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {schedules.map((time) => (
                    <span
                      key={time}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-800 rounded-lg font-bold text-xs"
                    >
                      {time}
                      <button
                        type="button"
                        onClick={() => removeScheduleTime(time)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Agregar nueva hora */}
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addScheduleTime(newScheduleTime)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Hora</span>
                  </button>
                </div>

                {/* Sugerencias de horas rápidas */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-slate-400 self-center">Preajustes:</span>
                  {PRESET_HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => addScheduleTime(h)}
                      className={`text-[10px] px-2 py-0.5 rounded-md ${
                        schedules.includes(h)
                          ? 'bg-sky-200 text-sky-800 font-bold'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instrucciones adicionales */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recomendaciones de Toma (Opcional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ej: Enjuague bucal tras inhalar o tomar con alimentos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              {/* Botones de acción del formulario */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Medicamento</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startNewMedication}
              className="w-full py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-dashed border-sky-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nuevo Medicamento al Plan</span>
            </button>
          )}

          {/* Lista actual de medicamentos */}
          <div className="space-y-2.5 pt-1">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
              Medicamentos en Tratamiento ({medsList.length})
            </h4>

            {medsList.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No tienes medicamentos registrados aún.</p>
            ) : (
              medsList.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{med.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          med.type === 'control'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {med.type}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">
                      <strong>Dosis:</strong> {med.dosage} • <strong>Frecuencia:</strong> {med.frequency}
                    </p>

                    {/* Horarios */}
                    {med.schedules && med.schedules.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-500 font-medium">Horarios:</span>
                        {med.schedules.map((s) => (
                          <span
                            key={s}
                            className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {med.instructions && (
                      <p className="text-[10px] text-slate-500 italic">💡 {med.instructions}</p>
                    )}
                  </div>

                  {/* Acciones de cada medicamento */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditMedication(med)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Editar medicamento"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedication(med.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar medicamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pie de modal */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Cerrar y Regresar
          </button>
        </div>
      </div>
    </div>
  );
};
