import React, { useState, useEffect } from 'react';
import { Medication, MedicationReminder } from '../types';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Pill, 
  Settings, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface MedicationRemindersCardProps {
  medications: Medication[];
  onOpenMedicationManager: () => void;
}

export const MedicationRemindersCard: React.FC<MedicationRemindersCardProps> = ({
  medications,
  onOpenMedicationManager,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const storageKey = `pulmo_reminders_${todayStr}`;

  // Reminders state for today
  const [reminders, setReminders] = useState<{ [id: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Build flat list of today's scheduled doses
  const todayDoses: {
    key: string;
    medId: string;
    medName: string;
    type: 'control' | 'rescate';
    dosage: string;
    time: string;
    instructions?: string;
  }[] = [];

  medications.forEach((med) => {
    if (med.schedules && med.schedules.length > 0) {
      med.schedules.forEach((time) => {
        todayDoses.push({
          key: `${med.id}_${time}`,
          medId: med.id,
          medName: med.name,
          type: med.type,
          dosage: med.dosage,
          time,
          instructions: med.instructions,
        });
      });
    }
  });

  // Sort by time (e.g. 08:00, 14:00, 20:00)
  todayDoses.sort((a, b) => a.time.localeCompare(b.time));

  // Save changes to localStorage
  const toggleDose = (doseKey: string) => {
    const updated = {
      ...reminders,
      [doseKey]: !reminders[doseKey],
    };
    setReminders(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsAllowed(true);
        new Notification('PulmoIA Recordatorios', {
          body: '¡Notificaciones activadas! Te recordaremos la toma de tus inhaladores a tiempo.',
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const takenCount = todayDoses.filter((d) => reminders[d.key]).length;
  const totalCount = todayDoses.length;
  const percentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Bell className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Recordatorios de Hoy
            </h3>
            <p className="text-[11px] text-slate-500">Plan de inhaladores y medicamentos</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMedicationManager}
          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Editar medicamentos y horarios"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Progreso de adherencia */}
      {totalCount > 0 && (
        <div className="p-3 bg-gradient-to-r from-sky-50 to-teal-50 rounded-2xl border border-sky-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Adherencia terapéutica de hoy</span>
            <span className="font-extrabold text-sky-800">
              {takenCount} de {totalCount} ({percentage}%)
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage === 100 ? 'bg-emerald-500' : 'bg-sky-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de dosis programadas para hoy */}
      <div className="space-y-2">
        {todayDoses.length === 0 ? (
          <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
            <Pill className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">No hay tomas programadas</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Configura tus medicamentos y horarios para activar los recordatorios.
            </p>
            <button
              onClick={onOpenMedicationManager}
              className="mt-2.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Configurar Horarios
            </button>
          </div>
        ) : (
          todayDoses.map((dose) => {
            const isTaken = !!reminders[dose.key];

            return (
              <div
                key={dose.key}
                onClick={() => toggleDose(dose.key)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isTaken
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isTaken
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {isTaken ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4 text-sky-600" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{dose.time}</span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className={`font-semibold text-xs ${isTaken ? 'line-through opacity-75' : ''}`}>
                        {dose.medName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {dose.dosage}
                      {dose.instructions ? ` • ${dose.instructions}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDose(dose.key);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isTaken
                      ? 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  }`}
                >
                  {isTaken ? 'Tomada ✓' : 'Marcar'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Activar notificaciones del navegador */}
      <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <BellRing className={`w-3.5 h-3.5 ${notificationsAllowed ? 'text-emerald-500' : 'text-slate-400'}`} />
          <span className="text-[11px]">
            {notificationsAllowed ? 'Alarmas de navegador activas' : 'Notificaciones en segundo plano'}
          </span>
        </div>

        {!notificationsAllowed && (
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="text-sky-600 hover:text-sky-700 font-semibold text-[11px] underline"
          >
            Activar avisos
          </button>
        )}
      </div>
    </section>
  );
};
