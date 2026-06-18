import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle, ShieldAlert } from 'lucide-react';

const TrendAnalysisCard = ({ trend }) => {
  if (!trend) return null;
  const { slope, interpretation } = trend;

  const configs = {
    'tendência de aquecimento': {
      title: "Tendência de Aquecimento",
      color: "text-rose-400 bg-rose-500/5 border-rose-500/25",
      desc: "Os registros apontam para uma elevação gradual nas temperaturas médias. Pode indicar fatores de aquecimento urbano ou transição sazonal mais severa.",
      icon: TrendingUp
    },
    'tendência de resfriamento': {
      title: "Tendência de Resfriamento",
      color: "text-sky-400 bg-sky-500/5 border-sky-500/25",
      desc: "Os registros apontam para uma queda nas médias térmicas. Pode estar relacionado com frentes frias persistentes ou sazonalidade climática local.",
      icon: TrendingDown
    },
    'tendência estável': {
      title: "Tendência Estável",
      color: "text-slate-350 bg-slate-900/40 border-slate-800",
      desc: "Não foram detectados desvios significativos nas médias de temperatura ao longo deste intervalo de tempo. O clima permaneceu dentro da normalidade.",
      icon: HelpCircle
    }
  };

  const activeConfig = configs[interpretation] || configs['tendência estável'];
  const TrendIcon = activeConfig.icon;

  // Extrapolate slope to a yearly delta
  // Slope is delta C per day. So 1 year (365 days) = slope * 365
  const yearlyDelta = slope * 365;

  return (
    <div className={`glass-panel p-6 rounded-3xl border ${activeConfig.color} flex flex-col justify-between h-full shadow-lg`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            Variação Linear Térmica
          </h3>
          <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Regressão Linear
          </span>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl text-slate-300">
            <TrendIcon size={24} className={activeConfig.color} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Classificação Linear</span>
            <span className="text-base font-black text-white block mt-0.5">{activeConfig.title}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          {activeConfig.desc}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-xs font-semibold">
        <div>
          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Coeficiente Angular (m)</span>
          <span className="text-white font-extrabold text-sm block mt-0.5">{slope > 0 ? `+${slope.toFixed(5)}` : slope.toFixed(5)} °C/dia</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Projeção de Mudança Anual</span>
          <span className={`text-sm font-extrabold block mt-0.5 ${activeConfig.color}`}>
            {yearlyDelta > 0 ? `+${yearlyDelta.toFixed(2)}` : yearlyDelta.toFixed(2)} °C/ano
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisCard;
