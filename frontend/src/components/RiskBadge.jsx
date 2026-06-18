import React from 'react';

const RiskBadge = ({ level, className = "" }) => {
  const configs = {
    'baixo': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    'moderado': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    'alto': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    'crítico': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  };

  const key = (level || 'baixo').toLowerCase();
  const config = configs[key] || configs.baixo;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${className}`}>
      {level}
    </span>
  );
};

export default RiskBadge;
