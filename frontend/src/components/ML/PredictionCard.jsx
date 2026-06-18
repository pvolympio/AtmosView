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

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 transition-all duration-300 hover:border-slate-700/60 shadow-xl flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl ${iconColor}`}>
            <Icon size={20} className="animate-float" />
          </div>
          {/* Source Badge */}
          <span className={`flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold border ${
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

        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">{title}</span>
        <span className={`text-2xl font-black block mt-1 ${labelColor}`}>{predictionLabel}</span>
      </div>

      {probability !== null && probability !== undefined && (
        <div className="mt-5 pt-3 border-t border-slate-900/60">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500 font-medium">Confiança da Predição</span>
            <span className="text-[10px] text-slate-300 font-bold">{Math.round(probability * 100)}%</span>
          </div>
          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isML ? 'bg-indigo-500' : 'bg-slate-600'
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
