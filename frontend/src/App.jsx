import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import HistoryAnalysisPage from './pages/HistoryAnalysisPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import SourceComparisonPage from './pages/SourceComparisonPage';
import StationsPage from './pages/StationsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import MethodologyPage from './pages/MethodologyPage';
import LoadingState from './components/Shared/LoadingState';
import ErrorState from './components/Shared/ErrorState';
import { weatherApi } from './services/api';
import { 
  CloudSun, Database, Info, Home as HomeIcon, LayoutDashboard, Cpu, 
  LineChart, Brain, Compass, Landmark, User, FileText, BookOpen, 
  Bell, LogOut, Star, AlertTriangle, X 
} from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState('home'); // 'home', 'dashboard', 'history', 'about'
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // V5 states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [uiAlerts, setUiAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Restauração de sessão e dados do usuário
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchAlerts();
    } else {
      setFavorites([]);
      setAlerts([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const data = await weatherApi.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await weatherApi.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Erro ao carregar alertas:", err);
    }
  };

  const checkThresholds = async (data, currentUser) => {
    if (!currentUser) return;
    const triggers = [];
    
    if (currentUser.alert_temp_above !== null && data.current.temperature > currentUser.alert_temp_above) {
      triggers.push({
        alert_type: 'temperatura',
        alert_value: currentUser.alert_temp_above,
        measured_value: data.current.temperature,
        message: `Temperatura de ${data.current.temperature.toFixed(1)}°C superou o limite de ${currentUser.alert_temp_above}°C em ${data.city_name}.`
      });
    }
    if (currentUser.alert_humidity_below !== null && data.current.relative_humidity < currentUser.alert_humidity_below) {
      triggers.push({
        alert_type: 'umidade',
        alert_value: currentUser.alert_humidity_below,
        measured_value: data.current.relative_humidity,
        message: `Umidade de ${data.current.relative_humidity.toFixed(0)}% caiu abaixo do limite de ${currentUser.alert_humidity_below}% em ${data.city_name}.`
      });
    }
    if (currentUser.alert_rain_above !== null && data.current.precipitation > currentUser.alert_rain_above) {
      triggers.push({
        alert_type: 'chuva',
        alert_value: currentUser.alert_rain_above,
        measured_value: data.current.precipitation,
        message: `Chuva de ${data.current.precipitation.toFixed(1)}mm superou o limite de ${currentUser.alert_rain_above}mm em ${data.city_name}.`
      });
    }
    if (currentUser.alert_wind_above !== null && data.current.wind_speed > currentUser.alert_wind_above) {
      triggers.push({
        alert_type: 'vento',
        alert_value: currentUser.alert_wind_above,
        measured_value: data.current.wind_speed,
        message: `Vento de ${data.current.wind_speed.toFixed(1)}km/h superou o limite de ${currentUser.alert_wind_above}km/h em ${data.city_name}.`
      });
    }
    if (currentUser.alert_risk_level) {
      const riskLevels = ['Baixo', 'Moderado', 'Alto', 'Crítico'];
      const userRiskIdx = riskLevels.indexOf(currentUser.alert_risk_level);
      const currentRiskIdx = riskLevels.indexOf(data.risk.nivel);
      if (userRiskIdx !== -1 && currentRiskIdx >= userRiskIdx) {
        triggers.push({
          alert_type: 'risco',
          alert_value: userRiskIdx,
          measured_value: currentRiskIdx,
          message: `Risco climático atingiu o nível ${data.risk.nivel} em ${data.city_name}, superando o limite (${currentUser.alert_risk_level}).`
        });
      }
    }

    if (triggers.length > 0) {
      for (const alert of triggers) {
        try {
          await weatherApi.createAlert({
            city_name: data.city_name,
            alert_type: alert.alert_type,
            alert_value: Number(alert.alert_value),
            measured_value: Number(alert.measured_value),
            message: alert.message
          });
        } catch (e) {
          console.error("Erro ao registrar alerta:", e);
        }
      }
      fetchAlerts();
      setUiAlerts(triggers);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !weatherData) return;
    const isFav = favorites.some(fav => fav.city_name.toLowerCase() === weatherData.city_name.toLowerCase());
    
    try {
      if (isFav) {
        const favoriteObj = favorites.find(fav => fav.city_name.toLowerCase() === weatherData.city_name.toLowerCase());
        if (favoriteObj) {
          await weatherApi.deleteFavorite(favoriteObj.id);
          setFavorites(favorites.filter(fav => fav.id !== favoriteObj.id));
        }
      } else {
        const newFav = await weatherApi.addFavorite({
          city_name: weatherData.city_name,
          latitude: weatherData.latitude,
          longitude: weatherData.longitude,
          state: weatherData.state,
          country: weatherData.country
        });
        setFavorites([...favorites, newFav]);
      }
    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
    }
  };

  const handleLoginSuccess = (usr, tok) => {
    setUser(usr);
    setToken(tok);
    setActivePage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setUiAlerts([]);
    setActivePage('home');
  };

  // Fetch weather dashboard for any city name or coords string
  const executeSearch = async (cityText) => {
    setLoading(true);
    setError(null);
    setUiAlerts([]);
    try {
      const data = await weatherApi.getWeatherDashboard(cityText);
      setWeatherData(data);
      if (user) {
        await checkThresholds(data, user);
      }
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
      if (user) {
        checkThresholds(record.raw_data, user);
      }
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

    const isFav = weatherData && favorites.some(fav => fav.city_name.toLowerCase() === weatherData.city_name.toLowerCase());

    switch (activePage) {
      case 'home':
        return <Home onSelectCity={executeSearch} />;
      case 'dashboard':
        return weatherData ? (
          <DashboardPage 
            data={weatherData} 
            onSearchNewCity={executeSearch} 
            user={user}
            isFavorite={isFav}
            onToggleFavorite={handleToggleFavorite}
          />
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
      case 'source-comparison':
        return <SourceComparisonPage />;
      case 'stations':
        return <StationsPage />;
      case 'history':
        return <HistoryPage onSelectRecord={handleSelectRecord} />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'profile':
        return user ? (
          <ProfilePage user={user} onUserUpdate={(u) => setUser(u)} onSelectCity={executeSearch} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        );
      case 'reports':
        return user ? (
          <ReportsPage />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        );
      case 'methodology':
        return <MethodologyPage />;
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
                  V5
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Análise Climática de Precisão</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto max-w-full">
            <button
              onClick={() => setActivePage('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'home' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HomeIcon size={13} />
              Início
            </button>
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'dashboard' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={13} />
              Dashboard
            </button>
            <button
              onClick={() => setActivePage('historical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'historical' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LineChart size={13} />
              Histórico
            </button>
            <button
              onClick={() => setActivePage('ai-analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'ai-analysis' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain size={13} />
              IA
            </button>
            <button
              onClick={() => setActivePage('source-comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'source-comparison' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass size={13} />
              Comparação de Fontes
            </button>
            <button
              onClick={() => setActivePage('stations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'stations' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark size={13} />
              Estações
            </button>
            <button
              onClick={() => setActivePage('methodology')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'methodology' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={13} />
              Metodologia
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActivePage('reports')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'reports' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText size={13} />
                  Relatórios
                </button>
                <button
                  onClick={() => setActivePage('profile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'profile' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User size={13} />
                  Perfil
                </button>
              </>
            )}
            <button
              onClick={() => setActivePage('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePage === 'about' ? 'bg-slate-850 text-white border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info size={13} />
              Sobre
            </button>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {/* Bell Icon & Notification dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-2xl border transition-all relative ${
                    alerts.some(a => !a.is_read)
                      ? 'bg-indigo-600/10 border-indigo-500/25 text-indigo-400'
                      : 'bg-slate-900 border-slate-800 text-slate-450 hover:text-white'
                  }`}
                  title="Alertas Climáticos"
                >
                  <Bell size={14} className={alerts.some(a => !a.is_read) ? "animate-bounce" : ""} />
                  {alerts.filter(a => !a.is_read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <h4 className="text-xs font-black text-white">Alertas Recentes</h4>
                      <button 
                        onClick={() => { setShowNotifications(false); fetchAlerts(); }} 
                        className="text-[10px] text-slate-500 hover:text-white font-bold"
                      >
                        Fechar
                      </button>
                    </div>
                    
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {alerts.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-4">Nenhum alerta climatológico registrado.</p>
                      ) : (
                        alerts.map((alt) => (
                          <div key={alt.id} className="text-[10px] bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/60 leading-relaxed font-medium">
                            <div className="flex justify-between text-[9px] text-slate-500 font-bold mb-1">
                              <span className="uppercase text-indigo-450">{alt.alert_type}</span>
                              <span>{new Date(alt.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-slate-350">{alt.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('profile')}
                  className="hidden md:flex flex-col text-right cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-white leading-none">{user.full_name || user.email}</span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-0.5">Ver Perfil</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500/20 hover:bg-rose-550/5 text-slate-450 hover:text-rose-400 rounded-2xl transition-all"
                  title="Sair"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActivePage('login')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Entrar
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main page content area */}
      <main className="flex-1 w-full py-8">
        
        {/* Warning banner for search-triggered alerts */}
        {uiAlerts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 animate-bounce">
            <div className="p-4 bg-rose-500/10 border border-rose-500/35 rounded-3xl flex justify-between items-start gap-4 shadow-lg shadow-rose-950/20">
              <div className="flex gap-3 items-start">
                <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Aviso Climático Ativado</h4>
                  <div className="space-y-1 text-slate-350 text-[11px] font-semibold">
                    {uiAlerts.map((alt, idx) => (
                      <p key={idx}>• {alt.message}</p>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setUiAlerts([])} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {renderPageContent()}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900/60 pt-6 mt-12 text-center text-[10px] text-slate-650 font-semibold">
        <p>AtmosView V5 © 2026 • Plataforma de Análise Meteorológica e de Risco Climático Inteligente</p>
        <p className="mt-1 text-slate-700">Desenvolvido com React, Tailwind CSS, FastAPI, PostgreSQL, Redis, Scikit-learn, INMET, NASA POWER e ReportLab PDF.</p>
      </footer>

    </div>
  );
}

export default App;
