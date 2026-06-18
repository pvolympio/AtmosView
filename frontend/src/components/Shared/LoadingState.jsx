import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Buscando dados na atmosfera..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl border border-slate-800 shadow-2xl max-w-sm mx-auto text-center animate-pulse-slow">
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4 text-indigo-400">
        <Loader2 size={36} className="animate-spin" />
      </div>
      <p className="text-slate-300 font-bold tracking-wide text-xs uppercase">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
