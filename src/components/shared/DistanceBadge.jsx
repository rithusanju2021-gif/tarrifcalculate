import React from 'react';
import { Wifi, Database, Edit3, AlertCircle } from 'lucide-react';

export default function DistanceBadge({ source, distanceKm, durationMin, error }) {
  if (source === 'MANUAL') {
    return (
      <span className="badge badge-manual" title="Manually entered/adjusted distance">
        <Edit3 size={12} />
        <span>MANUAL</span>
      </span>
    );
  }

  if (source === 'CACHED') {
    return (
      <span className="badge badge-cached" title="Fast local cached road route from database">
        <Database size={12} />
        <span>CACHED</span>
      </span>
    );
  }

  if (source === 'LIVE') {
    return (
      <span className="badge badge-live" title="Real-time road route from OSRM / OpenStreetMap">
        <Wifi size={12} />
        <span>LIVE</span>
      </span>
    );
  }

  return (
    <span className="badge" style={{ background: 'var(--accent-rose-subtle)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.3)' }} title={error || 'Route distance unavailable'}>
      <AlertCircle size={12} />
      <span>UNAVAILABLE</span>
    </span>
  );
}
