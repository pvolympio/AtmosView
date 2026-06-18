import React from 'react';
import { Calendar, MapPin, Eye, RefreshCw, Thermometer, Droplets } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { getWeatherCondition } from '../utils/weatherUtils';


const HistoryTable = ({ items, onSelectRecord, onClearHistory }) => {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Histórico Consolidado de Consultas
          </h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">
            Registros de consultas persistidos no PostgreSQL
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 bg-red-950/20 hover:bg-red-950/45 text-red-400 hover:text-red-350 border border-red-900/30 hover:border-red-700/50 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Limpar Todo Histórico
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6">
          <Calendar size={36} className="mb-2.5 stroke-[1.5]" />
          <p className="text-xs font-semibold">Nenhuma consulta registrada até o momento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4">Métricas Climáticas</th>
                <th className="py-3 px-4 text-center">Nível de Risco</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-semibold">
              {items.map((item) => {
                const condition = getWeatherCondition(item.weather_code);
                const ConditionIcon = condition.icon;

                return (
                  <tr key={item.id} className="hover:bg-slate-900/15 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                      {formatDate(item.searched_at)}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-indigo-400" />
                        <div>
                          <span className="text-slate-200 block">{item.city_name}</span>
                          <span className="text-slate-500 text-[10px] font-medium block">
                            {item.state ? `${item.state}, ` : ''}{item.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Metrics */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-350">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ConditionIcon className={`w-4 h-4 ${condition.color}`} />
                          {item.temperature.toFixed(1)}°C
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Droplets size={12} className="text-sky-400" />
                          {item.relative_humidity.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Risk level */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <RiskBadge level={item.risk_level} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectRecord(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] uppercase font-bold transition-all shadow-md active:scale-95"
                      >
                        <RefreshCw size={11} />
                        Analisar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
