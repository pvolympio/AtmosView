import React from 'react';
import SearchCity from '../components/SearchCity';
import { CloudSun, ShieldAlert, TrendingUp, History } from 'lucide-react';

const Home = ({ onSelectCity }) => {
  const popularCities = [
    "São Paulo", "Rio de Janeiro", "Curitiba", "Itajubá", "Salvador", "Manaus"
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 space-y-16 animate-fade-in">
      
      {/* Title block */}
      <div className="text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-flex p-4 bg-indigo-650/10 border border-indigo-500/20 text-indigo-400 rounded-3xl mb-2 animate-float shadow-xl shadow-indigo-500/5">
          <CloudSun size={52} />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">Análise Meteorológica</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent font-black">
            Inteligente & Científica
          </span>
        </h1>
        
        <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-medium">
          Monitore o clima em tempo real, audite séries históricas com regras de QA/QC comparando NASA POWER e INMET, treine modelos de Machine Learning (Random Forest) e configure limites de alertas personalizados para todo o território nacional.
        </p>
      </div>

      {/* Autocomplete Input wrapper */}
      <div className="max-w-xl mx-auto relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-500"></div>
        <div className="relative">
          <SearchCity onSelectCity={onSelectCity} />
        </div>
      </div>

      {/* Popular shortcuts */}
      <div className="text-center space-y-4">
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Atalhos de Consulta Rápida</span>
        <div className="flex flex-wrap justify-center gap-2.5">
          {popularCities.map((city, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCity(city)}
              className="px-4 py-2.5 bg-slate-900/40 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 hover:shadow-indigo-500/5"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-slate-900/60">
        
        {/* Feature 1 */}
        <div className="premium-card p-6 space-y-4">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/25">
            <TrendingUp size={20} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white tracking-tight">Análise de Tendências</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Acompanhe médias móveis, extremos térmicos e variações históricas desenhadas em gráficos Recharts de alta resolução com preenchimento vetorial.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="premium-card premium-card-amber p-6 space-y-4">
          <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/25">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white tracking-tight">Previsão por IA (V5)</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Treine algoritmos Random Forest sobre dados diários reais de dois anos e obtenha probabilidades preditivas de chuvas severas e ventanias.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="premium-card premium-card-emerald p-6 space-y-4">
          <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/25">
            <History size={20} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white tracking-tight">Auditoria e Cruzamento</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Cruze dados de estações terrestres oficiais (INMET) com reanálise por satélite (NASA POWER) usando a fórmula geodésica de Haversine.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
