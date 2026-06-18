import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
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
          <p className="text-sky-400 flex items-center gap-1.5 font-extrabold">
            Mín: {payload[1].value.toFixed(1)}°C
          </p>
        )}
      </div>
    );
  }
  return null;
};

const TemperatureChart = ({ daily }) => {
  const chartData = daily.time.map((t, idx) => {
    // Open-Meteo dates are "YYYY-MM-DD"
    // Add timezone adjustment or format simply
    const parts = t.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const label = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
    
    return {
      name: label,
      max: daily.temperature_2m_max[idx],
      min: daily.temperature_2m_min[idx]
    };
  });

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 shadow-lg w-full flex flex-col h-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="text-rose-400" size={18} />
        <div>
          <h3 className="text-sm font-bold text-white">Temperaturas Diárias</h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Previsão de Máxima e Mínima</span>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.25} vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4' }} />
            <Area type="monotone" dataKey="max" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#maxGrad)" name="Máxima" />
            <Area type="monotone" dataKey="min" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#minGrad)" name="Mínima" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;
