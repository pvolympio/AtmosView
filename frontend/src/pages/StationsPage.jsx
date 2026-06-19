import React, { useState } from 'react';
import SearchCity from '../components/SearchCity';
import LoadingState from '../components/Shared/LoadingState';
import ErrorState from '../components/Shared/ErrorState';
import { weatherApi } from '../services/api';
import { Landmark, Compass, MapPin, Database, Activity, ShieldCheck, Thermometer } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Leaflet markers styles
const cityIcon = L.divIcon({
  className: 'custom-pulsing-marker-city',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-8 h-8 rounded-full bg-indigo-500 opacity-60 animate-ping"></div>
      <div class="relative w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10]
});

const stationIcon = L.divIcon({
  className: 'custom-pulsing-marker-station',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-8 h-8 rounded-full bg-emerald-500 opacity-60 animate-ping"></div>
      <div class="relative w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10]
});

const RecenterMap = ({ points }) => {
  const map = useMap();
  React.useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
    }
  }, [points, map]);
  return null;
};

export default function StationsPage() {
  const [selectedCityName, setSelectedCityName] = useState('');
  const [cityCoords, setCityCoords] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resolves city coordinates from Geocoding search list, then fetches nearest station
  const handleSelectCity = async (cityText) => {
    setSelectedCityName(cityText);
    setLoading(true);
    setError(null);
    setStationData(null);
    setCityCoords(null);

    try {
      // 1. Resolve coordinates by querying cities search
      const parts = cityText.split(',');
      const searchName = parts[0].trim();
      const results = await weatherApi.searchCities(searchName);
      
      if (!results || results.length === 0) {
        throw new Error("Não encontramos coordenadas para a cidade.");
      }

      const bestCity = results[0];
      const coords = { lat: bestCity.latitude, lon: bestCity.longitude };
      setCityCoords(coords);

      // 2. Query nearest station from backend
      const station = await weatherApi.getNearestStations(coords.lat, coords.lon);
      setStationData(station);
    } catch (err) {
      console.error(err);
      setError({
        title: "Estação Terrestre Indisponível",
        message: `Não conseguimos localizar a estação física do INMET mais próxima para a localidade "${cityText}".`,
        action: () => handleSelectCity(cityText)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedCityName('');
    setCityCoords(null);
    setStationData(null);
    setError(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-900/60">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Landmark className="text-indigo-400" size={22} />
            Estações Meteorológicas
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Consulte a rede de estações físicas automáticas e manuais do INMET cadastradas no território brasileiro.
          </p>
        </div>
        
        {selectedCityName && (
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            <Compass size={13} />
            Nova Busca
          </button>
        )}
      </div>

      {!selectedCityName ? (
        /* Step 1: Select City */
        <div className="max-w-xl mx-auto text-center space-y-6 py-12">
          <div className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl inline-block text-indigo-400">
            <Database size={36} className="animate-float" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-white">Consulte a Rede de Solo</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              Pesquise qualquer cidade para descobrir a estação física do INMET mais próxima de suas coordenadas geográficas.
            </p>
          </div>
          <div className="w-full">
            <SearchCity onSelectCity={handleSelectCity} />
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8">
          {loading && (
            <div className="py-16">
              <LoadingState message="Buscando coordenadas urbanas e localizando sensores de superfície do INMET no banco de dados..." />
            </div>
          )}

          {error && !loading && (
            <div className="py-12">
              <ErrorState title={error.title} message={error.message} onRetry={error.action} />
            </div>
          )}

          {stationData && cityCoords && !loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Station Details Card */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                <div className="space-y-5 relative">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Database size={18} />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Estação Terrestre</span>
                  </div>

                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase">
                      INMET - {stationData.id}
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight mt-2.5">
                      {stationData.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Estado: {stationData.state} • Brasil
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 space-y-3.5 text-xs font-semibold text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Distância da Cidade:</span>
                      <span className="font-bold text-white px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20 text-xs">
                        {stationData.distance.toFixed(1)} km
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Altitude do Sensor:</span>
                      <span className="font-mono text-slate-100">
                        {stationData.altitude ? `${stationData.altitude.toFixed(0)} metros` : 'Não informada'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Status Operacional:</span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Activity size={12} className="animate-pulse" />
                        {stationData.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Latitude</span>
                        <span className="text-slate-350 block font-mono mt-0.5">{stationData.latitude.toFixed(4)}°</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Longitude</span>
                        <span className="text-slate-350 block font-mono mt-0.5">{stationData.longitude.toFixed(4)}°</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center gap-2 text-[10px] text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span>Esta estação fornece medições reais de temperatura, umidade e chuvas consolidadas diariamente.</span>
                </div>
              </div>

              {/* Interactive map representing distance path */}
              <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[400px] lg:h-auto">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-indigo-400" size={18} />
                  <div>
                    <h3 className="text-xs font-black text-white">Trajetória e Geoposicionamento</h3>
                    <span className="text-[9px] text-slate-500 font-bold block leading-none mt-0.5">Visão geográfica da distância urbana até o sensor</span>
                  </div>
                </div>

                <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800/60 shadow-inner relative z-10">
                  <MapContainer 
                    center={[cityCoords.lat, cityCoords.lon]} 
                    zoom={10} 
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    
                    {/* City Marker */}
                    <Marker position={[cityCoords.lat, cityCoords.lon]} icon={cityIcon}>
                      <Popup>
                        <div className="p-1 font-semibold text-slate-900 min-w-[120px] text-xs">
                          <p className="font-black border-b pb-0.5">{selectedCityName.split(',')[0]}</p>
                          <p className="mt-1 text-slate-650">Centro da Cidade</p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Station Marker */}
                    <Marker position={[stationData.latitude, stationData.longitude]} icon={stationIcon}>
                      <Popup>
                        <div className="p-1 font-semibold text-slate-900 min-w-[130px] text-xs">
                          <p className="font-black border-b pb-0.5 text-emerald-600">Estação {stationData.id}</p>
                          <p className="mt-1 text-slate-650">{stationData.name}</p>
                          <p className="text-slate-550">Alt: {stationData.altitude ? `${stationData.altitude}m` : '-'}</p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Line connecting them */}
                    <Polyline 
                      positions={[
                        [cityCoords.lat, cityCoords.lon],
                        [stationData.latitude, stationData.longitude]
                      ]}
                      color="#6366f1"
                      dashArray="4, 8"
                      weight={2}
                    />

                    <RecenterMap points={[
                      [cityCoords.lat, cityCoords.lon],
                      [stationData.latitude, stationData.longitude]
                    ]} />
                  </MapContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
