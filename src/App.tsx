/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TabType, 
  SymptomLog, 
  PatientProfile, 
  EnvironmentalData, 
  AuthUser,
  Medication,
  ThemeMode 
} from './types';
import { INITIAL_PATIENT, INITIAL_LOGS, INITIAL_ENVIRONMENT } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { EducationScreen } from './components/EducationScreen';
import { DoctorReportModal } from './components/DoctorReportModal';
import { ProfileModal } from './components/ProfileModal';
import { EmergencyModal } from './components/EmergencyModal';
import { BreathingModal } from './components/BreathingModal';
import { MedicationManagerModal } from './components/MedicationManagerModal';
import { AuthScreen } from './components/AuthScreen';
import { AIChatScreen } from './components/AIChatScreen';
import { DoctorPortalScreen } from './components/DoctorPortalScreen';
import { CloudSyncModal } from './components/CloudSyncModal';
import { fetchLiveWeatherByCity } from './services/weatherService';
import { getAllSymptomLogs } from './db/localDB';
import { WifiOff, Sparkles, Check } from 'lucide-react';

export default function App() {
  // Estado de Tema Oscuro / Claro
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('pulmo_theme') as ThemeMode;
      if (savedTheme) return savedTheme;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Estado de Conectividad (Online / Offline PWA)
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // Estado de Autenticación (Login & Signup)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem('pulmo_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('inicio');

  // Estado del Paciente con persistencia en localStorage
  const [patient, setPatient] = useState<PatientProfile>(() => {
    try {
      const saved = localStorage.getItem('pulmo_patient');
      return saved ? JSON.parse(saved) : INITIAL_PATIENT;
    } catch {
      return INITIAL_PATIENT;
    }
  });

  // Historial de síntomas clínicos
  const [logs, setLogs] = useState<SymptomLog[]>(() => {
    try {
      const saved = localStorage.getItem('pulmo_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Datos ambientales (Clima, Humedad, AQI, UV, Alertas)
  const [environment, setEnvironment] = useState<EnvironmentalData>(() => {
    try {
      const saved = localStorage.getItem('pulmo_environment');
      return saved ? JSON.parse(saved) : INITIAL_ENVIRONMENT;
    } catch {
      return INITIAL_ENVIRONMENT;
    }
  });

  // Preguntas para la consulta médica
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pulmo_questions');
      return saved
        ? JSON.parse(saved)
        : [
            '¿Mi técnica de inhalación actual está garantizando que el fármaco llegue a mis bronquios?',
            '¿Cuál es mi valor de Flujo Espiratorio Máximo (PEF) de referencia personal óptimo?',
          ];
    } catch {
      return [];
    }
  });

  // Modales
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState<boolean>(false);
  const [isMedicationManagerOpen, setIsMedicationManagerOpen] = useState<boolean>(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState<boolean>(false);

  // Aplicar tema oscuro / claro a nivel del documento raíz
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('pulmo_theme', theme);
    } catch {}
  }, [theme]);

  // Listener para monitoreo de conectividad Online/Offline PWA
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar datos desde IndexedDB en inicio si existen
  useEffect(() => {
    getAllSymptomLogs()
      .then((idbLogs) => {
        if (idbLogs && idbLogs.length > 0) {
          setLogs(idbLogs);
        }
      })
      .catch((e) => console.warn('Carga IndexedDB fallback:', e));
  }, []);

  // Sincronizaciones con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pulmo_patient', JSON.stringify(patient));
    } catch {}
  }, [patient]);

  useEffect(() => {
    try {
      localStorage.setItem('pulmo_logs', JSON.stringify(logs));
    } catch {}
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('pulmo_environment', JSON.stringify(environment));
    } catch {}
  }, [environment]);

  useEffect(() => {
    try {
      localStorage.setItem('pulmo_questions', JSON.stringify(selectedQuestions));
    } catch {}
  }, [selectedQuestions]);

  // Actualización de clima inicial en segundo plano si la red está disponible
  useEffect(() => {
    if (navigator.onLine && environment.city) {
      fetchLiveWeatherByCity(environment.city.split(',')[0])
        .then((freshData) => {
          setEnvironment(freshData);
        })
        .catch(() => {});
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSaveLog = (newLog: SymptomLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const handleToggleQuestion = (question: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(question) ? prev.filter((q) => q !== question) : [...prev, question]
    );
  };

  const handleSaveMedications = (meds: Medication[]) => {
    setPatient((prev) => ({
      ...prev,
      currentMedications: meds,
    }));
  };

  const handleUpdatePatient = (updated: PatientProfile) => {
    setPatient(updated);
  };

  const handleLoginSuccess = (user: AuthUser, initialProfile?: Partial<PatientProfile>) => {
    setCurrentUser(user);
    if (initialProfile) {
      setPatient((prev) => {
        const merged: PatientProfile = {
          ...prev,
          name: initialProfile.name || prev.name,
          phone: initialProfile.phone || prev.phone,
          nationality: initialProfile.nationality || prev.nationality,
          asthmaType: initialProfile.asthmaType || prev.asthmaType,
          age: initialProfile.age || prev.age,
          email: initialProfile.email || prev.email,
        };
        try {
          localStorage.setItem('pulmo_patient', JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pulmo_auth_user');
    setCurrentUser(null);
    setActiveTab('inicio');
  };

  const handleDataRestored = () => {
    try {
      const restoredPatient = localStorage.getItem('pulmo_patient');
      if (restoredPatient) setPatient(JSON.parse(restoredPatient));
      const restoredLogs = localStorage.getItem('pulmo_logs');
      if (restoredLogs) setLogs(JSON.parse(restoredLogs));
      setIsCloudSyncOpen(false);
    } catch {}
  };

  // Si no está autenticado, muestra la Pantalla de Autenticación
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 antialiased flex flex-col justify-between selection:bg-sky-100 dark:selection:bg-sky-950 selection:text-sky-900 dark:selection:text-sky-200 transition-colors duration-200">
      {/* Barra Superior con Toggle de Modo Oscuro / Claro y Persistencia */}
      <Header
        patient={patient}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateHome={() => setActiveTab('inicio')}
        onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        onLogout={handleLogout}
      />

      {/* Banner de Estado Offline PWA */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-amber-500 text-white py-1 px-4 text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm animate-in slide-in-from-top">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo Sin Conexión activo — Tus registros se guardan en IndexedDB y se sincronizarán al reconectar.</span>
        </div>
      )}

      {/* Área Principal de Contenido */}
      <main className={`flex-1 flex flex-col relative w-full max-w-md mx-auto px-4 ${!isOnline ? 'pt-24' : 'pt-20'} pb-24`}>
        {activeTab === 'inicio' && (
          <HomeScreen
            patient={patient}
            logs={logs}
            environment={environment}
            onUpdateEnvironment={setEnvironment}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenMedicationManager={() => setIsMedicationManagerOpen(true)}
          />
        )}

        {activeTab === 'asistente' && (
          <AIChatScreen
            patient={patient}
            environment={environment}
            logs={logs}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === 'medico' && (
          <DoctorPortalScreen
            patient={patient}
            logs={logs}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          />
        )}

        {activeTab === 'registrar' && (
          <RegisterScreen
            onSaveLog={handleSaveLog}
            onNavigate={(tab) => setActiveTab(tab)}
            currentEnvironment={environment}
          />
        )}

        {activeTab === 'historial' && (
          <HistoryScreen
            logs={logs}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
            onDeleteLog={handleDeleteLog}
            baselinePEF={patient.baselinePEF}
          />
        )}

        {activeTab === 'educacion' && (
          <EducationScreen
            onOpenBreathing={() => setIsBreathingOpen(true)}
            selectedQuestions={selectedQuestions}
            onToggleQuestion={handleToggleQuestion}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          />
        )}
      </main>

      {/* Barra de Navegación Inferior Fija (5 Pestañas Clave) */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Modales y Capas Interactivas */}
      <DoctorReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        patient={patient}
        logs={logs}
        selectedQuestions={selectedQuestions}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        patient={patient}
        onUpdatePatient={handleUpdatePatient}
        onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onLogout={handleLogout}
      />

      <MedicationManagerModal
        isOpen={isMedicationManagerOpen}
        onClose={() => setIsMedicationManagerOpen(false)}
        medications={patient.currentMedications}
        onSaveMedications={handleSaveMedications}
      />

      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onDataRestored={handleDataRestored}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />
    </div>
  );
}
