import React from 'react';
import { Percent, ShieldCheck, BarChart4, Activity, Target } from 'lucide-react';

const MetricsTable = ({ models }) => {
  if (!models || models.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 text-center">
        <p className="text-slate-400 text-xs font-semibold">Nenhuma métrica disponível. O modelo precisa ser treinado.</p>
      </div>
    );
  }

  const getModelLabel = (type) => {
    switch (type) {
      case 'rain': return 'Previsão de Chuva';
      case 'heavy_rain': return 'Chuva Forte';
      case 'risk': return 'Classificação de Risco';
      default: return type;
    }
  };

  const getModelIcon = (type) => {
    switch (type) {
      case 'rain': return ShieldCheck;
      case 'heavy_rain': return Target;
      case 'risk': return Activity;
      default: return BarChart4;
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
            <Percent size={14} />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Métricas de Avaliação do Modelo</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-semibold">Base de Testes: 20% Random Split</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900/60 bg-slate-950/40">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modelo</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acurácia</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">F1-Score</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Algoritmo</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amostras</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40">
            {models.map((m) => {
              const Icon = getModelIcon(m.model_type);
              return (
                <tr key={m.model_type} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-3.5 flex items-center gap-3">
                    <div className="p-2 bg-slate-900/60 border border-slate-800/80 text-slate-400 rounded-lg">
                      <Icon size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{getModelLabel(m.model_type)}</span>
                      <span className="text-[9px] text-slate-500 block">Target: amanhã</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-black text-emerald-400">
                      {m.accuracy !== null ? `${(m.accuracy * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs font-black text-indigo-400">
                      {m.f1_score !== null ? `${(m.f1_score * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-400 font-medium">
                    {m.algorithm}
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-400 font-semibold">
                    {m.samples_count || 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Short description card footer */}
      <div className="p-4 bg-slate-950/20 border-t border-slate-900/60 text-[10px] text-slate-500 font-medium leading-relaxed">
        <p>
          * **Acurácia** mede a proporção de previsões corretas. **F1-Score** avalia o equilíbrio entre precisão e recall, sendo mais robusto quando há desbalanceamento de classes (como dias de chuva forte extrema).
        </p>
      </div>
    </div>
  );
};

export default MetricsTable;
