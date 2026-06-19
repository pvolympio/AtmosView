import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import { User, MapPin, Sliders, Bell, Star, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ProfilePage = ({ user, onUserUpdate, onSelectCity }) => {
  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [tempUnit, setTempUnit] = useState(user?.temperature_unit || 'C');
  const [theme, setTheme] = useState(user?.theme || 'dark');
  
  // Alert Thresholds States
  const [tempAbove, setTempAbove] = useState(user?.alert_temp_above ?? 35);
  const [humidityBelow, setHumidityBelow] = useState(user?.alert_humidity_below ?? 20);
  const [rainAbove, setRainAbove] = useState(user?.alert_rain_above ?? 50);
  const [windAbove, setWindAbove] = useState(user?.alert_wind_above ?? 60);
  const [riskLevel, setRiskLevel] = useState(user?.alert_risk_level || 'Alto');

  // Checkbox/toggle to enable/disable thresholds (represented by null in db)
  const [enableTemp, setEnableTemp] = useState(user?.alert_temp_above !== null);
  const [enableHumidity, setEnableHumidity] = useState(user?.alert_humidity_below !== null);
  const [enableRain, setEnableRain] = useState(user?.alert_rain_above !== null);
  const [enableWind, setEnableWind] = useState(user?.alert_wind_above !== null);
  const [enableRisk, setEnableRisk] = useState(user?.alert_risk_level !== null);

  // Favorites States
  const [favorites, setFavorites] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
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
      console.error("Erro ao carregar favoritos:", err);
    } finally {
      setLoadingFavs(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg(null);
    setProfileLoading(true);

    try {
      const payload = {
        full_name: fullName,
        temperature_unit: tempUnit,
        theme: theme,
        alert_temp_above: enableTemp ? Number(tempAbove) : null,
        alert_humidity_below: enableHumidity ? Number(humidityBelow) : null,
        alert_rain_above: enableRain ? Number(rainAbove) : null,
        alert_wind_above: enableWind ? Number(windAbove) : null,
        alert_risk_level: enableRisk ? riskLevel : null
      };

      const updatedUser = await weatherApi.updateProfile(payload);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);
      setMsg({ type: 'success', text: 'Configurações de perfil e alertas salvas com sucesso!' });
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Erro ao salvar alterações.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteFavorite = async (id) => {
    try {
      await weatherApi.deleteFavorite(id);
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      alert('Não foi possível remover a cidade favorita.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Preferências & Perfil</h2>
          <p className="text-xs text-slate-450">Gerencie suas configurações e alertas personalizados do AtmosView.</p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border flex gap-3 text-xs font-semibold animate-fade-in ${
          msg.type === 'success' 
            ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-550/10 border-rose-500/20 text-rose-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Form */}
        <div className="lg:col-span-2 space-y-8">
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* General Info */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
                <User size={16} className="text-indigo-400" />
                Dados do Perfil
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Nome Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">E-mail (Não Alterável)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Unidade de Medida</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTempUnit('C')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        tempUnit === 'C'
                          ? 'bg-indigo-600/10 border-indigo-550/45 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-450 hover:text-white'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempUnit('F')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        tempUnit === 'F'
                          ? 'bg-indigo-600/10 border-indigo-550/45 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-450 hover:text-white'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Tema Visual</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-950 border border-slate-900 text-slate-500 cursor-not-allowed"
                    >
                      Tema Escuro (Padrão)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Alert Configuration */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell size={16} className="text-indigo-400 animate-bounce" />
                  Alertas Climáticos Personalizados
                </h3>
                <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 text-indigo-350 px-2 py-0.5 rounded-md font-bold uppercase">V5</span>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Configure limites personalizados. Quando você buscar uma cidade ou carregar dados, o AtmosView avisará imediatamente se o clima exceder seus parâmetros de conforto ou segurança.
              </p>

              <div className="space-y-5 pt-2">
                
                {/* Temp Above */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableTemp}
                        onChange={(e) => setEnableTemp(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      Alerta de Calor
                    </label>
                    {enableTemp && <span className="text-xs font-bold text-indigo-400">{tempAbove}°C</span>}
                  </div>
                  {enableTemp && (
                    <input
                      type="range"
                      min="15"
                      max="48"
                      value={tempAbove}
                      onChange={(e) => setTempAbove(e.target.value)}
                      className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  )}
                  <p className="text-[10px] text-slate-500 font-medium pl-6">Disparado se a temperatura superar o valor configurado.</p>
                </div>

                {/* Humidity Below */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableHumidity}
                        onChange={(e) => setEnableHumidity(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      Alerta de Umidade Baixa (Ar Seco)
                    </label>
                    {enableHumidity && <span className="text-xs font-bold text-indigo-400">{humidityBelow}%</span>}
                  </div>
                  {enableHumidity && (
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={humidityBelow}
                      onChange={(e) => setHumidityBelow(e.target.value)}
                      className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  )}
                  <p className="text-[10px] text-slate-500 font-medium pl-6">Disparado se a umidade relativa do ar cair abaixo desse valor.</p>
                </div>

                {/* Rain Above */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableRain}
                        onChange={(e) => setEnableRain(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      Alerta de Volume de Chuva
                    </label>
                    {enableRain && <span className="text-xs font-bold text-indigo-400">{rainAbove} mm</span>}
                  </div>
                  {enableRain && (
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={rainAbove}
                      onChange={(e) => setRainAbove(e.target.value)}
                      className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  )}
                  <p className="text-[10px] text-slate-500 font-medium pl-6">Disparado caso o volume acumulado diário ultrapasse este limite.</p>
                </div>

                {/* Wind Above */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableWind}
                        onChange={(e) => setEnableWind(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      Alerta de Ventania / Rajadas
                    </label>
                    {enableWind && <span className="text-xs font-bold text-indigo-400">{windAbove} km/h</span>}
                  </div>
                  {enableWind && (
                    <input
                      type="range"
                      min="20"
                      max="120"
                      value={windAbove}
                      onChange={(e) => setWindAbove(e.target.value)}
                      className="w-full accent-indigo-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  )}
                  <p className="text-[10px] text-slate-500 font-medium pl-6">Disparado se a velocidade máxima do vento exceder a marca.</p>
                </div>

                {/* Risk Score Level */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={enableRisk}
                        onChange={(e) => setEnableRisk(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                      />
                      Alerta por Classificação de Risco (ICR)
                    </label>
                  </div>
                  {enableRisk && (
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Moderado">Apenas Moderado, Alto ou Crítico</option>
                      <option value="Alto">Apenas Alto ou Crítico</option>
                      <option value="Crítico">Apenas Crítico</option>
                    </select>
                  )}
                  <p className="text-[10px] text-slate-500 font-medium pl-6">Alerta imediato caso a avaliação de Risco ICR atinja o patamar selecionado.</p>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {profileLoading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </form>

        </div>

        {/* Favorite Cities List */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star size={16} className="text-amber-400 fill-amber-450" />
                Cidades Favoritas
              </h3>
              <button 
                onClick={fetchFavorites}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                title="Atualizar lista"
              >
                <RefreshCw size={12} className={loadingFavs ? "animate-spin" : ""} />
              </button>
            </div>

            {loadingFavs ? (
              <div className="text-center py-8 text-xs text-slate-550 font-medium">Carregando lista...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-slate-500">
                <MapPin size={28} className="mx-auto text-slate-600" />
                <p className="text-[11px] font-medium leading-relaxed">Nenhuma cidade favoritada ainda.</p>
                <p className="text-[10px] text-slate-600">Busque cidades no Dashboard e clique na estrela para adicioná-las aqui!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900/60 max-h-[420px] overflow-y-auto pr-1">
                {favorites.map((fav) => (
                  <div key={fav.id} className="py-3.5 flex justify-between items-center gap-3 group">
                    <div className="min-w-0 flex-1">
                      <h4 
                        onClick={() => onSelectCity(fav.city_name)}
                        className="text-xs font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors truncate"
                      >
                        {fav.city_name}
                      </h4>
                      <p className="text-[10px] text-slate-550 font-semibold mt-0.5 truncate">
                        {fav.state ? `${fav.state}, ` : ''}{fav.country}
                      </p>
                      <p className="text-[9px] text-slate-600 font-mono mt-0.5">
                        Lat: {fav.latitude.toFixed(2)} | Lon: {fav.longitude.toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteFavorite(fav.id)}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-450 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 rounded-xl transition-all"
                      title="Remover dos favoritos"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
