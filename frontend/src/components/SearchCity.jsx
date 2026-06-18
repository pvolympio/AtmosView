import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { weatherApi } from '../services/api';

const SearchCity = ({ onSelectCity }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await weatherApi.searchCities(query);
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding fetch failed:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (city) => {
    const cityText = `${city.name}${city.state ? `, ${city.state}` : ''}`;
    setQuery(cityText);
    setIsOpen(false);
    onSelectCity(cityText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      onSelectCity(query.trim());
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto z-[100]" ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          {loading ? (
            <Loader2 className="animate-spin text-indigo-400" size={20} />
          ) : (
            <Search size={20} />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por uma cidade brasileira (Ex: Itajubá, São Paulo)..."
          className="w-full pl-12 pr-12 py-3.5 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xl transition-all text-base backdrop-blur-md"
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-all"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-[999] backdrop-blur-lg overflow-hidden divide-y divide-slate-800/50">
          {suggestions.map((city, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left px-4 py-3 hover:bg-indigo-600/10 flex items-center gap-3 transition-colors text-slate-300 hover:text-white"
              >
                <div className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="font-semibold text-sm block">
                    {city.name}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {city.state ? `${city.state}, ` : ''}{city.country}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default SearchCity;
