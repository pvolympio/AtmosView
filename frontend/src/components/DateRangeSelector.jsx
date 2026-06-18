import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const DateRangeSelector = ({ onGenerateAnalysis }) => {
  // Lock historical date selection range up to 5 days ago (required by Open-Meteo archive API latency)
  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const maxDate = getPastDateString(5);
  // Default values: 1 year ago to 5 days ago
  const [startDate, setStartDate] = useState(getPastDateString(365));
  const [endDate, setEndDate] = useState(maxDate);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setValidationError('Por favor, preencha ambas as datas.');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setValidationError('A data inicial não pode ser posterior à data final.');
      return;
    }

    setValidationError('');
    onGenerateAnalysis(startDate, endDate);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-lg w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <Calendar size={18} />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Intervalo de Consulta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              max={maxDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Data Final</label>
            <input
              type="date"
              value={endDate}
              max={maxDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {validationError && (
          <p className="text-red-400 text-[10px] font-semibold">{validationError}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          <Calendar size={14} />
          Gerar Análise Histórica
        </button>
      </form>
    </div>
  );
};

export default DateRangeSelector;
