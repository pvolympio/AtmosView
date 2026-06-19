import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import { FileText, Calendar, Search, Download, Star, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

const ReportsPage = () => {
  const [city, setCity] = useState('');
  const [reportType, setReportType] = useState('dashboard'); // 'dashboard', 'history', 'comparison', 'ml'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // Favorites for quick selection
  const [favorites, setFavorites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoadingFavs(true);
    try {
      const data = await weatherApi.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFavs(false);
    }
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setMsg({ type: 'error', text: 'Por favor, informe a cidade para o relatório.' });
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      let payloadData = null;
      let periodLabel = "Tempo Real";

      // Step 1: Fetch corresponding climate data
      if (reportType === 'dashboard') {
        setMsg({ type: 'success', text: 'Buscando dados climáticos em tempo real...' });
        payloadData = await weatherApi.getWeatherDashboard(city);
        periodLabel = "Tempo Real e Previsões";
      } else if (reportType === 'history') {
        setMsg({ type: 'success', text: 'Buscando série de dados históricos climáticos...' });
        payloadData = await weatherApi.getWeatherHistory(city, startDate, endDate);
        periodLabel = `${startDate} a ${endDate}`;
      } else if (reportType === 'comparison') {
        setMsg({ type: 'success', text: 'Processando cruzamento de fontes (INMET/NASA/Open-Meteo)...' });
        payloadData = await weatherApi.getWeatherSourceComparison(city, startDate, endDate);
        periodLabel = `${startDate} a ${endDate}`;
      } else if (reportType === 'ml') {
        setMsg({ type: 'success', text: 'Carregando análise preditiva baseada em IA...' });
        payloadData = await weatherApi.getPredictions(city);
        periodLabel = "Análise Preditiva e Probabilidades";
      }

      if (!payloadData) {
        throw new Error('Nenhum dado retornado para esta consulta.');
      }

      setMsg({ type: 'success', text: 'Gerando documento PDF científico...' });

      // Step 2: Request PDF from backend streaming response
      const pdfBlob = await weatherApi.generateReport(city, reportType, periodLabel, payloadData);
      
      // Step 3: Trigger local download
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `atmosview_relatorio_${reportType}_${city.toLowerCase().trim().replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMsg({ type: 'success', text: 'Download concluído com sucesso!' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.message || 'Falha ao processar e baixar relatório.';
      setMsg({ type: 'error', text: typeof detail === 'string' ? detail : JSON.stringify(detail) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Gerador de Relatórios PDF</h2>
        <p className="text-xs text-slate-450">Consolide dados climáticos, estatísticos e preditivos em documentos de qualidade científica.</p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border flex gap-3 text-xs font-semibold animate-fade-in ${
          msg.type === 'success' 
            ? 'bg-indigo-550/10 border-indigo-500/20 text-indigo-300' 
            : 'bg-rose-550/10 border-rose-500/20 text-rose-300'
        }`}>
          {msg.type === 'success' ? <Sparkles size={18} className="animate-spin" /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* PDF Options Form */}
        <div className="md:col-span-2">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            
            <form onSubmit={handleGeneratePDF} className="space-y-5">
              
              {/* City Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Cidade para Análise</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                    <Search size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: São Paulo, SP ou Campinas"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Tipo de Relatório</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Realtime Dashboard */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                    reportType === 'dashboard'
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="reportType"
                      value="dashboard"
                      checked={reportType === 'dashboard'}
                      onChange={() => setReportType('dashboard')}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">Dashboard Geral</span>
                      <FileText size={15} className={reportType === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'} />
                    </div>
                    <span className="text-[9px] text-slate-450 leading-relaxed mt-1">Dados de temperatura em tempo real, umidade, vento e avaliação do Índice de Risco ICR.</span>
                  </label>

                  {/* History Trends */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                    reportType === 'history'
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="reportType"
                      value="history"
                      checked={reportType === 'history'}
                      onChange={() => setReportType('history')}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">Tendências Históricas</span>
                      <Calendar size={15} className={reportType === 'history' ? 'text-indigo-400' : 'text-slate-500'} />
                    </div>
                    <span className="text-[9px] text-slate-450 leading-relaxed mt-1">Estatísticas consolidadas de clima, médias, extremos e análises angulares de tendências térmicas.</span>
                  </label>

                  {/* Scientific Comparison */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                    reportType === 'comparison'
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="reportType"
                      value="comparison"
                      checked={reportType === 'comparison'}
                      onChange={() => setReportType('comparison')}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">Cruzamento de Fontes</span>
                      <FileText size={15} className={reportType === 'comparison' ? 'text-indigo-400' : 'text-slate-500'} />
                    </div>
                    <span className="text-[9px] text-slate-450 leading-relaxed mt-1">Comparativo de consistência e completude de dados entre INMET (Brasil), NASA POWER e Open-Meteo.</span>
                  </label>

                  {/* AI Predictions */}
                  <label className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                    reportType === 'ml'
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="reportType"
                      value="ml"
                      checked={reportType === 'ml'}
                      onChange={() => setReportType('ml')}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">Análise IA & Machine Learning</span>
                      <Sparkles size={15} className={reportType === 'ml' ? 'text-indigo-400' : 'text-slate-500'} />
                    </div>
                    <span className="text-[9px] text-slate-450 leading-relaxed mt-1">Previsões baseadas em Machine Learning, estimando chuva e perigo climático com probabilidades de acerto.</span>
                  </label>

                </div>
              </div>

              {/* Date Period - Only for History and Comparison */}
              {(reportType === 'history' || reportType === 'comparison') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Data de Início</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Data de Fim</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-650/10 flex items-center justify-center gap-2"
              >
                <Download size={15} />
                {loading ? 'Buscando Dados e Gerando PDF...' : 'Gerar e Baixar PDF'}
              </button>

            </form>

          </div>
        </div>

        {/* Sidebar Quick Favorites Selection */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
              <Star size={16} className="text-amber-400 fill-amber-450" />
              Seleção Rápida (Favoritos)
            </h3>

            {loadingFavs ? (
              <div className="text-center py-4 text-xs text-slate-500">Buscando favoritos...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p className="text-[11px] font-medium leading-relaxed">Nenhuma cidade favoritada.</p>
                <p className="text-[9px] text-slate-650 mt-1">Favoritos salvos no seu perfil aparecem aqui para geração ágil.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {favorites.map((fav) => (
                  <button
                    key={fav.id}
                    onClick={() => setCity(fav.city_name)}
                    className={`w-full p-3 text-left rounded-xl border transition-all text-xs flex justify-between items-center gap-2 ${
                      city.toLowerCase() === fav.city_name.toLowerCase()
                        ? 'bg-indigo-600/10 border-indigo-550/45 text-white font-bold'
                        : 'bg-slate-905 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{fav.city_name}</p>
                      <p className="text-[9px] text-slate-550 truncate mt-0.5">{fav.state ? `${fav.state}, ` : ''}{fav.country}</p>
                    </div>
                    <Star size={12} className="text-amber-400 shrink-0 fill-amber-400" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* PDF Methodology Badge */}
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-slate-400 space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Qualidade de Exportação</h4>
            <p className="text-[10px] leading-relaxed">
              Os relatórios PDF são formatados sob demanda com quebras de página lógicas, tabelas auto-ajustáveis, rodapés automatizados e avisos de responsabilidade. Perfeito para relatórios executivos ou portfólio.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReportsPage;
