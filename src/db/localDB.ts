import { SymptomLog } from '../types';

const DB_NAME = 'PulmoHealthDB';
const DB_VERSION = 1;
const STORE_NAME = 'symptom_logs';

/**
 * Inicializa la base de datos local IndexedDB
 */
export function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB no está soportado en este navegador'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('zone', 'zone', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Guarda un registro de síntomas en IndexedDB y sincroniza con localStorage
 */
export async function saveSymptomLog(log: SymptomLog): Promise<boolean> {
  // 1. Guardar en IndexedDB
  try {
    const db = await openLocalDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(log);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Fallo al guardar en IndexedDB, usando fallback LocalStorage:', err);
  }

  // 2. Sincronizar con LocalStorage para persistencia instantánea y redundancia
  try {
    const existing = localStorage.getItem('pulmo_logs');
    const logs: SymptomLog[] = existing ? JSON.parse(existing) : [];
    const updatedLogs = [log, ...logs.filter((item) => item.id !== log.id)];
    localStorage.setItem('pulmo_logs', JSON.stringify(updatedLogs));
  } catch (err) {
    console.error('Error al sincronizar con localStorage:', err);
  }

  return true;
}

/**
 * Obtiene todos los registros desde IndexedDB con fallback a localStorage
 */
export async function getAllSymptomLogs(): Promise<SymptomLog[]> {
  try {
    const db = await openLocalDB();
    return await new Promise<SymptomLog[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as SymptomLog[];
        // Ordenar por fecha descendente
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    // Fallback a localStorage
    const saved = localStorage.getItem('pulmo_logs');
    return saved ? JSON.parse(saved) : [];
  }
}

/**
 * Elimina un registro de la base de datos local
 */
export async function deleteSymptomLog(id: string): Promise<boolean> {
  try {
    const db = await openLocalDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Error eliminando de IndexedDB:', e);
  }

  try {
    const existing = localStorage.getItem('pulmo_logs');
    if (existing) {
      const logs: SymptomLog[] = JSON.parse(existing);
      localStorage.setItem('pulmo_logs', JSON.stringify(logs.filter((l) => l.id !== id)));
    }
  } catch (e) {
    console.error('Error sincronizando eliminación en localStorage:', e);
  }

  return true;
}

/**
 * Calcula la zona de asma según el valor PEF frente al óptimo personal
 */
export function calculateAsthmaZone(pef: number, baselinePEF = 480): 'green' | 'yellow' | 'red' {
  const ratio = pef / baselinePEF;
  if (ratio >= 0.8) return 'green'; // ≥ 80%
  if (ratio >= 0.5) return 'yellow'; // 50% - 79%
  return 'red'; // < 50%
}
