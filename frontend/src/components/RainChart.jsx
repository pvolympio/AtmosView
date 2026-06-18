import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CloudRain } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-semibold">
        <p className="text-slate-400 mb-1.5">Data: <span className="text-slate-200">{label}</span></p>
        <p className="text-sky-400 flex items-center gap-1.5 font-extrabold">
          Chuva: {payload[0].value.toFixed(1)} mm
        </p>
      </div>
    );
  }
  return null;
};

const RainChart = ({ daily }) => {
  const chartData = daily.time.map((t, idx) => {
    const parts = t.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const label = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
    
    return {
      name: label,
      rain: daily.precipitation_sum[idx]
    };
  });

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 shadow-lg w-full flex flex-col h-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <CloudRain className="text-sky-400" size={18} />
        <div>
          <h3 className="text-sm font-bold text-white">Chuva Acumulada</h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Previsão em milímetros (mm)</span>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 189, 248, 0.04)' }} />
            <Bar dataKey="rain" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RainChart;
