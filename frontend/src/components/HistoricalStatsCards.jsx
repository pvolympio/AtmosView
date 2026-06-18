import React from 'react';
import { Thermometer, CloudRain, Sun, Wind, Droplets, Award } from 'lucide-react';

const HistoricalStatsCards = ({ stats }) => {
  if (!stats) return null;

  const {
    avg_temp, max_temp, max_temp_date, min_temp, min_temp_date,
    total_rain, avg_rain, max_rain, max_rain_date,
    days_no_rain, days_relevant_rain, days_hot
  } = stats;

  return (
    <div className="space-y-4 w-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Estatísticas Climatológicas Consolidadas</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
        {/* Avg Temp */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Thermometer size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Temp Média Período</span>
            <span className="text-lg font-black text-white block mt-0.5">{avg_temp.toFixed(1)}°C</span>
            <span className="text-[9px] text-slate-450 font-medium block">Média global calculada</span>
          </div>
        </div>

        {/* Max Temp */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <Sun size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Máxima Absoluta</span>
            <span className="text-lg font-black text-rose-400 block mt-0.5">{max_temp.toFixed(1)}°C</span>
            <span className="text-[9px] text-slate-450 font-medium block truncate max-w-[150px]">Registrado em {max_temp_date}</span>
          </div>
        </div>

        {/* Min Temp */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <Thermometer size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Mínima Absoluta</span>
            <span className="text-lg font-black text-sky-400 block mt-0.5">{min_temp.toFixed(1)}°C</span>
            <span className="text-[9px] text-slate-450 font-medium block truncate max-w-[150px]">Registrado em {min_temp_date}</span>
          </div>
        </div>

        {/* Total Rain */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <CloudRain size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Chuva Acumulada</span>
            <span className="text-lg font-black text-white block mt-0.5">{total_rain.toFixed(1)} mm</span>
            <span className="text-[9px] text-slate-450 font-medium block">Total precipitado no intervalo</span>
          </div>
        </div>

        {/* Max Rain Single Day */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <CloudRain size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Pico de Chuva Diário</span>
            <span className="text-lg font-black text-blue-400 block mt-0.5">{max_rain.toFixed(1)} mm</span>
            <span className="text-[9px] text-slate-450 font-medium block truncate max-w-[150px]">Registrado em {max_rain_date}</span>
          </div>
        </div>

        {/* Average Rain */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Droplets size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Chuva Média Diária</span>
            <span className="text-lg font-black text-white block mt-0.5">{avg_rain.toFixed(2)} mm</span>
            <span className="text-[9px] text-slate-450 font-medium block">Média por dia</span>
          </div>
        </div>

        {/* Days no rain */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Sun size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Dias Sem Chuva</span>
            <span className="text-lg font-black text-white block mt-0.5">{days_no_rain} dias</span>
            <span className="text-[9px] text-slate-450 font-medium block">Chuva inferior a 0.1mm</span>
          </div>
        </div>

        {/* Days relevant rain */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CloudRain size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Dias Com Chuva Ativa</span>
            <span className="text-lg font-black text-emerald-400 block mt-0.5">{days_relevant_rain} dias</span>
            <span className="text-[9px] text-slate-450 font-medium block">Volume superior a 2.0mm</span>
          </div>
        </div>

        {/* Hot days */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <Sun size={20} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Dias Quentes (Estresse)</span>
            <span className="text-lg font-black text-rose-500 block mt-0.5">{days_hot} dias</span>
            <span className="text-[9px] text-slate-450 font-medium block">Máxima superior a 32°C</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoricalStatsCards;
