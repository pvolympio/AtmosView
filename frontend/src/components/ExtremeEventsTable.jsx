import React, { useState } from 'react';
import { Award, Sun, CloudRain, Wind, Calendar } from 'lucide-react';

const ExtremeEventsTable = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl w-full flex flex-col items-center justify-center h-[320px] text-slate-500">
        <Award size={36} className="mb-2" />
        <p className="text-xs font-semibold">Sem dados de eventos extremos para o período.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('heat');

  // Compute extremes dynamically from series
  const getTopExtremes = (key, count = 3) => {
    return [...dailyData]
      .sort((a, b) => b[key] - a[key])
      .slice(0, count);
  };

  const hottestDays = getTopExtremes('max_temp');
  const rainiestDays = getTopExtremes('rain');
  const windiestDays = getTopExtremes('wind_max');

  const tabConfigs = {
    heat: {
      label: "Calor Recorde",
      icon: Sun,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      data: hottestDays,
      unit: "°C",
      metricKey: "max_temp",
      metricLabel: "Temp Máxima"
    },
    rain: {
      label: "Chuva Intensa",
      icon: CloudRain,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      data: rainiestDays,
      unit: " mm",
      metricKey: "rain",
      metricLabel: "Volume Precipitação"
    },
    wind: {
      label: "Rajadas de Vento",
      icon: Wind,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      data: windiestDays,
      unit: " km/h",
      metricKey: "wind_max",
      metricLabel: "Vento Máximo"
    }
  };

  const activeConfig = tabConfigs[activeTab];
  const ActiveIcon = activeConfig.icon;

  const formatDate = (dateStr) => {
    const parts = dateStr.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl w-full flex flex-col h-[320px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Award className="text-amber-400" size={18} />
          <div>
            <h3 className="text-sm font-bold text-white">Eventos Extremos do Período</h3>
            <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Recordes de calor, vento e chuva</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950/45 p-1 rounded-xl border border-slate-850 w-full sm:w-auto">
          {Object.entries(tabConfigs).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-slate-800 text-white border border-slate-700/30' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={12} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <table className="w-full text-left text-xs font-semibold">
          <thead>
            <tr className="border-b border-slate-800 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">{activeConfig.metricLabel}</th>
              <th className="py-2.5 px-3 text-right">Comparativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/25">
            {activeConfig.data.map((item, idx) => {
              const val = item[activeConfig.metricKey];
              // Calculate width of percentage compared to absolute max in list
              const absoluteMax = activeConfig.data[0][activeConfig.metricKey];
              const widthPct = absoluteMax > 0 ? (val / absoluteMax) * 100 : 0;

              return (
                <tr key={idx} className="hover:bg-slate-900/15">
                  <td className="py-3.5 px-3 text-slate-200 flex items-center gap-2">
                    <Calendar size={13} className="text-slate-500" />
                    {formatDate(item.date)}
                  </td>
                  <td className={`py-3.5 px-3 font-black ${activeConfig.color}`}>
                    {val.toFixed(1)} {activeConfig.unit}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-block w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r from-indigo-500 ${activeConfig.color}`}
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExtremeEventsTable;
