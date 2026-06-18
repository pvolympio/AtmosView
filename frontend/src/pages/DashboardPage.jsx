import React from 'react';
import WeatherOverview from '../components/WeatherOverview';
import ClimateSummary from '../components/ClimateSummary';
import WeatherCard from '../components/WeatherCard';
import RiskExplanation from '../components/RiskExplanation';
import TemperatureChart from '../components/TemperatureChart';
import RainChart from '../components/RainChart';
import WindChart from '../components/WindChart';
import ForecastTable from '../components/ForecastTable';
import WeatherMap from '../components/WeatherMap';
import SearchCity from '../components/SearchCity';

import { 
  Thermometer, Droplets, Wind, CloudRain, Gauge, Activity 
} from 'lucide-react';

const DashboardPage = ({ data, onSearchNewCity }) => {
  const { current, risk, summary, daily } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      
      {/* Search Bar at the top of Dashboard for easy navigation */}
      <div className="max-w-xl mx-auto">
        <SearchCity onSelectCity={onSearchNewCity} />
      </div>

      {/* Overview Metadata */}
      <WeatherOverview 
        cityName={data.city_name}
        state={data.state}
        country={data.country}
        latitude={data.latitude}
        longitude={data.longitude}
        observationTime={current.observation_time}
        weatherCode={current.weather_code}
      />

      {/* Climate summary text */}
      <ClimateSummary summary={summary} />

      {/* Main Grid: Climate metric cards & risk factor index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Climate Metric Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Condições Atmosféricas Atuais</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <WeatherCard 
              title="Temperatura" 
              value={`${current.temperature.toFixed(1)}°C`} 
              icon={Thermometer} 
              description="Medição local no abrigo térmico" 
              iconColor="text-rose-400"
              borderColor="hover:border-rose-500/30"
            />
            <WeatherCard 
              title="Sensação Térmica" 
              value={`${current.apparent_temperature.toFixed(1)}°C`} 
              icon={Activity} 
              description="Impacto térmico sentido na pele" 
              iconColor="text-orange-400"
              borderColor="hover:border-orange-500/30"
            />
            <WeatherCard 
              title="Umidade Relativa" 
              value={`${current.relative_humidity.toFixed(0)}%`} 
              icon={Droplets} 
              description="Concentração de vapor d'água" 
              iconColor="text-sky-400"
              borderColor="hover:border-sky-500/30"
            />
            <WeatherCard 
              title="Pressão Atmosférica" 
              value={`${current.surface_pressure.toFixed(0)} hPa`} 
              icon={Gauge} 
              description="Pressão barométrica de superfície" 
              iconColor="text-violet-400"
              borderColor="hover:border-violet-500/30"
            />
            <WeatherCard 
              title="Velocidade do Vento" 
              value={`${current.wind_speed.toFixed(1)} km/h`} 
              icon={Wind} 
              description="Velocidade média das correntes" 
              iconColor="text-teal-400"
              borderColor="hover:border-teal-500/30"
            />
            <WeatherCard 
              title="Chuva Recente" 
              value={`${current.precipitation.toFixed(1)} mm`} 
              icon={CloudRain} 
              description="Volume precipitado na última hora" 
              iconColor="text-indigo-400"
              borderColor="hover:border-indigo-500/30"
            />
          </div>

          {/* Forecasting Tab/Charts stack */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Tendências Climatológicas (Próximos 7 Dias)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TemperatureChart daily={daily} />
              <RainChart daily={daily} />
              <WindChart daily={daily} />
            </div>
          </div>
        </div>

        {/* Right 1/3: Risco Climático e Ações */}
        <div className="space-y-6">
          <RiskExplanation risk={risk} />
          
          <WeatherMap 
            lat={data.latitude} 
            lon={data.longitude} 
            cityName={data.city_name} 
            temp={current.temperature}
            humidity={current.relative_humidity}
            riskLevel={risk.nivel}
          />
        </div>

      </div>

      {/* Week overview details */}
      <div className="pt-4">
        <ForecastTable daily={daily} />
      </div>

    </div>
  );
};

export default DashboardPage;
