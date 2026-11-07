import React, { useState } from 'react';
import { SymptomLog } from '../types';
import { 
  TrendingUp, 
  Thermometer, 
  Wind, 
  Layers, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  Activity
} from 'lucide-react';

interface SymptomTempChartProps {
  logs: SymptomLog[];
  baselinePEF?: number;
}

type ViewMode = 'pef' | 'temp' | 'combined';
type RangeFilter = '7d' | '14d' | '30d' | 'all';

export const SymptomTempChart: React.FC<SymptomTempChartProps> = ({ logs, baselinePEF = 480 }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('7d');
  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  // Filter logs by range and ensure chronological order (oldest to newest for charts)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const now = Date.now();
  const rangeDays = rangeFilter === '7d' ? 7 : rangeFilter === '14d' ? 14 : rangeFilter === '30d' ? 30 : 365;
  const cutoffTime = now - rangeDays * 86400000;

  const filteredLogs = sortedLogs.filter(
    (l) => rangeFilter === 'all' || new Date(l.timestamp).getTime() >= cutoffTime
  );

  // If no logs, or only 1, display fallback
  if (filteredLogs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 text-center space-y-2">
        <Activity className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-bold text-slate-700">No hay datos en el rango seleccionado</p>
        <p className="text-[11px] text-slate-400">
          Registra tus mediciones diarias para visualizar las gráficas de temperatura y síntomas.
        </p>
      </div>
    );
  }

  // Summary calculations
  const avgPEF = Math.round(
    filteredLogs.reduce((acc, curr) => acc + curr.pef, 0) / filteredLogs.length
  );

  const logsWithTemp = filteredLogs.filter((l) => typeof l.temperature === 'number');
  const avgTemp = logsWithTemp.length > 0
    ? Math.round(
        (logsWithTemp.reduce((acc, curr) => acc + (curr.temperature || 0), 0) / logsWithTemp.length) * 10
      ) / 10
    : 21;

  const symptomaticDays = filteredLogs.filter(
    (l) => l.severity !== 'none' || (l.symptoms && l.symptoms.length > 0)
  ).length;

  const totalRescuePuffs = filteredLogs.reduce((acc, curr) => acc + (curr.rescuePuffs || 0), 0);

  // Chart dimensions
  const svgWidth = 380;
  const svgHeight = 180;
  const paddingX = 35;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Scale ranges
  const minPEF = Math.min(250, ...filteredLogs.map((l) => l.pef));
  const maxPEF = Math.max(baselinePEF + 40, ...filteredLogs.map((l) => l.pef));

  const minTemp = Math.min(10, ...logsWithTemp.map((l) => l.temperature || 20)) - 2;
  const maxTemp = Math.max(32, ...logsWithTemp.map((l) => l.temperature || 20)) + 2;

  const getX = (index: number) => {
    if (filteredLogs.length <= 1) return svgWidth / 2;
    return paddingX + (index / (filteredLogs.length - 1)) * plotWidth;
  };

  const getYPEF = (pef: number) => {
    const ratio = (pef - minPEF) / (maxPEF - minPEF);
    return svgHeight - paddingY - ratio * plotHeight;
  };

  const getYTemp = (temp: number) => {
    const ratio = (temp - minTemp) / (maxTemp - minTemp);
    return svgHeight - paddingY - ratio * plotHeight;
  };

  // Generate SVG path points
  const pefPoints = filteredLogs.map((log, i) => `${getX(i)},${getYPEF(log.pef)}`).join(' ');

  const tempPoints = filteredLogs
    .map((log, i) => {
      const t = log.temperature ?? 20;
      return `${getX(i)},${getYTemp(t)}`;
    })
    .join(' ');

  // PEF Thresholds
  const greenThreshold = baselinePEF * 0.8;
  const yellowThreshold = baselinePEF * 0.5;

  const yGreen = getYPEF(greenThreshold);
  const yYellow = getYPEF(yellowThreshold);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Cabecera y selectores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Evolución Respiratoria y Clima
            </h3>
            <p className="text-[11px] text-slate-500">Historial diario y factores correlacionados</p>
          </div>
        </div>

        {/* Filtros temporales */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-end sm:self-auto text-[10px] font-semibold">
          {(['7d', '14d', '30d', 'all'] as RangeFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRangeFilter(r)}
              className={`px-2 py-1 rounded-lg transition-all ${
                rangeFilter === r
                  ? 'bg-white text-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r === '7d' ? '7 Días' : r === '14d' ? '14 Días' : r === '30d' ? '30 Días' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de modo de gráfica */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/70 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setViewMode('pef')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'pef'
              ? 'bg-white text-sky-700 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Flujo PEF</span>
        </button>
        <button
          onClick={() => setViewMode('temp')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'temp'
              ? 'bg-white text-amber-600 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temperatura</span>
        </button>
        <button
          onClick={() => setViewMode('combined')}
          className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            viewMode === 'combined'
              ? 'bg-white text-emerald-700 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>PEF vs Temp</span>
        </button>
      </div>

      {/* Gráfica interactiva SVG */}
      <div className="relative bg-slate-50/70 rounded-2xl p-3 border border-slate-100 overflow-hidden">
        {/* Leyenda superior */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
          <div className="flex items-center gap-3">
            {(viewMode === 'pef' || viewMode === 'combined') && (
              <span className="flex items-center gap-1 font-semibold text-sky-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                PEF (L/min)
              </span>
            )}
            {(viewMode === 'temp' || viewMode === 'combined') && (
              <span className="flex items-center gap-1 font-semibold text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Temp (°C)
              </span>
            )}
          </div>
          <span className="text-slate-400">Toca un punto para ver detalles</span>
        </div>

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="pefGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas de referencia de zonas de asma (cuando se muestra PEF) */}
          {(viewMode === 'pef' || viewMode === 'combined') && (
            <>
              {/* Zona Verde (80%) */}
              <line
                x1={paddingX}
                y1={yGreen}
                x2={svgWidth - paddingX}
                y2={yGreen}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={paddingX}
                y={yGreen - 3}
                fill="#059669"
                fontSize="8"
                fontWeight="bold"
              >
                Óptimo 80% ({Math.round(greenThreshold)} L/min)
              </text>

              {/* Zona Amarilla (50%) */}
              <line
                x1={paddingX}
                y1={yYellow}
                x2={svgWidth - paddingX}
                y2={yYellow}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={paddingX}
                y={yYellow - 3}
                fill="#d97706"
                fontSize="8"
                fontWeight="bold"
              >
                Alerta 50% ({Math.round(yellowThreshold)} L/min)
              </text>
            </>
          )}

          {/* Línea y Relleno de Temperatura */}
          {(viewMode === 'temp' || viewMode === 'combined') && (
            <>
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={tempPoints}
              />
              {filteredLogs.map((log, i) => {
                const t = log.temperature ?? 20;
                const cx = getX(i);
                const cy = getYTemp(t);
                const isSelected = activeTooltipIndex === i;

                return (
                  <circle
                    key={`temp-${i}`}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 5 : 3.5}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onClick={() => setActiveTooltipIndex(i)}
                  />
                );
              })}
            </>
          )}

          {/* Línea y Relleno de PEF */}
          {(viewMode === 'pef' || viewMode === 'combined') && (
            <>
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pefPoints}
              />
              {filteredLogs.map((log, i) => {
                const cx = getX(i);
                const cy = getYPEF(log.pef);
                const isSelected = activeTooltipIndex === i;

                const dotColor =
                  log.zone === 'green'
                    ? '#10b981'
                    : log.zone === 'yellow'
                    ? '#f59e0b'
                    : '#ef4444';

                return (
                  <circle
                    key={`pef-${i}`}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : 4}
                    fill={dotColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-all hover:scale-125"
                    onClick={() => setActiveTooltipIndex(i)}
                  />
                );
              })}
            </>
          )}

          {/* Etiquetas del eje X (Fechas) */}
          {filteredLogs.map((log, i) => {
            // Mostrar etiqueta en el primer punto, el último y puntos intermedios
            if (filteredLogs.length > 5 && i % 2 !== 0 && i !== filteredLogs.length - 1) return null;
            const cx = getX(i);
            const d = new Date(log.timestamp);
            const label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

            return (
              <text
                key={`label-${i}`}
                x={cx}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="8"
                fill="#64748b"
                fontWeight="500"
              >
                {label}
              </text>
            );
          })}
        </svg>

        {/* Detalle flotante / Tooltip interactivo cuando se selecciona un punto */}
        {activeTooltipIndex !== null && filteredLogs[activeTooltipIndex] && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                {new Date(filteredLogs[activeTooltipIndex].timestamp).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltipIndex(null)}
                className="text-[10px] text-slate-400 hover:text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Flujo PEF: </span>
                <strong className="text-slate-800">
                  {filteredLogs[activeTooltipIndex].pef} L/min
                </strong>
                <span
                  className={`ml-1 text-[10px] font-bold ${
                    filteredLogs[activeTooltipIndex].zone === 'green'
                      ? 'text-emerald-600'
                      : filteredLogs[activeTooltipIndex].zone === 'yellow'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  ({filteredLogs[activeTooltipIndex].zone})
                </span>
              </div>

              <div>
                <span className="text-slate-400">Temperatura: </span>
                <strong className="text-amber-700">
                  {filteredLogs[activeTooltipIndex].temperature !== undefined
                    ? `${filteredLogs[activeTooltipIndex].temperature} °C`
                    : 'N/R'}
                </strong>
              </div>

              <div>
                <span className="text-slate-400">Severidad: </span>
                <strong className="capitalize text-slate-700">
                  {filteredLogs[activeTooltipIndex].severity}
                </strong>
              </div>

              <div>
                <span className="text-slate-400">Puffs de rescate: </span>
                <strong className="text-slate-700">
                  {filteredLogs[activeTooltipIndex].rescuePuffs}
                </strong>
              </div>
            </div>

            {filteredLogs[activeTooltipIndex].symptoms.length > 0 && (
              <div className="text-[10px] pt-1">
                <span className="text-slate-400">Síntomas: </span>
                <span className="text-slate-700 font-medium">
                  {filteredLogs[activeTooltipIndex].symptoms.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicadores clave resumidos en tarjetas */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
          <p className="text-[10px] text-sky-700 font-semibold">PEF Promedio</p>
          <p className="text-base font-extrabold text-sky-900">{avgPEF}</p>
          <p className="text-[9px] text-slate-400">L/min</p>
        </div>

        <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
          <p className="text-[10px] text-amber-700 font-semibold">Temp Media</p>
          <p className="text-base font-extrabold text-amber-900">{avgTemp} °C</p>
          <p className="text-[9px] text-slate-400">Registro diario</p>
        </div>

        <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
          <p className="text-[10px] text-rose-700 font-semibold">Días Síntomas</p>
          <p className="text-base font-extrabold text-rose-900">{symptomaticDays}</p>
          <p className="text-[9px] text-slate-400">de {filteredLogs.length} días</p>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-600 font-semibold">Rescates</p>
          <p className="text-base font-extrabold text-slate-800">{totalRescuePuffs}</p>
          <p className="text-[9px] text-slate-400">inhalaciones</p>
        </div>
      </div>
    </div>
  );
};
