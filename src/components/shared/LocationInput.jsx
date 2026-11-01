import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import apiClient from '../../api/client';

const QUICK_SOUTH_INDIA_HUBS = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Mahabalipuram', lat: 12.6269, lng: 80.1927 },
  { name: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
  { name: 'Puducherry', lat: 11.9416, lng: 79.8083 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Rameswaram', lat: 9.2876, lng: 79.3129 },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
  { name: 'Ooty', lat: 11.4102, lng: 76.6950 },
  { name: 'Kodaikanal', lat: 10.2381, lng: 77.4892 },
  { name: 'Munnar', lat: 10.0889, lng: 77.0595 },
  { name: 'Alleppey', lat: 9.4981, lng: 76.3388 },
  { name: 'Mysore', lat: 12.2958, lng: 76.6394 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Coorg', lat: 12.4244, lng: 75.7382 },
  { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
];

export default function LocationInput({ onSelectLocation, placeholder = "Search city or sightseeing place..." }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const resp = await apiClient.get(`/routing/geocode/?q=${encodeURIComponent(query)}`);
        if (resp.data && Array.isArray(resp.data)) {
          setResults(resp.data);
          setIsOpen(true);
        }
      } catch (e) {
        // Fallback filter on client-side hubs
        const qLower = query.toLowerCase();
        const filtered = QUICK_SOUTH_INDIA_HUBS.filter(h => h.name.toLowerCase().includes(qLower));
        setResults(filtered.map(f => ({ display_name: `${f.name}, South India`, name: f.name, lat: f.lat, lng: f.lng })));
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={18}
          color="var(--accent-gold)"
          style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          className="input-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{ paddingLeft: '38px', paddingRight: '36px' }}
        />
        {isLoading ? (
          <Loader2
            size={18}
            className="pulse-indicator"
            color="var(--accent-gold)"
            style={{ position: 'absolute', right: '12px', animation: 'spin 1s linear infinite' }}
          />
        ) : query ? (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Quick South India Destination Chips */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        padding: '8px 0 2px',
        scrollbarWidth: 'none',
      }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Quick Add:</span>
        {QUICK_SOUTH_INDIA_HUBS.slice(0, 7).map((hub) => (
          <button
            key={hub.name}
            onClick={() => handleSelect(hub)}
            style={{
              fontSize: '0.74rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
            }}
          >
            + {hub.name}
          </button>
        ))}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 60,
          maxHeight: '260px',
          overflowY: 'auto',
        }}>
          {results.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              onClick={() => handleSelect(item)}
              style={{
                width: '100%',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                textAlign: 'left',
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={16} color="var(--accent-gold)" style={{ marginTop: '3px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {item.display_name || `${item.state || 'India'}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
