import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CloudRain } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-semibold">
        <p className="text-slate-400 mb-1.5">Data: <span className="text-slate-200">{label}</span></p>
        <p className="text-sky-400 flex items-center gap-1.5 font-extrabold">
          Precipitação: {payload[0].value.toFixed(1)} mm
        </p>
      </div>
    );
  }
  return null;
};

const HistoricalRainChart = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl w-full flex items-center justify-center h-[320px] text-slate-500 text-xs font-semibold">
        Sem dados de precipitação para exibição.
      </div>
    );
  }

  const chartData = dailyData.map((day) => {
    const parts = day.date.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}`;
    return {
      name: formattedDate,
      rain: day.rain
    };
  });

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl w-full flex flex-col h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <CloudRain className="text-sky-400" size={18} />
        <div>
          <h3 className="text-sm font-bold text-white">Chuva Diária</h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Distribuição pluviométrica diária no período</span>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="histRainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4' }} />
            <Area type="monotone" dataKey="rain" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#histRainGrad)" name="Chuva" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalRainChart;
