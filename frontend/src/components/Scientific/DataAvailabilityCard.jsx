import React from 'react';
import { ShieldCheck, ShieldAlert, FileWarning, EyeOff } from 'lucide-react';

export default function DataAvailabilityCard({ sources }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {Object.entries(sources).map(([key, data]) => {
        const quality = data.quality_report || {};
        const metadata = data.metadata || {};
        const completeness = quality.completeness_percentage || 0;
        const grade = quality.quality_grade || 'Fraca';

        const isGood = grade === 'Boa';
        const isPartial = grade === 'Parcial';

        return (
          <div key={key} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Qualidade: {metadata.name}
                </h4>
                {isGood ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck size={12} /> Excelente
                  </span>
                ) : isPartial ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <ShieldAlert size={12} /> Parcial
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <EyeOff size={12} /> Fraca / Offline
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] font-bold text-slate-350 mb-1">
                  <span>Completude Temporal</span>
                  <span>{completeness.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      completeness >= 90 ? 'bg-emerald-500' :
                      completeness >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${completeness}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/60 text-[11px] font-semibold text-slate-400">
              <div className="flex justify-between">
                <span>Leituras Ausentes:</span>
                <span className={`font-bold ${quality.missing_data_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {quality.missing_data_count} campos
                </span>
              </div>
              <div className="flex justify-between">
                <span>Valores Extremos / Anômalos:</span>
                <span className={`font-bold ${quality.extreme_values_count > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {quality.extreme_values_count} registros
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lacunas de Dias Inteiros:</span>
                <span className={`font-bold ${quality.temporal_gaps > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {quality.temporal_gaps} dias
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
