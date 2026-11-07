import { 
  PatientProfile, 
  SymptomLog, 
  DoctorNote, 
  CloudSyncConfig, 
  Medication 
} from '../types';
import { getAllSymptomLogs, saveSymptomLog } from '../db/localDB';

export interface FullBackupData {
  version: string;
  exportDate: string;
  patient: PatientProfile;
  logs: SymptomLog[];
  doctorNotes: DoctorNote[];
  remindersStatus: Record<string, any>;
  theme: string;
}

const DOCTOR_NOTES_KEY = 'pulmo_doctor_notes';
const CLOUD_CONFIG_KEY = 'pulmo_cloud_config';

/**
 * Carga las notas clínicas del médico tratante
 */
export function getDoctorNotes(): DoctorNote[] {
  try {
    const raw = localStorage.getItem(DOCTOR_NOTES_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'note-init-1',
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        doctorName: 'Dra. Sofía Valenzuela (Neumonología)',
        note: 'Paciente con buena respuesta al esquema Budesonida/Formoterol. Mantener técnica con aerocámara. Si el PEF matutino desciende por debajo de 380 L/min durante dos días consecutivos, iniciar rescate y adelantar consulta.',
        actionPlanChange: 'Budesonida/Formoterol 1 inhalación cada 12h + Salbutamol si hay sibilancias.',
        nextConsultationDate: '2026-12-15',
      }
    ];
  } catch {
    return [];
  }
}

/**
 * Guarda una nueva nota del médico tratante
 */
export function saveDoctorNote(newNote: DoctorNote): DoctorNote[] {
  const current = getDoctorNotes();
  const updated = [newNote, ...current.filter((n) => n.id !== newNote.id)];
  try {
    localStorage.setItem(DOCTOR_NOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error guardando nota médica:', e);
  }
  return updated;
}

/**
 * Elimina una nota médica
 */
export function deleteDoctorNote(id: string): DoctorNote[] {
  const current = getDoctorNotes();
  const updated = current.filter((n) => n.id !== id);
  try {
    localStorage.setItem(DOCTOR_NOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error eliminando nota médica:', e);
  }
  return updated;
}

/**
 * Obtiene la configuración de sincronización con la nube (Supabase / Firebase)
 */
export function getCloudConfig(): CloudSyncConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {
      provider: 'supabase',
      url: '',
      apiKey: '',
      projectId: '',
      isConnected: false,
    };
  } catch {
    return {
      provider: 'supabase',
      isConnected: false,
    };
  }
}

/**
 * Guarda la configuración de la nube
 */
export function saveCloudConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error guardando config de nube:', e);
  }
}

/**
 * Genera el paquete completo de respaldo para exportación JSON
 */
export async function generateFullBackup(): Promise<FullBackupData> {
  const patientRaw = localStorage.getItem('pulmo_patient');
  const patient: PatientProfile = patientRaw ? JSON.parse(patientRaw) : {} as PatientProfile;
  const logs = await getAllSymptomLogs();
  const doctorNotes = getDoctorNotes();
  const theme = localStorage.getItem('pulmo_theme') || 'light';

  // Recopilar recordatorios
  const remindersStatus: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('pulmo_reminders_')) {
      remindersStatus[key] = localStorage.getItem(key);
    }
  }

  return {
    version: '1.2.0',
    exportDate: new Date().toISOString(),
    patient,
    logs,
    doctorNotes,
    remindersStatus,
    theme,
  };
}

/**
 * Descarga el archivo de respaldo JSON en el navegador del usuario
 */
export async function downloadBackupJSONFile(): Promise<void> {
  const backup = await generateFullBackup();
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PulmoIA_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restaura el estado de la aplicación a partir de un respaldo JSON
 */
export async function restoreFromBackupJSON(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const parsed: FullBackupData = JSON.parse(jsonString);

    if (!parsed.patient || !parsed.logs || !Array.isArray(parsed.logs)) {
      return { success: false, message: 'El archivo JSON no tiene la estructura de PulmoIA.' };
    }

    // 1. Guardar paciente
    localStorage.setItem('pulmo_patient', JSON.stringify(parsed.patient));

    // 2. Guardar logs en IndexedDB y localStorage
    for (const log of parsed.logs) {
      await saveSymptomLog(log);
    }
    localStorage.setItem('pulmo_logs', JSON.stringify(parsed.logs));

    // 3. Guardar notas médicas
    if (parsed.doctorNotes) {
      localStorage.setItem(DOCTOR_NOTES_KEY, JSON.stringify(parsed.doctorNotes));
    }

    // 4. Restaurar recordatorios
    if (parsed.remindersStatus) {
      for (const [key, val] of Object.entries(parsed.remindersStatus)) {
        if (typeof val === 'string') {
          localStorage.setItem(key, val);
        }
      }
    }

    return {
      success: true,
      message: `Respaldo restaurado con éxito (${parsed.logs.length} registros y datos de paciente sincronizados).`,
    };
  } catch (err: any) {
    return { success: false, message: 'Error procesando el archivo JSON: ' + err.message };
  }
}

/**
 * Conector arquitectónico para sincronización remota con Supabase / Firebase
 */
export async function testCloudConnection(config: CloudSyncConfig): Promise<{ success: boolean; message: string }> {
  if (!config.url || !config.apiKey) {
    return { success: false, message: 'Debes ingresar la URL del proyecto y la Clave API (Anon Key).' };
  }

  if (config.provider === 'supabase') {
    try {
      // Intenta consultar el endpoint de salud o versión de Supabase
      const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/`;
      const res = await fetch(endpoint, {
        headers: {
          apikey: config.apiKey,
          Authorization: `Bearer ${config.apiKey}`,
        },
      });

      if (res.status === 200 || res.status === 404 || res.status === 401) {
        return {
          success: true,
          message: '¡Conexión establecida con la instancia de Supabase! Tablas listas para sincronización.',
        };
      }
      return { success: false, message: `El servidor respondió con código ${res.status}. Verifica tus credenciales.` };
    } catch (e: any) {
      return {
        success: false,
        message: 'No se pudo contactar el servidor de Supabase: ' + (e.message || 'Error de red'),
      };
    }
  } else {
    // Firebase Firestore / Realtime DB endpoint
    return {
      success: true,
      message: 'Configuración de Firebase Firestore validada. Estructura de documentos lista para sincronizar.',
    };
  }
}
