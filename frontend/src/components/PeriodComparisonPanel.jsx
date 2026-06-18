import React, { useState } from 'react';
import { weatherApi } from '../services/api';
import { Calendar, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import LoadingState from './Shared/LoadingState';
import ErrorState from './Shared/ErrorState';

const PeriodComparisonPanel = ({ cityName }) => {
  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const maxDate = getPastDateString(5);

  // Default ranges: A (2 years ago to 23 months ago), B (1 year ago to 11 months ago)
  const [startA, setStartA] = useState(getPastDateString(365 * 2));
  const [endA, setEndA] = useState(getPastDateString(365 * 2 - 30));
  const [startB, setStartB] = useState(getPastDateString(365));
  const [endB, setEndB] = useState(getPastDateString(365 - 30));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!cityName) return;
    
    if (new Date(startA) > new Date(endA)) {
      setError("No Período A, a data inicial não pode ser posterior à data final.");
      return;
    }
    if (new Date(startB) > new Date(endB)) {
      setError("No Período B, a data inicial não pode ser posterior à data final.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await weatherApi.getWeatherCompare(
        cityName, startA, endA, startB, endB
      );
      setComparison(result);
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar a comparação climática entre os dois períodos selecionados.");
    } finally {
      setLoading(false);
    }
  };

  const getDeltaBadge = (value, unit = '', invertColor = false, isInteger = false) => {
    if (value === 0) return <span className="text-slate-400 font-bold">Sem variação</span>;
    const isPositive = value > 0;
    
    // InvertColor is true for temperatures/rain/risk where increases could signify hazard
    const colorClass = isPositive 
      ? (invertColor ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20")
      : (invertColor ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20");

    const formattedValue = isInteger ? Math.round(value) : value.toFixed(1);

    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${colorClass}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {isPositive ? `+` : ``}{formattedValue}{unit}
      </span>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl w-full space-y-6">
      
      {/* Panel title */}
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <RefreshCw className="text-indigo-400" size={18} />
          Comparação Analítica entre Períodos
        </h3>
        <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Compare médias históricas e extremos climatológicos</span>
      </div>

      {/* Selectors Form */}
      <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-950/45 p-4 rounded-2xl border border-slate-900">
        
        {/* Period A */}
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Início Período A</span>
            <input
              type="date"
              value={startA}
              max={maxDate}
              onChange={(e) => setStartA(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-[10px] text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Fim Período A</span>
            <input
              type="date"
              value={endA}
              max={maxDate}
              onChange={(e) => setEndA(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-[10px] text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Period B */}
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Início Período B</span>
            <input
              type="date"
              value={startB}
              max={maxDate}
              onChange={(e) => setStartB(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-[10px] text-slate-200 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Fim Período B</span>
            <input
              type="date"
              value={endB}
              max={maxDate}
              onChange={(e) => setEndB(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-2.5 py-2 text-[10px] text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="submit"
            disabled={!cityName || loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Processando..." : "Comparar"}
          </button>
        </div>

      </form>

      {/* Render states */}
      {loading ? (
        <LoadingState message="Comparando os períodos e computando deltas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleCompare} />
      ) : comparison ? (
        
        /* Comparison Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          
          {/* Card 1: Temp */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-850 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Temperatura Média</span>
            <div className="flex justify-between items-baseline text-xs font-semibold text-slate-400">
              <span>Período A: {comparison.period_a_avg_temp.toFixed(1)}°C</span>
              <span>Período B: {comparison.period_b_avg_temp.toFixed(1)}°C</span>
            </div>
            <div className="pt-2 border-t border-slate-900/50 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Variação</span>
              {getDeltaBadge(comparison.temp_diff, '°C', true)}
            </div>
          </div>

          {/* Card 2: Rain */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-850 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Chuva Acumulada</span>
            <div className="flex justify-between items-baseline text-xs font-semibold text-slate-400">
              <span>Período A: {comparison.period_a_total_rain.toFixed(0)} mm</span>
              <span>Período B: {comparison.period_b_total_rain.toFixed(0)} mm</span>
            </div>
            <div className="pt-2 border-t border-slate-900/50 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Variação (%)</span>
              {getDeltaBadge(comparison.rain_diff_percent, '%', false)}
            </div>
          </div>

          {/* Card 3: Hot Days */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-850 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Dias Quentes (&gt;32°C)</span>
            <div className="flex justify-between items-baseline text-xs font-semibold text-slate-400">
              <span>Período A: {comparison.period_a_hot_days} dias</span>
              <span>Período B: {comparison.period_b_hot_days} dias</span>
            </div>
            <div className="pt-2 border-t border-slate-900/50 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Variação</span>
              {getDeltaBadge(comparison.period_b_hot_days - comparison.period_a_hot_days, ' dias', true, true)}
            </div>
          </div>

          {/* Card 4: Risk */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-850 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Risco Médio</span>
            <div className="flex justify-between items-baseline text-xs font-semibold text-slate-400">
              <span>Período A: {comparison.period_a_avg_risk.toFixed(1)}/10</span>
              <span>Período B: {comparison.period_b_avg_risk.toFixed(1)}/10</span>
            </div>
            <div className="pt-2 border-t border-slate-900/50 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Variação</span>
              {getDeltaBadge(comparison.period_b_avg_risk - comparison.period_a_avg_risk, '', true)}
            </div>
          </div>

        </div>

      ) : (
        <div className="text-center py-6 border border-dashed border-slate-850 rounded-2xl text-slate-500 text-xs font-semibold">
          Selecione os períodos e clique em Comparar para iniciar a análise cruzada.
        </div>
      )}

    </div>
  );
};

export default PeriodComparisonPanel;
