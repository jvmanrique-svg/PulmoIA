import React, { useState } from 'react';
import { EnvironmentalData, RespiratoryAlert } from '../types';
import { 
  fetchLiveWeatherByCity, 
  fetchLiveWeatherByCoords 
} from '../services/weatherService';
import { 
  Sun, 
  Droplets, 
  Wind, 
  MapPin, 
  Search, 
  Navigation, 
  AlertTriangle, 
  ShieldCheck, 
  Key, 
  Sparkles, 
  RefreshCw,
  CheckCircle2,
  Info
} from 'lucide-react';

interface WeatherAlertsCardProps {
  environment: EnvironmentalData;
  onUpdateEnvironment: (data: EnvironmentalData) => void;
  patientCondition?: string;
}

export const WeatherAlertsCard: React.FC<WeatherAlertsCardProps> = ({
  environment,
  onUpdateEnvironment,
  patientCondition = 'Asma',
}) => {
  const [searchCity, setSearchCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('pulmo_owm_key') || '');
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchLiveWeatherByCity(searchCity);
      onUpdateEnvironment(data);
      setSearchCity('');
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo obtener el clima para esa ciudad.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseGPS = () => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Tu dispositivo no tiene soporte de geolocalización GPS.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchLiveWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          onUpdateEnvironment(data);
        } catch (err: any) {
          setErrorMessage('No se pudo sincronizar el clima por GPS. Usa el buscador manual.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        let msg = 'Permiso de ubicación denegado. Ingresa tu ciudad manualmente.';
        if (error.code === error.TIMEOUT) msg = 'Tiempo de espera de GPS agotado. Ingresa tu ciudad manualmente.';
        setErrorMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = apiKeyInput.trim();
    if (clean) {
      localStorage.setItem('pulmo_owm_key', clean);
    } else {
      localStorage.removeItem('pulmo_owm_key');
    }
    setApiSaveSuccess(true);
    setTimeout(() => {
      setApiSaveSuccess(false);
      setShowApiKeyModal(false);
    }, 1500);
  };

  // Color schemes for AQI badge
  const aqiBadge = {
    Excelente: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Aceptable: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    Moderada: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Dañina: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'Muy Dañina': 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  }[environment.aqiLevel] || 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200';

  // Color schemes for UV badge
  const uvBadge = {
    Bajo: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Moderado: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Alto: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    'Muy Alto': 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    Extremo: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  }[environment.uvLevel] || 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200';

  return (
    <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 transition-colors">
      {/* Cabecera con ubicación actual y botón GPS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
              {environment.city}
            </h3>
            <p className="text-[10px] text-slate-400">
              {environment.lastUpdated ? `Actualizado: ${environment.lastUpdated}` : 'Monitoreo ambiental en vivo'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUseGPS}
            disabled={isLoading}
            className="p-1.5 bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 text-sky-700 dark:text-sky-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Detectar por GPS"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-[11px] hidden sm:inline">GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Configurar OpenWeatherMap API"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Buscador manual de ciudad con fallback */}
      <form onSubmit={handleManualSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Buscar ciudad manual (ej. Madrid, Bogotá...)"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs bg-slate-50 dark:bg-slate-700/60 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !searchCity.trim()}
          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span>Buscar</span>
          )}
        </button>
      </form>

      {/* Mensaje de error si falla la búsqueda */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tarjetas de métricas ambientales: Temperatura, Humedad, AQI y UV */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        {/* Temperatura */}
        <div className="p-2.5 bg-slate-50/80 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-between">
          <Sun className="w-4 h-4 text-amber-500 mb-1" />
          <p className="text-[10px] text-slate-400">Temperatura</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{environment.temperature} °C</p>
        </div>

        {/* Humedad */}
        <div className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between ${
          environment.humidity > 70 || environment.humidity < 35
            ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50/80 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700'
        }`}>
          <Droplets className={`w-4 h-4 mb-1 ${
            environment.humidity > 70 ? 'text-blue-600' : 'text-sky-500'
          }`} />
          <p className="text-[10px] text-slate-400">Humedad</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{environment.humidity}%</p>
        </div>

        {/* Calidad del Aire (AQI) */}
        <div className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between ${
          environment.aqi > 100 
            ? 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800' 
            : 'bg-slate-50/80 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700'
        }`}>
          <Wind className={`w-4 h-4 mb-1 ${
            environment.aqi > 100 ? 'text-rose-500' : 'text-emerald-500'
          }`} />
          <p className="text-[10px] text-slate-400">Calidad (ICA)</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{environment.aqi}</p>
        </div>

        {/* Índice UV */}
        <div className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between ${
          environment.uvIndex >= 6 
            ? 'bg-orange-50/80 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800' 
            : 'bg-slate-50/80 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700'
        }`}>
          <Sparkles className={`w-4 h-4 mb-1 ${
            environment.uvIndex >= 8 ? 'text-purple-600' : environment.uvIndex >= 6 ? 'text-orange-500' : 'text-amber-500'
          }`} />
          <p className="text-[10px] text-slate-400">Índice UV</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">{environment.uvIndex}</p>
        </div>
      </div>

      {/* Badges de Calidad del Aire e Índice UV */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
        <span className={`px-2.5 py-0.5 rounded-full border ${aqiBadge}`}>
          Aire: {environment.aqiLevel} (ICA {environment.aqi})
        </span>
        <span className={`px-2.5 py-0.5 rounded-full border ${uvBadge}`}>
          Radiación UV: {environment.uvLevel} ({environment.uvIndex})
        </span>
      </div>

      {/* ALERTAS RESPIRATORIAS CLÍNICAS (Humedad, Calidad de Aire, Índice UV para Asma / EPOC) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Alertas Clínicas para {patientCondition}</span>
          </span>
          <span className="text-[10px] text-slate-400">Prevención de crisis</span>
        </div>

        {environment.alerts && environment.alerts.length > 0 ? (
          environment.alerts.map((alert) => {
            const isDanger = alert.severity === 'danger';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs transition-colors ${
                  isDanger
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : isWarning
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-xs">{alert.title}</p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isDanger
                          ? 'bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                          : isWarning
                          ? 'bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                          : 'bg-sky-200/80 dark:bg-sky-900 text-sky-900 dark:text-sky-200'
                      }`}
                    >
                      {alert.badge}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Condiciones ambientales óptimas. Sin alertas activas para tus bronquios.</span>
          </div>
        )}
      </div>

      {/* Modal para configurar API Key de OpenWeatherMap opcional */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">API Key OpenWeatherMap</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              PulmoIA incluye integración automática en vivo con sensores globales.
              Si deseas utilizar tu propia clave comercial de OpenWeatherMap, ingrésala a continuación:
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Pega tu App ID de OpenWeatherMap..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-200"
              />

              {apiSaveSuccess && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clave guardada correctamente.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Guardar Clave
                </button>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
