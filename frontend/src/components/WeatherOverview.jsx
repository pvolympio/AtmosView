import React from 'react';
import { MapPin, Clock, Star } from 'lucide-react';
import { getWeatherCondition } from '../utils/weatherUtils';


const WeatherOverview = ({ cityName, state, country, latitude, longitude, observationTime, weatherCode, user, isFavorite, onToggleFavorite }) => {
  const condition = getWeatherCondition(weatherCode);
  const ConditionIcon = condition.icon;

  // Format observation time (e.g. "2026-06-12T19:00" -> "19:00 - 12/06")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const hour = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${hour} do dia ${day}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-400">
          <MapPin size={18} />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Cidade Analisada</span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <h2 className="text-2xl font-black text-white flex items-baseline gap-2">
            {cityName}
            {(state || country) && (
              <span className="text-slate-400 font-bold text-sm">
                ({state ? `${state}, ` : ''}{country})
              </span>
            )}
          </h2>
          {user && (
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-xl border transition-all ${
                isFavorite 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-550/30'
              }`}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star size={14} className={isFavorite ? "fill-amber-400" : ""} />
            </button>
          )}
        </div>
        <div className="text-slate-500 font-medium text-xs">
          Latitude: <span className="text-slate-400">{latitude.toFixed(4)}</span> • Longitude: <span className="text-slate-400">{longitude.toFixed(4)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
        <div className="flex items-center gap-3.5 bg-slate-950/40 px-4.5 py-3 rounded-2xl border border-slate-900/60 shrink-0">
          <ConditionIcon className={`w-9 h-9 ${condition.color}`} />
          <div>
            <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-widest">Condição Local</span>
            <span className="text-slate-200 font-bold text-sm">{condition.text}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-950/20 px-4 py-3 rounded-2xl border border-slate-900/40 shrink-0 text-xs font-semibold text-slate-400">
          <Clock size={16} className="text-indigo-400/80" />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">Última Atualização</span>
            <span className="text-slate-300 text-xs font-medium">{formatTime(observationTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherOverview;
