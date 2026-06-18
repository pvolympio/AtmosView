import React from 'react';

const WeatherCard = ({ title, value, icon: Icon, description, iconColor = "text-indigo-400", borderColor = "hover:border-indigo-500/30" }) => {
  return (
    <div className={`glass-panel p-5 rounded-2xl border border-slate-800/80 transition-all duration-300 ${borderColor} flex items-center gap-4 shadow-lg`}>
      <div className={`p-3.5 bg-slate-900/50 border border-slate-800 ${iconColor} rounded-xl`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">{title}</span>
        <span className="text-lg font-black text-white block mt-0.5 truncate">{value}</span>
        {description && (
          <span className="text-slate-500 text-[10px] block mt-0.5 font-medium truncate">{description}</span>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
