import { PatientProfile, SymptomLog, EnvironmentalData } from '../types';

export const INITIAL_PATIENT: PatientProfile = {
  name: 'Elena Morales',
  age: 28,
  asthmaType: 'Asma Alérgica Moderada Persistente',
  baselinePEF: 480, // L/min personal óptimo
  emergencyContact: {
    name: 'Carlos Morales (Hermano)',
    relation: 'Hermano',
    phone: '+54 9 11 4521-8899',
  },
  doctorContact: {
    name: 'Dra. Sofía Valenzuela',
    specialty: 'Neumonología Clínica',
    phone: '+54 9 11 5566-7788',
  },
  currentMedications: [
    {
      name: 'Budesonida / Formoterol (160/4.5 mcg)',
      type: 'control',
      dosage: '1 inhalación',
      frequency: 'Cada 12 horas (8:00 y 20:00)',
    },
    {
      name: 'Salbutamol (100 mcg)',
      type: 'rescate',
      dosage: '2 pulsaciones',
      frequency: 'Solo ante síntomas de crisis / previo a ejercicio',
    },
  ],
};

export const INITIAL_LOGS: SymptomLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    pef: 460,
    zone: 'green',
    severity: 'none',
    symptoms: [],
    triggers: ['Aire libre'],
    rescuePuffs: 0,
    medicationTaken: true,
    notes: 'Respiración clara. Sesión matutina completada.',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    pef: 390,
    zone: 'yellow',
    severity: 'mild',
    symptoms: ['Tos seca', 'Opresión leve'],
    triggers: ['Polvo / Ácaros', 'Cambio de temperatura'],
    rescuePuffs: 1,
    medicationTaken: true,
    notes: 'Molestia leve al limpiar la habitación.',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    pef: 475,
    zone: 'green',
    severity: 'none',
    symptoms: [],
    triggers: [],
    rescuePuffs: 0,
    medicationTaken: true,
    notes: 'Todo en orden sin fatiga respiratoria.',
  },
];

export const INITIAL_ENVIRONMENT: EnvironmentalData = {
  city: 'Ciudad de Buenos Aires',
  temperature: 21,
  humidity: 62,
  aqi: 38,
  aqiLevel: 'Excelente',
  pollenLevel: 'Moderado',
  recommendation: 'Condiciones óptimas para realizar actividades al aire libre.',
};
