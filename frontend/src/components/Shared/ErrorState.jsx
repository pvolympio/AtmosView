import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorState = ({ title = "Erro de conexão", message = "Ocorreu uma falha ao consultar as APIs.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-3xl border border-red-950/45 shadow-2xl max-w-sm mx-auto text-center">
      <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full mb-4">
        <AlertCircle size={28} className="animate-bounce" />
      </div>
      <h3 className="text-red-400 font-extrabold text-base tracking-tight mb-1">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <RotateCcw size={14} />
          Tentar novamente
        </button>
      )}
    </div>
  );
};

export default ErrorState;
