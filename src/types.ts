export type TabType = 'inicio' | 'registrar' | 'historial' | 'educacion';

export type AsthmaZone = 'green' | 'yellow' | 'red';
export type SymptomSeverity = 'none' | 'mild' | 'moderate' | 'severe';

export interface Medication {
  id: string;
  name: string;
  type: 'rescate' | 'control';
  dosage: string;
  frequency: string;
  schedules: string[]; // Ej: ["08:00", "20:00"]
  instructions?: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string; // "08:00"
  dosage: string;
  type: 'rescate' | 'control';
  taken: boolean;
  takenAt?: string;
  date: string; // YYYY-MM-DD
}

export interface SymptomLog {
  id: string;
  timestamp: string; // ISO string o formato legible
  pef: number; // L/min (Flujo Espiratorio Máximo)
  zone: AsthmaZone;
  severity: SymptomSeverity;
  symptoms: string[];
  triggers: string[];
  rescuePuffs: number;
  medicationTaken: boolean;
  temperature?: number; // °C registrado al momento
  humidity?: number; // % humedad
  aqi?: number; // Calidad del aire
  uvIndex?: number; // Índice UV
  location?: string; // Ciudad de registro
  notes?: string;
}

export interface PatientProfile {
  name: string;
  age: number;
  phone?: string;
  nationality?: string;
  email?: string;
  asthmaType: string;
  baselinePEF: number; // Valor personal óptimo de referencia
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  doctorContact: {
    name: string;
    specialty: string;
    phone: string;
  };
  currentMedications: Medication[];
}

export interface RespiratoryAlert {
  id: string;
  type: 'humidity' | 'aqi' | 'uv' | 'temperature' | 'general';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  targetCondition: 'Asma' | 'EPOC' | 'Ambos';
  badge: string;
}

export interface EnvironmentalData {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  temperature: number; // °C
  humidity: number; // %
  aqi: number; // Índice de Calidad del Aire (ICA)
  aqiLevel: 'Excelente' | 'Aceptable' | 'Moderada' | 'Dañina' | 'Muy Dañina';
  uvIndex: number; // Índice UV (0 a 11+)
  uvLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto' | 'Extremo';
  pollenLevel: 'Bajo' | 'Moderado' | 'Alto';
  recommendation: string;
  alerts: RespiratoryAlert[];
  lastUpdated?: string;
  isCustomKey?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  condition?: string;
  age?: number;
  token?: string;
}
