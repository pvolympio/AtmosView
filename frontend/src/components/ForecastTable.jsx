import React from 'react';
import { Calendar, CloudRain, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import { getWeatherCondition } from '../utils/weatherUtils';


const ForecastTable = ({ daily }) => {
  // Translate weather codes, format dates and build lists
  const forecastDays = daily.time.map((timeStr, index) => {
    const parts = timeStr.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    
    // Formatting: "Sexta, 12 de Jun"
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    
    const formattedDate = date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });

    const condition = getWeatherCondition(daily.weather_code[index]);
    const ConditionIcon = condition.icon;

    return {
      dayLabel: capitalizedWeekday.split('-')[0], // e.g. "Terça" instead of "Terça-feira"
      dateLabel: formattedDate,
      maxTemp: daily.temperature_2m_max[index],
      minTemp: daily.temperature_2m_min[index],
      rain: daily.precipitation_sum[index],
      wind: daily.wind_speed_10m_max[index],
      conditionText: condition.text,
      ConditionIcon,
      conditionColor: condition.color
    };
  });

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl w-full">
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="text-indigo-400" size={18} />
        <div>
          <h3 className="text-sm font-bold text-white">Previsão para os Próximos Dias</h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Visão semanal detalhada</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-3 px-4">Dia</th>
              <th className="py-3 px-4">Condição</th>
              <th className="py-3 px-4">Temperatura</th>
              <th className="py-3 px-4 text-center">Chuva</th>
              <th className="py-3 px-4 text-center">Vento Máx</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-xs font-semibold">
            {forecastDays.map((day, idx) => (
              <tr key={idx} className="hover:bg-slate-900/25 transition-colors">
                {/* Day / Date */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="text-slate-200 block">{day.dayLabel}</span>
                  <span className="text-slate-500 text-[10px] font-medium block mt-0.5">{day.dateLabel}</span>
                </td>
                
                {/* Condition Icon + Text */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <day.ConditionIcon className={`w-5 h-5 shrink-0 ${day.conditionColor}`} />
                    <span className="text-slate-300 font-medium">{day.conditionText}</span>
                  </div>
                </td>
                
                {/* Temperature Min/Max */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center text-rose-400">
                      <ArrowUp size={11} className="mr-0.5" />
                      {day.maxTemp.toFixed(0)}°
                    </span>
                    <span className="flex items-center text-sky-400">
                      <ArrowDown size={11} className="mr-0.5" />
                      {day.minTemp.toFixed(0)}°
                    </span>
                  </div>
                </td>
                
                {/* Rain */}
                <td className="py-4 px-4 text-center whitespace-nowrap">
                  {day.rain > 0 ? (
                    <span className="inline-flex items-center gap-1 text-sky-400 bg-sky-950/20 px-2.5 py-1 rounded-lg border border-sky-900/30">
                      <CloudRain size={11} />
                      {day.rain.toFixed(1)} mm
                    </span>
                  ) : (
                    <span className="text-slate-600 font-normal">-</span>
                  )}
                </td>
                
                {/* Max Wind */}
                <td className="py-4 px-4 text-center whitespace-nowrap text-teal-400">
                  <span className="inline-flex items-center gap-1 bg-teal-950/10 px-2 py-1 rounded-lg">
                    <Wind size={11} />
                    {day.wind.toFixed(0)} km/h
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForecastTable;
