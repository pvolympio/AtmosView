import React from 'react';
import { Calendar, Cpu, Sparkles, AlertTriangle, RefreshCw, BarChart2 } from 'lucide-react';

const ModelStatusCard = ({
  cityName,
  hasTrainedModels,
  lastTrainedAt,
  samplesCount,
  trainingRunsCount,
  onTrain,
  isTraining
}) => {
  const formattedDate = lastTrainedAt
    ? new Date(lastTrainedAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Status do Modelo</h3>
          
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${
            hasTrainedModels 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {hasTrainedModels ? (
              <>
                <Sparkles size={10} />
                Pronto para Inferência
              </>
            ) : (
              <>
                <AlertTriangle size={10} />
                Não Treinado
              </>
            )}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-900/60 border border-slate-800 text-slate-400 rounded-xl mt-0.5">
              <Cpu size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Cidade sob análise</span>
              <span className="text-xs font-bold text-white block">{cityName || 'Escolha uma cidade'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-900/60 border border-slate-800 text-slate-400 rounded-xl mt-0.5">
              <Calendar size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Último treinamento</span>
              <span className="text-xs font-bold text-white block">
                {formattedDate || 'Nunca treinado'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-900/60 border border-slate-800 text-slate-400 rounded-xl mt-0.5">
              <BarChart2 size={14} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Tamanho da Amostra (Treino)</span>
              <span className="text-xs font-bold text-white block">
                {samplesCount ? `${samplesCount} dias históricos` : '0 dias'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 mt-5 leading-relaxed font-medium">
          O treinamento obtém 2 anos de séries históricas de temperatura, chuva e vento, calcula médias móveis e treina 3 classificadores de florestas aleatórias (Random Forests) para prever as condições do dia seguinte.
        </p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-900/60 flex items-center justify-between gap-4">
        <div>
          <span className="text-[9px] text-slate-500 font-semibold block">Total de Treinamentos</span>
          <span className="text-xs font-bold text-slate-300">{trainingRunsCount} execuções</span>
        </div>
        
        <button
          onClick={onTrain}
          disabled={isTraining || !cityName}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
            isTraining
              ? "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-0.5 cursor-pointer"
          }`}
        >
          {isTraining ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              Treinando...
            </>
          ) : (
            <>
              <RefreshCw size={13} />
              {hasTrainedModels ? 'Retreinar Modelo' : 'Treinar Modelo'}
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default ModelStatusCard;
