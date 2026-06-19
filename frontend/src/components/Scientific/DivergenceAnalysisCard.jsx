import React from 'react';
import { Compass, Thermometer, CloudRain, Wind, AlertTriangle } from 'lucide-react';

export default function DivergenceAnalysisCard({ metrics }) {
  const renderComparisonBlock = (title, data) => {
    if (!data) return null;

    return (
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3.5">
        <h4 className="text-xs font-black text-white border-b border-slate-800 pb-2 uppercase tracking-wider text-slate-400">
          {title}
        </h4>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Temperature divergence */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold">
              <Thermometer size={12} className="text-sky-400" />
              <span>Temp. Média</span>
            </div>
            <p className="text-sm font-black text-white">
              {data.diff_temp !== undefined ? `±${data.diff_temp.toFixed(1)}°C` : '-'}
            </p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
              data.div_temp_pct > 15 ? 'bg-rose-500/10 text-rose-400' :
              data.div_temp_pct > 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {data.div_temp_pct !== undefined ? `${data.div_temp_pct}% div` : '-'}
            </span>
          </div>

          {/* Rain divergence */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold">
              <CloudRain size={12} className="text-indigo-400" />
              <span>Precipitação</span>
            </div>
            <p className="text-sm font-black text-white">
              {data.diff_rain !== undefined ? `±${data.diff_rain.toFixed(1)} mm` : '-'}
            </p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
              data.div_rain_pct > 30 ? 'bg-rose-500/10 text-rose-400' :
              data.div_rain_pct > 10 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {data.div_rain_pct !== undefined ? `${data.div_rain_pct}% div` : '-'}
            </span>
          </div>

          {/* Wind divergence */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold">
              <Wind size={12} className="text-teal-400" />
              <span>Vento Máx</span>
            </div>
            <p className="text-sm font-black text-white">
              {data.diff_wind !== undefined ? `±${data.diff_wind.toFixed(1)} km/h` : '-'}
            </p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
              data.div_wind_pct > 30 ? 'bg-rose-500/10 text-rose-400' :
              data.div_wind_pct > 10 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {data.div_wind_pct !== undefined ? `${data.div_wind_pct}% div` : '-'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const hasMetrics = Object.keys(metrics).length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
          <Compass size={16} />
        </span>
        <h3 className="text-sm font-black text-white">Análise Científica de Divergência</h3>
      </div>

      {!hasMetrics ? (
        <div className="text-center py-6 text-slate-500 text-xs">
          Apenas uma fonte disponível no período. Divergência indisponível.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderBlock('Open-Meteo vs NASA POWER', metrics.open_meteo_vs_nasa_power)}
          {renderBlock('Open-Meteo vs INMET (Solo)', metrics.open_meteo_vs_inmet)}
        </div>
      )}
    </div>
  );

  function renderBlock(label, val) {
    if (!val) {
      return (
        <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-center gap-2 text-slate-500 text-xs italic">
          <AlertTriangle size={13} className="text-slate-600" />
          <span>{label} indisponível (dados insuficientes ou offline)</span>
        </div>
      );
    }
    return renderComparisonBlock(label, val);
  }
}
