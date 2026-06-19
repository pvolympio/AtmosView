import React from 'react';
import { Database, CloudSun, AlertCircle, RefreshCw } from 'lucide-react';

export default function SourceSelector({ sources }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {Object.entries(sources).map(([key, data]) => {
        const metadata = data.metadata || {};
        const quality = data.quality_report || {};
        
        return (
          <div key={key} className="p-5 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl flex flex-col justify-between transition-all duration-300 backdrop-blur-sm shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-slate-800 text-indigo-400 border border-indigo-500/10 uppercase tracking-wider">
                  {metadata.source_type || 'Reanálise'}
                </span>
                {key === 'inmet' ? (
                  <Database size={15} className="text-emerald-400 animate-pulse" />
                ) : key === 'nasa_power' ? (
                  <Database size={15} className="text-amber-400" />
                ) : (
                  <CloudSun size={16} className="text-sky-400" />
                )}
              </div>
              <h3 className="text-sm font-black text-white tracking-tight mb-1">{metadata.name}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{metadata.description}</p>
            </div>
            
            <div className="pt-3 border-t border-slate-800/80 mt-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                <span>Disponibilidade:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  quality.quality_grade === 'Boa' ? 'bg-emerald-500/10 text-emerald-400' :
                  quality.quality_grade === 'Parcial' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {quality.completeness_percentage}% ({quality.quality_grade})
                </span>
              </div>
              <div className="text-[10px] text-slate-500 leading-snug flex items-start gap-1">
                <AlertCircle size={12} className="text-slate-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-400">Limitação:</strong> {metadata.limitations}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
