import React from 'react';
import { Settings, Info, Zap, Gauge, RotateCcw } from 'lucide-react';

export default function TariffPanel({
  tariff,
  onChangeTariff,
  pricingMethod,
  onChangePricingMethod,
  actualKm = 0,
  onResetToVehicleDefaults,
  vehicleName = 'Selected Vehicle'
}) {
  const currentKm = parseFloat(actualKm) || 0;
  const incLimit = parseFloat(tariff.included_km) || 250;
  const isAutoMethod1 = currentKm <= incLimit;

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Editable Vehicle Rental Tariff</h3>
        </div>

        {onResetToVehicleDefaults && (
          <button
            onClick={onResetToVehicleDefaults}
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Reset to saved vehicle rates"
          >
            <RotateCcw size={13} />
            <span>Reset to {vehicleName}</span>
          </button>
        )}
      </div>

      {/* 5 Tariff Fields */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div>
          <label className="label-text">1. Day Rent (₹)</label>
          <input
            type="number"
            min="0"
            step="50"
            className="input-field"
            value={tariff.day_rent ?? ''}
            onChange={(e) => onChangeTariff({ day_rent: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 3800"
          />
        </div>

        <div>
          <label className="label-text">2. Fuel Cost / KM (₹)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            className="input-field"
            value={tariff.fuel_cost_per_km ?? ''}
            onChange={(e) => onChangeTariff({ fuel_cost_per_km: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 16"
          />
        </div>

        <div>
          <label className="label-text" style={{ color: 'var(--text-gold)' }}>
            3. Included KM Limit
          </label>
          <input
            type="number"
            min="10"
            step="10"
            className="input-field"
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
            value={tariff.included_km ?? ''}
            onChange={(e) => onChangeTariff({ included_km: parseFloat(e.target.value) || 250 })}
            placeholder="e.g. 250, 300, 350"
          />
        </div>

        <div>
          <label className="label-text">4. KM Rate (Method 2) (₹)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            className="input-field"
            value={tariff.km_rate ?? ''}
            onChange={(e) => onChangeTariff({ km_rate: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 19"
          />
        </div>

        <div>
          <label className="label-text">5. Driver Bata (₹)</label>
          <input
            type="number"
            min="0"
            step="50"
            className="input-field"
            value={tariff.driver_bata ?? ''}
            onChange={(e) => onChangeTariff({ driver_bata: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 500"
          />
        </div>
      </div>

      {/* Pricing Method Selector Override */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Pricing Method Selection
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Auto determines method based on distance vs included km limit, or you can force a method.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => onChangePricingMethod(null)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: pricingMethod === null ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                color: pricingMethod === null ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Auto ({isAutoMethod1 ? 'Method 1' : 'Method 2'})
            </button>

            <button
              onClick={() => onChangePricingMethod(1)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: pricingMethod === 1 ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.05)',
                color: pricingMethod === 1 ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Force Method 1
            </button>

            <button
              onClick={() => onChangePricingMethod(2)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: pricingMethod === 2 ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.05)',
                color: pricingMethod === 2 ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Force Method 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
