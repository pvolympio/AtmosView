import React from 'react';
import { Brain, Settings } from 'lucide-react';

const PredictionCard = ({
  title,
  predictionLabel,
  probability,
  source,
  icon: Icon,
  iconColor = "text-indigo-400"
}) => {
  const isML = source === "ml-model";
  
  // Custom styling based on prediction values
  let labelColor = "text-white";
  if (predictionLabel === "Sim") {
    labelColor = "text-amber-400";
  } else if (predictionLabel === "Não") {
    labelColor = "text-emerald-400";
  } else if (predictionLabel === "Baixo") {
    labelColor = "text-emerald-400";
  } else if (predictionLabel === "Moderado") {
    labelColor = "text-yellow-400";
  } else if (predictionLabel === "Alto") {
    labelColor = "text-orange-400";
  } else if (predictionLabel === "Crítico") {
    labelColor = "text-red-400";
  }

  // Map Tailwind icon color classes to HSL glow variation selectors
  const glowClassMap = {
    "text-rose-400": "premium-card-rose",
    "text-orange-400": "premium-card-orange",
    "text-sky-400": "premium-card-sky",
    "text-violet-400": "premium-card-violet",
    "text-teal-400": "premium-card-teal",
    "text-indigo-400": "", // standard indigo is default
    "text-amber-500": "premium-card-amber",
    "text-emerald-400": "premium-card-emerald"
  };

  const glowClass = glowClassMap[iconColor] || "";

  return (
    <div className={`premium-card ${glowClass} p-6 flex flex-col justify-between h-full shadow-xl`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl ${iconColor}`}>
            <Icon size={20} className="animate-float" />
          </div>
          {/* Source Badge */}
          <span className={`flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
            isML 
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
              : "bg-slate-800/40 text-slate-400 border-slate-700/50"
          }`}>
            {isML ? (
              <>
                <Brain size={10} />
                Modelo IA
              </>
            ) : (
              <>
                <Settings size={10} />
                Regras Heurísticas
              </>
            )}
          </span>
        </div>

        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">{title}</span>
        <span className={`text-2xl font-black block mt-1.5 ${labelColor}`}>{predictionLabel}</span>
      </div>

      {probability !== null && probability !== undefined && (
        <div className="mt-5 pt-3.5 border-t border-slate-800/60">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500 font-medium">Confiança da Predição</span>
            <span className="text-[10px] text-slate-350 font-bold">{Math.round(probability * 100)}%</span>
          </div>
          <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isML ? 'bg-indigo-500' : 'bg-slate-650'
              }`}
              style={{ width: `${probability * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionCard;
