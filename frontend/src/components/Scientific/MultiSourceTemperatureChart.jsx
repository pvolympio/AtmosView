import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Thermometer } from 'lucide-react';

export default function MultiSourceTemperatureChart({ sources }) {
  const chartDataMap = {};

  if (sources.open_meteo?.daily_data) {
    sources.open_meteo.daily_data.forEach(d => {
      chartDataMap[d.date] = { date: d.date, open_meteo: d.mean_temp };
    });
  }

  if (sources.nasa_power?.daily_data) {
    sources.nasa_power.daily_data.forEach(d => {
      if (!chartDataMap[d.date]) chartDataMap[d.date] = { date: d.date };
      chartDataMap[d.date].nasa_power = d.mean_temp;
    });
  }

  if (sources.inmet?.daily_data) {
    sources.inmet.daily_data.forEach(d => {
      if (!chartDataMap[d.date]) chartDataMap[d.date] = { date: d.date };
      chartDataMap[d.date].inmet = d.mean_temp;
    });
  }

  const chartData = Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date));

  const formatDateLabel = (tickItem) => {
    if (!tickItem) return '';
    const parts = tickItem.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return tickItem;
  };

  const formatTooltipDate = (value) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return value;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
          <Thermometer size={16} />
        </span>
        <h3 className="text-sm font-black text-white">Curvas de Temperatura Média</h3>
      </div>

      <div className="h-72 w-full text-slate-300">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                stroke="#334155"
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                stroke="#334155"
                unit="°C"
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                labelFormatter={formatTooltipDate}
                formatter={(value) => [`${Number(value).toFixed(1)}°C`]}
              />
              <Legend 
                wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 10 }}
                verticalAlign="bottom"
              />
              <Line 
                name="Open-Meteo" 
                type="monotone" 
                dataKey="open_meteo" 
                stroke="#38bdf8" 
                strokeWidth={2.5} 
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
              {sources.nasa_power?.daily_data?.length > 0 && (
                <Line 
                  name="NASA POWER" 
                  type="monotone" 
                  dataKey="nasa_power" 
                  stroke="#fbbf24" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              )}
              {sources.inmet?.daily_data?.length > 0 && (
                <Line 
                  name="INMET (Solo)" 
                  type="monotone" 
                  dataKey="inmet" 
                  stroke="#34d399" 
                  strokeWidth={2.5} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            Sem dados suficientes para gerar gráfico de temperatura.
          </div>
        )}
      </div>
    </div>
  );
}
