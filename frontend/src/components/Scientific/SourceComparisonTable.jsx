import React from 'react';
import { Percent, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';

export default function SourceComparisonTable({ sources }) {
  const getExtremeTemps = (dailyData) => {
    if (!dailyData || dailyData.length === 0) return { max: '-', min: '-' };
    const maxs = dailyData.map(d => d.max_temp).filter(v => v !== null && v !== undefined);
    const mins = dailyData.map(d => d.min_temp).filter(v => v !== null && v !== undefined);
    
    return {
      max: maxs.length ? `${Math.max(...maxs).toFixed(1)}°C` : '-',
      min: mins.length ? `${Math.min(...mins).toFixed(1)}°C` : '-'
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg">
          <Percent size={16} />
        </span>
        <h3 className="text-sm font-black text-white">Resumo Climatológico Comparativo</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold">
              <th className="py-3 px-4">Fonte de Dados</th>
              <th className="py-3 px-4 flex items-center gap-1"><Thermometer size={12} /> Temp. Média</th>
              <th className="py-3 px-4">Temp. Máx Abs.</th>
              <th className="py-3 px-4">Temp. Mín Abs.</th>
              <th className="py-3 px-4"><Droplets size={12} /> Chuva Acumulada</th>
              <th className="py-3 px-4"><Wind size={12} /> Vento Máx</th>
              <th className="py-3 px-4">Disponibilidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {Object.entries(sources).map(([key, data]) => {
              const stats = data.stats || {};
              const quality = data.quality_report || {};
              const extremes = getExtremeTemps(data.daily_data);
              const hasData = data.daily_data && data.daily_data.length > 0;

              return (
                <tr key={key} className="hover:bg-slate-800/30 transition-all text-slate-200">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {data.metadata?.name || key}
                  </td>
                  <td className="py-3.5 px-4 text-slate-100">
                    {hasData ? `${stats.avg_temp.toFixed(1)}°C` : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-3.5 px-4 text-orange-400">
                    {extremes.max}
                  </td>
                  <td className="py-3.5 px-4 text-sky-400">
                    {extremes.min}
                  </td>
                  <td className="py-3.5 px-4 text-indigo-400 font-bold">
                    {hasData ? `${stats.total_rain.toFixed(1)} mm` : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {hasData ? `${stats.max_wind.toFixed(1)} km/h` : <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      quality.completeness_percentage >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                      quality.completeness_percentage >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {quality.completeness_percentage}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Aviso caso INMET esteja zerado */}
      {!sources.inmet || !sources.inmet.daily_data || sources.inmet.daily_data.length === 0 ? (
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2 text-[11px] text-amber-400">
          <AlertTriangle size={14} className="shrink-0" />
          <span>A estação oficial do INMET está indisponível para esta localidade ou período. Exibindo apenas reanálise de satélite global.</span>
        </div>
      ) : null}
    </div>
  );
}
