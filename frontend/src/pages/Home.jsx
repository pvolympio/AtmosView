import React from 'react';
import SearchCity from '../components/SearchCity';
import { CloudSun, ShieldAlert, TrendingUp, History } from 'lucide-react';

const Home = ({ onSelectCity }) => {
  const popularCities = [
    "São Paulo", "Rio de Janeiro", "Curitiba", "Itajubá", "Salvador", "Manaus"
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-12 animate-fade-in">
      
      {/* Title block */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-3xl mb-2 animate-float">
          <CloudSun size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Análise Meteorológica Inteligente
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Monitore o clima em tempo real, visualize tendências semanais, avalie o Índice de Risco Climático (ICR) e acompanhe o histórico de consultas de cidades brasileiras.
        </p>
      </div>

      {/* Autocomplete Input */}
      <div className="max-w-xl mx-auto">
        <SearchCity onSelectCity={onSelectCity} />
      </div>

      {/* Popular shortcuts */}
      <div className="text-center space-y-3">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Atalhos Rápidos</span>
        <div className="flex flex-wrap justify-center gap-2">
          {popularCities.map((city, idx) => (
            <button
              key={idx}
              onClick={() => onSelectCity(city)}
              className="px-4 py-2 bg-slate-900/60 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t border-slate-900/60">
        
        {/* Feature 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2.5">
          <div className="w-9 h-9 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp size={18} />
          </div>
          <h3 className="text-sm font-bold text-white">Análise de Tendências</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Gráficos detalhados da temperatura mínima/máxima, chuva acumulada e rajadas de vento diárias via Recharts.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2.5">
          <div className="w-9 h-9 flex items-center justify-center bg-amber-500/10 text-amber-400 rounded-xl">
            <ShieldAlert size={18} />
          </div>
          <h3 className="text-sm font-bold text-white">Risco Climático (ICR)</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Avaliação algorítmica de riscos ponderada com base em temperatura, umidade, vento, chuva e pressão barométrica.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-2.5">
          <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl">
            <History size={18} />
          </div>
          <h3 className="text-sm font-bold text-white">Auditoria e Cache</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Histórico completo gravado no PostgreSQL com raw_data em JSONB e cache Redis para otimização de tráfego.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Home;
