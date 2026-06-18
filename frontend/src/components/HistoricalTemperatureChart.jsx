import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Thermometer } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-semibold">
        <p className="text-slate-400 mb-1.5">Data: <span className="text-slate-200">{label}</span></p>
        <p className="text-rose-400 flex items-center gap-1.5 font-extrabold mb-1">
          Máx: {payload[0].value.toFixed(1)}°C
        </p>
        {payload[1] && (
          <p className="text-indigo-400 flex items-center gap-1.5 font-extrabold mb-1">
            Média: {payload[1].value.toFixed(1)}°C
          </p>
        )}
        {payload[2] && (
          <p className="text-sky-400 flex items-center gap-1.5 font-extrabold">
            Mín: {payload[2].value.toFixed(1)}°C
          </p>
        )}
      </div>
    );
  }
  return null;
};

const HistoricalTemperatureChart = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl w-full flex items-center justify-center h-[320px] text-slate-500 text-xs font-semibold">
        Sem dados de temperatura para exibição.
      </div>
    );
  }

  const chartData = dailyData.map((day) => {
    // Format date simple "DD/MM/YYYY" or "DD/MM"
    const parts = day.date.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}`;
    return {
      name: formattedDate,
      max: day.max_temp,
      mean: day.mean_temp,
      min: day.min_temp
    };
  });

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl w-full flex flex-col h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="text-rose-450" size={18} />
        <div>
          <h3 className="text-sm font-bold text-white">Série de Temperaturas</h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Evolução diária das máximas, médias e mínimas</span>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4' }} />
            <Legend verticalAlign="top" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="max" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Máxima" />
            <Line type="monotone" dataKey="mean" stroke="#6366f1" strokeWidth={2} dot={false} name="Média" />
            <Line type="monotone" dataKey="min" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="Mínima" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalTemperatureChart;
