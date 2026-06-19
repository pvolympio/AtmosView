import React, { useState } from 'react';
import SearchCity from '../components/SearchCity';
import SourceSelector from '../components/Scientific/SourceSelector';
import SourceComparisonTable from '../components/Scientific/SourceComparisonTable';
import MultiSourceTemperatureChart from '../components/Scientific/MultiSourceTemperatureChart';
import MultiSourceRainChart from '../components/Scientific/MultiSourceRainChart';
import DataAvailabilityCard from '../components/Scientific/DataAvailabilityCard';
import DivergenceAnalysisCard from '../components/Scientific/DivergenceAnalysisCard';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { weatherApi } from '../services/api';
import { Compass, ArrowLeft, Calendar, MapPin, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export default function SourceComparisonPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // Default dates: start 14 days ago, end 5 days ago (ideal for reanalysis completion)
  const maxDate = getPastDateString(4);
  const [startDate, setStartDate] = useState(getPastDateString(14));
  const [endDate, setEndDate] = useState(maxDate);
  const [dateError, setDateError] = useState('');

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setComparisonData(null);
    setError(null);
  };

  const handleGenerateComparison = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCity) return;

    if (new Date(startDate) > new Date(endDate)) {
      setDateError('A data inicial não pode ser posterior à data final.');
      return;
    }
    setDateError('');
    setLoading(true);
    setError(null);

    try {
      const data = await weatherApi.getWeatherSourceComparison(selectedCity, startDate, endDate);
      setComparisonData(data);
    } catch (err) {
      console.error(err);
      setError({
        title: "Divergência Científica Indisponível",
        message: `Não conseguimos cruzar os dados climatológicos para "${selectedCity}". Verifique se o intervalo de datas é de pelo menos 4 dias atrás ou tente novamente.`,
        action: () => handleGenerateComparison()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedCity('');
    setComparisonData(null);
    setError(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-900/60">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="text-indigo-400" size={22} />
            Comparação Científica de Fontes
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Compare medições reais de estações de solo do INMET com reanálises de satélite da NASA POWER e modelos globais do Open-Meteo.
          </p>
        </div>
        
        {selectedCity && (
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft size={13} />
            Alterar Cidade
          </button>
        )}
      </div>

      {/* Main Flow */}
      {!selectedCity ? (
        /* Step 1: Select City */
        <div className="max-w-xl mx-auto text-center space-y-6 py-12">
          <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl inline-block text-indigo-400">
            <Compass size={36} className="animate-float" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-white">Escolha uma cidade para comparação</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              Pesquise uma cidade brasileira para cruzar os dados de sensores de superfície terrestre com modelos de satélite.
            </p>
          </div>
          <div className="w-full">
            <SearchCity onSelectCity={handleSelectCity} />
          </div>
        </div>
      ) : (
        /* City is selected */
        <div className="space-y-8">
          {/* Metadata banner and Date Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* City Metadata card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <MapPin size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Localização Selecionada</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight">
                    {comparisonData ? comparisonData.city_name : selectedCity.split(',')[0]}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {comparisonData ? 'Brasil' : selectedCity}
                  </p>
                </div>
              </div>
              
              {comparisonData && (
                <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-semibold space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Latitude</span>
                      <span className="text-slate-300 block font-mono mt-0.5">{comparisonData.latitude.toFixed(4)}°</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Longitude</span>
                      <span className="text-slate-300 block font-mono mt-0.5">{comparisonData.longitude.toFixed(4)}°</span>
                    </div>
                  </div>
                  {comparisonData.nearest_station && (
                    <div className="pt-2 border-t border-slate-900/60">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Estação INMET mais próxima</span>
                      <span className="text-emerald-400 block font-bold mt-0.5 text-[11px]">
                        {comparisonData.nearest_station.name} ({comparisonData.nearest_station.id})
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Distância: {comparisonData.nearest_station.distance.toFixed(1)} km • Status: {comparisonData.nearest_station.status}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Range Selector Card */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
              <form onSubmit={handleGenerateComparison} className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Calendar size={18} />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Intervalo de Datas para Comparação</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Data Inicial</label>
                      <input
                        type="date"
                        value={startDate}
                        max={maxDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Data Final</label>
                      <input
                        type="date"
                        value={endDate}
                        max={maxDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {dateError && (
                    <p className="text-rose-400 text-[10px] font-bold">{dateError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-550 disabled:bg-indigo-800/50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  <Calendar size={14} />
                  {loading ? 'Processando dados...' : 'Executar Comparação Meteorológica'}
                </button>
              </form>
            </div>
          </div>

          {/* Loadings & Errors */}
          {loading && (
            <div className="py-16">
              <LoadingState message="Buscando medições de solo no INMET, baixando reanálises da NASA POWER e efetuando cálculos de divergência climática..." />
            </div>
          )}

          {error && !loading && (
            <div className="py-12">
              <ErrorState title={error.title} message={error.message} onRetry={error.action} />
            </div>
          )}

          {/* Comparison View */}
          {comparisonData && !loading && !error && (
            <div className="space-y-8 animate-fade-in">
              {/* Natural Language Summary */}
              {comparisonData.summary && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl flex items-start gap-4">
                  <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shrink-0">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      Resumo da Análise Científica
                    </h3>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">
                      {comparisonData.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid 1: SourceSelector cards */}
              {comparisonData.sources_data && (
                <SourceSelector sources={comparisonData.sources_data} />
              )}

              {/* Grid 2: Divergence Analysis Card and Comparison Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-1 flex">
                  <div className="w-full flex flex-col justify-between">
                    <DivergenceAnalysisCard metrics={comparisonData.comparison_metrics || {}} />
                  </div>
                </div>
                <div className="lg:col-span-2 flex">
                  <div className="w-full flex flex-col justify-between font-semibold">
                    <SourceComparisonTable sources={comparisonData.sources_data || {}} />
                  </div>
                </div>
              </div>

              {/* Grid 3: MultiSource Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MultiSourceTemperatureChart sources={comparisonData.sources_data || {}} />
                <MultiSourceRainChart sources={comparisonData.sources_data || {}} />
              </div>

              {/* Grid 4: Data Quality Report detail */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-slate-900 border border-slate-800 text-indigo-400 rounded-lg">
                    <BookOpen size={14} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relatório de Controle de Qualidade (QA/QC)</h3>
                </div>
                <DataAvailabilityCard sources={comparisonData.sources_data || {}} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
