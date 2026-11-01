import React from 'react';
import { Zap, Gauge, CheckCircle2 } from 'lucide-react';

export default function MethodBadge({ method, isManualOverride }) {
  if (method === 1) {
    return (
      <span className="badge badge-method1" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <Zap size={13} />
        <span>Method 1: Day Rent + Fuel</span>
        {isManualOverride && <span style={{ opacity: 0.7, fontSize: '0.68rem' }}>(Forced)</span>}
      </span>
    );
  }

  return (
    <span className="badge badge-method2" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <Gauge size={13} />
      <span>Method 2: KM Rate (Entire KM)</span>
      {isManualOverride && <span style={{ opacity: 0.7, fontSize: '0.68rem' }}>(Forced)</span>}
    </span>
  );
}
