import React, { useState } from 'react';
import { CloudSyncConfig } from '../types';
import { 
  downloadBackupJSONFile, 
  restoreFromBackupJSON, 
  getCloudConfig, 
  saveCloudConfig, 
  testCloudConnection 
} from '../services/storageService';
import { 
  X, 
  Download, 
  Upload, 
  Cloud, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server,
  Lock
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [config, setConfig] = useState<CloudSyncConfig>(getCloudConfig);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCloudConnection(config);
      setTestResult(res);
      if (res.success) {
        const updatedConfig = { ...config, isConnected: true, lastSync: new Date().toLocaleTimeString('es-ES') };
        setConfig(updatedConfig);
        saveCloudConfig(updatedConfig);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await restoreFromBackupJSON(content);
      setImportStatus(res);
      if (res.success && onDataRestored) {
        setTimeout(() => {
          onDataRestored();
        }, 1200);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
              <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white text-sm">Persistencia y Nube</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Respaldo local y sincronización Supabase / Firebase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* 1. Almacenamiento Local Seguro */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/80 dark:border-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" />
                Almacenamiento Local Autónomo (IndexedDB)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                Activo Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Tus registros clínicos, medicaciones y notas se guardan de forma permanente en la base de datos local de tu navegador y funcionan 100% sin internet.
            </p>
          </div>

          {/* 2. Respaldo y Restauración JSON */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
              Copia de Seguridad y Portabilidad
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={downloadBackupJSONFile}
                className="p-3 bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 border border-sky-200 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-1 text-sky-800 dark:text-sky-300 font-bold transition-colors"
              >
                <Download className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Exportar Respaldo</span>
                <span className="text-[9px] font-normal text-slate-400">Descarga archivo .json</span>
              </button>

              <label className="p-3 bg-emerald-50 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-600 border border-emerald-200 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Restaurar Datos</span>
                <span className="text-[9px] font-normal text-slate-400">Cargar archivo .json</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                  importStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>

          {/* 3. Arquitectura para Integración con Nube (Supabase / Firebase) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-600" />
                Integración con Backend en la Nube
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                Listo para Conectar
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Conecta tu proyecto de <strong>Supabase</strong> o <strong>Firebase</strong> para sincronizar registros entre múltiples dispositivos o con tu hospital:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, provider: 'supabase' })}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  config.provider === 'supabase'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>Supabase</span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, provider: 'firebase' })}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  config.provider === 'firebase'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Firebase</span>
              </button>
            </div>

            {/* Inputs de Conexión */}
            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-750 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {config.provider === 'supabase' ? 'Supabase Project URL' : 'Firebase Project ID'}
                </label>
                <input
                  type="text"
                  value={config.url || ''}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder={config.provider === 'supabase' ? 'https://xyzcompany.supabase.co' : 'mi-proyecto-pulmoia'}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {config.provider === 'supabase' ? 'Anon Key / Public API Key' : 'Firebase Web API Key'}
                </label>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !config.url}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{isTesting ? 'Verificando...' : 'Probar y Guardar Conexión'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
