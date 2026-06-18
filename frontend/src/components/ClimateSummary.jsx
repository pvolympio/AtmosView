import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

const ClimateSummary = ({ summary }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 bg-indigo-500/5 shadow-xl w-full animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="text-indigo-400 animate-pulse" size={18} />
        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Resumo Inteligente AtmosView</span>
      </div>
      
      <div className="relative flex gap-3 items-start bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
        <MessageSquare className="text-indigo-400 shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-slate-200 leading-relaxed font-semibold italic">
          "{summary}"
        </p>
      </div>
    </div>
  );
};

export default ClimateSummary;
