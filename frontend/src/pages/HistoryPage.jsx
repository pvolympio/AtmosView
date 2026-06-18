import React, { useEffect, useState } from 'react';
import HistoryTable from '../components/HistoryTable';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { weatherApi } from '../services/api';
import { Database, Calendar, BarChart2 } from 'lucide-react';

const HistoryPage = ({ onSelectRecord }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getHistory();
      setHistory(data);
    } catch (err) {
      setError("Não foi possível carregar o histórico de buscas registradas no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Deseja realmente excluir todo o histórico de consultas persistido no PostgreSQL?")) {
      try {
        await weatherApi.clearHistory();
        setHistory([]);
      } catch (err) {
        console.error("Failed to clear history:", err);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="py-20"><LoadingState message="Carregando registros do PostgreSQL..." /></div>;
  if (error) return <div className="py-20"><ErrorState message={error} onRetry={fetchHistory} /></div>;

  // Compute some quick statistics
  const totalConsultas = history.length;
  const cidadesUnicas = new Set(history.map(item => item.city_name)).size;
  const maxRisco = history.filter(item => ['Alto', 'Crítico'].includes(item.risk_level)).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in">
      
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Database className="text-indigo-400" size={24} />
          Painel de Auditoria de Histórico
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Acompanhe todas as consultas meteorológicas registradas e salvas em banco de dados.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Database size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total de Consultas</span>
            <span className="text-xl font-black text-white block mt-0.5">{totalConsultas}</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
            <BarChart2 size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Cidades Consultadas</span>
            <span className="text-xl font-black text-white block mt-0.5">{cidadesUnicas}</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Alertas Elevados (ICR)</span>
            <span className="text-xl font-black text-white block mt-0.5">{maxRisco}</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <HistoryTable 
        items={history} 
        onSelectRecord={onSelectRecord} 
        onClearHistory={handleClearHistory} 
      />

    </div>
  );
};

export default HistoryPage;
