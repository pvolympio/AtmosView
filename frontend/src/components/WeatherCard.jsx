import React from 'react';

const WeatherCard = ({ title, value, icon: Icon, description, iconColor = "text-indigo-400" }) => {
  // Map Tailwind icon color classes to their respective HSL premium card glow selectors
  const glowClassMap = {
    "text-rose-400": "premium-card-rose",
    "text-orange-400": "premium-card-orange",
    "text-sky-400": "premium-card-sky",
    "text-violet-400": "premium-card-violet",
    "text-teal-400": "premium-card-teal",
    "text-indigo-400": "", // standard indigo is default
    "text-amber-400": "premium-card-amber",
    "text-emerald-400": "premium-card-emerald"
  };

  const glowClass = glowClassMap[iconColor] || "";

  return (
    <div className={`premium-card ${glowClass} p-5 flex items-center gap-4 shadow-lg`}>
      <div className={`p-3.5 bg-slate-900/60 border border-slate-800/80 ${iconColor} rounded-2xl`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">{title}</span>
        <span className="text-lg font-black text-white block mt-0.5 truncate">{value}</span>
        {description && (
          <span className="text-slate-500 text-[10px] block mt-0.5 font-medium truncate">{description}</span>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
