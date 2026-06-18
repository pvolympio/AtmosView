import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import HistoryAnalysisPage from './pages/HistoryAnalysisPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import LoadingState from './components/Shared/LoadingState';
import ErrorState from './components/Shared/ErrorState';
import { weatherApi } from './services/api';
import { CloudSun, Database, Info, Home as HomeIcon, LayoutDashboard, Cpu, LineChart, Brain } from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState('home'); // 'home', 'dashboard', 'history', 'about'
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch weather dashboard for any city name or coords string
  const executeSearch = async (cityText) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getWeatherDashboard(cityText);
      setWeatherData(data);
      // Automatically transition to dashboard page on successful query
      setActivePage('dashboard');
    } catch (err) {
      console.error(err);
      setError({
        title: "Consulta Indisponível",
        message: `Não foi possível carregar os dados de clima para "${cityText}". Verifique o nome da cidade e sua conexão.`,
        action: () => executeSearch(cityText)
      });
    } finally {
      setLoading(false);
    }
  };

  // Fast-load from saved database log
  const handleSelectRecord = (record) => {
    if (record && record.raw_data) {
      setWeatherData(record.raw_data);
      setActivePage('dashboard');
    } else {
      // Fallback: search again if raw_data is missing
      executeSearch(record.city_name);
    }
  };

  // Navigation page renderer
  const renderPageContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-24">
          <LoadingState message="Buscando dados climáticos no Open-Meteo e calculando índice..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-24">
          <ErrorState title={error.title} message={error.message} onRetry={error.action} />
        </div>
      );
    }

    switch (activePage) {
      case 'home':
        return <Home onSelectCity={executeSearch} />;
      case 'dashboard':
        return weatherData ? (
          <DashboardPage data={weatherData} onSearchNewCity={executeSearch} />
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">Nenhuma cidade analisada ainda. Por favor, busque no início.</p>
            <button 
              onClick={() => setActivePage('home')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        );
      case 'historical':
        return <HistoryAnalysisPage />;
      case 'ai-analysis':
        return <AIAnalysisPage />;
      case 'history':
        return <HistoryPage onSelectRecord={handleSelectRecord} />;
      case 'about':
        return <AboutPage />;
      default:
        return <Home onSelectCity={executeSearch} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      
      {/* Dynamic Header / Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-0">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActivePage('home')}>
            <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <CloudSun size={24} className="animate-float" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                AtmosView
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                  V3
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Análise Climática de Precisão</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActivePage('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'home' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HomeIcon size={13} />
              Início
            </button>
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'dashboard' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={13} />
              Dashboard
            </button>
            <button
              onClick={() => setActivePage('historical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'historical' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart size={13} />
              Análise Histórica
            </button>
            <button
              onClick={() => setActivePage('ai-analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'ai-analysis' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain size={13} />
              IA & ML
            </button>
            <button
              onClick={() => setActivePage('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'history' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database size={13} />
              Consultas
            </button>
            <button
              onClick={() => setActivePage('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'about' ? 'bg-slate-800 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info size={13} />
              Sobre
            </button>
          </nav>

          {/* Infrastructure tags */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PostgreSQL
            </span>
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
              <Cpu size={11} className="text-indigo-400" />
              Redis Cache
            </span>
          </div>

        </div>
      </header>

      {/* Main page content area */}
      <main className="flex-1 w-full py-8">
        {renderPageContent()}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900/60 pt-6 mt-12 text-center text-[10px] text-slate-650 font-semibold">
        <p>AtmosView V3 © 2026 • Plataforma de Análise Meteorológica e de Risco Climático Inteligente</p>
        <p className="mt-1 text-slate-700">Desenvolvido com React, Tailwind CSS, FastAPI, PostgreSQL, Redis e Scikit-learn.</p>
      </footer>

    </div>
  );
}

export default App;
