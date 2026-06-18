import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain } from 'lucide-react';

const FEATURE_TRANSLATIONS = {
  "max_temp": "Temp. Máxima",
  "min_temp": "Temp. Mínima",
  "mean_temp": "Temp. Média",
  "rain": "Chuva (Hoje)",
  "wind_max": "Rajada Vento",
  "rain_prev_day": "Chuva (Ontem)",
  "rain_rolling_3": "Média Chuva (3d)",
  "rain_rolling_7": "Média Chuva (7d)",
  "temp_rolling_7": "Média Temp. (7d)",
  "month": "Mês",
  "season": "Estação do Ano",
  "latitude": "Latitude",
  "longitude": "Longitude"
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-semibold">
        <p className="text-slate-400 mb-1">Feature: <span className="text-slate-200">{payload[0].payload.displayName}</span></p>
        <p className="text-indigo-400 font-extrabold">
          Relevância: {(payload[0].value * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const FeatureImportanceChart = ({ results }) => {
  const [selectedModel, setSelectedModel] = useState('rain');

  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 text-center h-[340px] flex items-center justify-center">
        <p className="text-slate-400 text-xs font-semibold">Gráfico de importância indisponível. O modelo precisa ser treinado.</p>
      </div>
    );
  }

  const modelData = results[selectedModel]?.importances || [];
  
  const chartData = modelData.map(item => ({
    name: item.feature,
    displayName: FEATURE_TRANSLATIONS[item.feature] || item.feature,
    importance: item.importance
  })).sort((a, b) => a.importance - b.importance); // sort ascending for horizontal display

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 shadow-lg w-full flex flex-col h-[380px]">
      
      {/* Header with Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="text-indigo-400 animate-pulse" size={18} />
          <div>
            <h3 className="text-sm font-bold text-white">Relevância das Variáveis</h3>
            <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Influência das métricas nas predições do Random Forest</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900/50 p-1 border border-slate-800 rounded-xl max-w-max self-start sm:self-auto">
          <button 
            onClick={() => setSelectedModel('rain')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              selectedModel === 'rain' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chuva
          </button>
          <button 
            onClick={() => setSelectedModel('heavy_rain')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              selectedModel === 'heavy_rain' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chuva Forte
          </button>
          <button 
            onClick={() => setSelectedModel('risk')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              selectedModel === 'risk' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risco ICR
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 w-full mt-2 min-h-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                stroke="#64748b" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              />
              <YAxis 
                type="category" 
                dataKey="displayName" 
                stroke="#64748b" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
                width={85}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 41, 59, 0.2)' }} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedModel === 'rain' ? '#6366f1' : selectedModel === 'heavy_rain' ? '#f43f5e' : '#f59e0b'} 
                    opacity={0.35 + (index / chartData.length) * 0.65} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[10px] text-slate-500">
            Nenhuma variável para exibir.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
