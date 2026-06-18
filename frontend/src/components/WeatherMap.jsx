import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import RiskBadge from './RiskBadge';

// Custom component to handle map centering
const RecenterMap = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 9, { animate: true, duration: 1 });
  }, [lat, lon, map]);
  return null;
};

// Pulse locator pin styling
const pulsingIcon = L.divIcon({
  className: 'custom-pulsing-marker',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-8 h-8 rounded-full bg-indigo-500 opacity-75 animate-ping"></div>
      <div class="relative w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10]
});

const WeatherMap = ({ lat, lon, cityName, temp, humidity, riskLevel }) => {
  const position = [lat, lon];

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 shadow-lg w-full flex flex-col h-[340px] md:h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="text-indigo-400" size={18} />
        <div>
          <h3 className="text-sm font-bold text-white">Localização no Mapa</h3>
          <span className="text-[10px] text-slate-500 block leading-none mt-0.5">Visão geográfica interativa</span>
        </div>
      </div>

      <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800/60 shadow-inner relative z-10">
        <MapContainer 
          center={position} 
          zoom={9} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <Marker position={position} icon={pulsingIcon}>
            <Popup className="custom-leaflet-popup">
              <div className="text-slate-900 p-1 font-semibold space-y-1.5 min-w-[140px]">
                <p className="text-sm font-black border-b border-slate-200 pb-1">{cityName}</p>
                <div className="text-xs space-y-1 text-slate-700">
                  <p>Temp: <span className="font-bold text-slate-900">{temp.toFixed(1)}°C</span></p>
                  <p>Umidade: <span className="font-bold text-slate-900">{humidity.toFixed(0)}%</span></p>
                </div>
                <div className="pt-1 flex justify-start">
                  <RiskBadge level={riskLevel} className="!text-[8px] !px-2 !py-0" />
                </div>
              </div>
            </Popup>
          </Marker>
          <RecenterMap lat={lat} lon={lon} />
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherMap;
