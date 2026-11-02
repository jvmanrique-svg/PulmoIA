/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, SymptomLog, PatientProfile, EnvironmentalData } from './types';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');

  // Stored state with local storage persistence
  const [patient, setPatient] = useState<PatientProfile>(() => {
    try {
      const saved = localStorage.getItem('pulmo_patient');
      return saved ? JSON.parse(saved) : INITIAL_PATIENT;
    } catch {
      return INITIAL_PATIENT;
    }
  });

  const [logs, setLogs] = useState<SymptomLog[]>(() => {
    try {
      const saved = localStorage.getItem('pulmo_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [environment] = useState<EnvironmentalData>(INITIAL_ENVIRONMENT);

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

  // Modal visibility states
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('pulmo_logs', JSON.stringify(logs));
    } catch {
      // Storage unavailable
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('pulmo_questions', JSON.stringify(selectedQuestions));
    } catch {
      // Storage unavailable
    }
  }, [selectedQuestions]);

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

  return (
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased flex flex-col justify-between selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Header */}
      <Header
        patient={patient}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigateHome={() => setActiveTab('inicio')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto px-gutter pt-18 pb-28">
        {activeTab === 'inicio' && (
          <HomeScreen
            patient={patient}
            logs={logs}
            environment={environment}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
          />
        )}

        {activeTab === 'registrar' && (
          <RegisterScreen
            onSaveLog={handleSaveLog}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'historial' && (
          <HistoryScreen
            logs={logs}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
            onDeleteLog={handleDeleteLog}
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

      {/* Fixed Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Global Interactive Overlays */}
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
        onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
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
