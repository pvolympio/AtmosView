import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

const RiskExplanation = ({ risk }) => {
  const { score, nivel, motivos, recomendacoes } = risk;

  const levelConfigs = {
    'baixo': {
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
      icon: ShieldCheck
    },
    'moderado': {
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
      icon: AlertCircle
    },
    'alto': {
      color: "text-orange-400",
      border: "border-orange-500/20",
      bg: "bg-orange-500/5",
      icon: AlertTriangle
    },
    'crítico': {
      color: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/5",
      icon: AlertTriangle
    }
  };

  const config = levelConfigs[nivel.toLowerCase()] || levelConfigs.baixo;
  const SeverityIcon = config.icon;

  // Circle path math
  const radius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 10);

  return (
    <div className={`glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between h-full`}>
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-indigo-400" size={18} />
            Índice de Risco Climático (ICR)
          </h3>
          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.color} ${config.border} ${config.bg}`}>
            Risco {nivel}
          </span>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                className={`stroke-current ${config.color}`}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{score}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Pontuação</span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <span className="text-slate-400 text-xs font-semibold block">Classificação de Alerta</span>
            <span className={`text-base font-black uppercase ${config.color} tracking-tight block`}>
              {nivel}
            </span>
            <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed">
              Índice calculado com base em temperatura, umidade, vento, precipitação e pressão atmosférica local.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-900/60">
        {/* Motivos */}
        <div className="space-y-3">
          <h4 className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
            <SeverityIcon size={12} className={config.color} /> Fatores de Risco
          </h4>
          <ul className="space-y-2">
            {motivos.map((motivo, index) => (
              <li key={index} className="flex gap-2 items-start text-[11px] text-slate-300 leading-relaxed bg-slate-950/20 border border-slate-900/40 p-2 rounded-xl">
                <AlertTriangle size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>{motivo}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recomendações */}
        <div className="space-y-3">
          <h4 className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" /> Recomendações
          </h4>
          <ul className="space-y-2">
            {recomendacoes.map((rec, index) => (
              <li key={index} className="flex gap-2 items-start text-[11px] text-slate-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RiskExplanation;
