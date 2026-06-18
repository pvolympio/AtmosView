import React, { useState } from 'react';
import HistoricalSearch from '../components/HistoricalSearch';
import DateRangeSelector from '../components/DateRangeSelector';
import HistoricalStatsCards from '../components/HistoricalStatsCards';
import HistoricalTemperatureChart from '../components/HistoricalTemperatureChart';
import HistoricalRainChart from '../components/HistoricalRainChart';
import ExtremeEventsTable from '../components/ExtremeEventsTable';
import TrendAnalysisCard from '../components/TrendAnalysisCard';
import PeriodComparisonPanel from '../components/PeriodComparisonPanel';
import HistoricalSummary from '../components/HistoricalSummary';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { weatherApi } from '../services/api';
import { Landmark, ArrowLeft, Calendar, HelpCircle, MapPin, Sparkles, Sliders } from 'lucide-react';

const HistoryAnalysisPage = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setHistoryData(null);
    setError(null);
  };

  const handleGenerateAnalysis = async (startDate, endDate) => {
    if (!selectedCity) return;
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getWeatherHistory(selectedCity, startDate, endDate);
      setHistoryData(data);
    } catch (err) {
      console.error(err);
      setError({
        title: "Erro na Consulta Histórica",
        message: `Não conseguimos carregar a série histórica para "${selectedCity}". Verifique o intervalo de datas (limite máximo de até 5 dias atrás) ou tente novamente.`,
        action: () => handleGenerateAnalysis(startDate, endDate)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedCity('');
    setHistoryData(null);
    setError(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-900/60">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Landmark className="text-indigo-400" size={22} />
            Análise Histórica Avançada
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Explore médias, eventos extremos, regressão linear de tendências térmicas e comparação de períodos históricos.
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
            <MapPin size={36} className="animate-float" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-white">Escolha uma cidade para analisar</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              Digite o nome de uma cidade brasileira para iniciar a coleta e tratamento da série climática dos arquivos históricos do Open-Meteo.
            </p>
          </div>
          <div className="w-full">
            <HistoricalSearch onSelectCity={handleSelectCity} />
          </div>
        </div>
      ) : (
        /* City is selected */
        <div className="space-y-8">
          
          {/* Metadata banner and Date Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* City Metadata card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <MapPin size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Localização Selecionada</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight">
                    {historyData ? historyData.city_name : selectedCity.split(',')[0]}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {historyData ? `${historyData.state}, ${historyData.country}` : selectedCity}
                  </p>
                </div>
              </div>
              
              {historyData && (
                <div className="mt-6 pt-4 border-t border-slate-900/60 grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Latitude</span>
                    <span className="text-slate-300 block font-mono mt-0.5">{historyData.latitude.toFixed(4)}°</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Longitude</span>
                    <span className="text-slate-300 block font-mono mt-0.5">{historyData.longitude.toFixed(4)}°</span>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Selector */}
            <div className="lg:col-span-2">
              <DateRangeSelector onGenerateAnalysis={handleGenerateAnalysis} />
            </div>
          </div>

          {/* Loadings & Errors */}
          {loading && (
            <div className="py-16">
              <LoadingState message="Recuperando série climática histórica do Open-Meteo Archive e executando algoritmos estatísticos..." />
            </div>
          )}

          {error && !loading && (
            <div className="py-12">
              <ErrorState title={error.title} message={error.message} onRetry={error.action} />
            </div>
          )}

          {/* Historical Data view */}
          {historyData && !loading && !error && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Natural Language Summary */}
              {historyData.summary && (
                <HistoricalSummary summary={historyData.summary} />
              )}

              {/* Stats Cards Dashboard */}
              {historyData.stats && (
                <HistoricalStatsCards stats={historyData.stats} />
              )}

              {/* Graphs Grid: Series Temp & Series Rain */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {historyData.daily_data && (
                  <>
                    <HistoricalTemperatureChart dailyData={historyData.daily_data} />
                    <HistoricalRainChart dailyData={historyData.daily_data} />
                  </>
                )}
              </div>

              {/* Extremes & Regression Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {historyData.daily_data && (
                    <ExtremeEventsTable dailyData={historyData.daily_data} />
                  )}
                </div>
                <div>
                  {historyData.trend && (
                    <TrendAnalysisCard trend={historyData.trend} />
                  )}
                </div>
              </div>

              {/* Period Comparison Section */}
              <div className="pt-6 border-t border-slate-900/60">
                <PeriodComparisonPanel cityName={historyData.city_name} />
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default HistoryAnalysisPage;
