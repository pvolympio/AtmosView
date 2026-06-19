import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CloudRain } from 'lucide-react';

export default function MultiSourceRainChart({ sources }) {
  const chartDataMap = {};

  if (sources.open_meteo?.daily_data) {
    sources.open_meteo.daily_data.forEach(d => {
      chartDataMap[d.date] = { date: d.date, open_meteo: d.rain };
    });
  }

  if (sources.nasa_power?.daily_data) {
    sources.nasa_power.daily_data.forEach(d => {
      if (!chartDataMap[d.date]) chartDataMap[d.date] = { date: d.date };
      chartDataMap[d.date].nasa_power = d.rain;
    });
  }

  if (sources.inmet?.daily_data) {
    sources.inmet.daily_data.forEach(d => {
      if (!chartDataMap[d.date]) chartDataMap[d.date] = { date: d.date };
      chartDataMap[d.date].inmet = d.rain;
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
        <span className="p-1.5 bg-indigo-550/10 text-indigo-400 rounded-lg">
          <CloudRain size={16} />
        </span>
        <h3 className="text-sm font-black text-white">Precipitação Diária Comparada</h3>
      </div>

      <div className="h-72 w-full text-slate-300">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                unit="mm"
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                labelFormatter={formatTooltipDate}
                formatter={(value) => [`${Number(value).toFixed(1)} mm`]}
              />
              <Legend 
                wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 10 }}
                verticalAlign="bottom"
              />
              <Bar 
                name="Open-Meteo" 
                dataKey="open_meteo" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
              {sources.nasa_power?.daily_data?.length > 0 && (
                <Bar 
                  name="NASA POWER" 
                  dataKey="nasa_power" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              )}
              {sources.inmet?.daily_data?.length > 0 && (
                <Bar 
                  name="INMET (Solo)" 
                  dataKey="inmet" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            Sem dados suficientes para gerar gráfico de chuva.
          </div>
        )}
      </div>
    </div>
  );
}
