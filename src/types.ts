export type TabType = 'inicio' | 'registrar' | 'historial' | 'educacion';

export type AsthmaZone = 'green' | 'yellow' | 'red';
export type SymptomSeverity = 'none' | 'mild' | 'moderate' | 'severe';

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
  notes?: string;
}

export interface PatientProfile {
  name: string;
  age: number;
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
  currentMedications: {
    name: string;
    type: 'rescate' | 'control';
    dosage: string;
    frequency: string;
  }[];
}

export interface EnvironmentalData {
  city: string;
  temperature: number; // °C
  humidity: number; // %
  aqi: number; // Índice de Calidad del Aire (ICA)
  aqiLevel: 'Excelente' | 'Aceptable' | 'Moderada' | 'Dañina';
  pollenLevel: 'Bajo' | 'Moderado' | 'Alto';
  recommendation: string;
}
