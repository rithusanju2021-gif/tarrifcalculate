import React, { useEffect, useState } from 'react';
import { useOneDayStore } from '../../store/useOneDayStore';
import { useVehicleStore } from '../../store/useVehicleStore';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import LocationInput from '../shared/LocationInput';
import TariffPanel from '../shared/TariffPanel';
import DistanceBadge from '../shared/DistanceBadge';
import MethodBadge from '../shared/MethodBadge';
import {
  MapPin,
  ArrowRight,
  Repeat,
  Trash2,
  MoveUp,
  MoveDown,
  Car,
  FileDown,
  Share2,
  BookmarkPlus,
  Check,
  Clock,
  Navigation,
  Info,
  Loader2
} from 'lucide-react';
import apiClient from '../../api/client';

export default function OneDayCalculator() {
  const {
    tripName,
    setTripName,
    stops,
    includeReturn,
    setIncludeReturn,
    addStop,
    removeStop,
    reorderStops,
    setManualKm,
    legs,
    totalKm,
    totalDurationMin,
    isCalculatingDistance,
    calculateDistances,
    customTariff,
    setCustomTariff,
    resetCustomTariff,
    pricingMethod,
    setPricingMethod,
    getCalculatedCost,
  } = useOneDayStore();

  const { vehicles, selectedVehicleId, selectVehicle, getSelectedVehicle } = useVehicleStore();
  const { saveOneDayTrip } = useSavedTripsStore();

  const selectedVehicle = getSelectedVehicle();
  const activeTariff = customTariff || selectedVehicle?.tariff || {};

  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Initial calculation on load if legs are empty
  useEffect(() => {
    if (legs.length === 0 && stops.length >= 2) {
      calculateDistances();
    }
  }, []);

  const costResult = getCalculatedCost(selectedVehicle?.tariff);

  const handleVehicleChange = (vId) => {
    selectVehicle(vId);
    // When changing vehicle, load its saved tariff
    const v = vehicles.find((x) => x.id === vId);
    if (v && v.tariff) {
      setCustomTariff({ ...v.tariff });
    }
  };

  const handleCopyWhatsApp = async () => {
    const payload = {
      title: tripName,
      vehicle_name: selectedVehicle?.name || 'Tourist Vehicle',
      total_km: costResult.actual_km,
      total_cost: costResult.total_cost,
      is_multiday: false,
      details: {
        legs,
        tariff: costResult.tariff,
        applied_method: costResult.applied_method,
      }
    };

    try {
      const res = await apiClient.post('/exports/whatsapp/', payload);
      if (res.data && res.data.text) {
        await navigator.clipboard.writeText(res.data.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (e) {
      // Fallback local text formatter
      const text = `*RITHISH TOURS & TRAVELS*\n*Quotation:* ${tripName}\n*Vehicle:* ${selectedVehicle?.name}\n*Distance:* ${costResult.actual_km} km\n*Total:* ₹${costResult.total_cost.toFixed(2)}`;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const payload = {
      title: tripName,
      vehicle_name: selectedVehicle?.name || 'Tourist Vehicle',
      total_km: costResult.actual_km,
      total_cost: costResult.total_cost,
      is_multiday: false,
      details: {
        legs,
        tariff: costResult.tariff,
        applied_method: costResult.applied_method,
        formula: costResult.formula,
      }
    };

    try {
      const res = await apiClient.post('/exports/pdf/', payload, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RTT_${tripName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('PDF generation server request failed. Please check backend connection.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    const tripData = {
      name: tripName,
      vehicle_name: selectedVehicle?.name || '',
      vehicle_id: selectedVehicleId,
      stops,
      include_return: includeReturn,
      legs,
      actual_km: costResult.actual_km,
      pricing_method: pricingMethod,
      applied_method: costResult.applied_method,
      tariff_snapshot: costResult.tariff,
      total_cost: costResult.total_cost,
    };

    await saveOneDayTrip(tripData);
    setIsSaving(false);
    setSaveSuccessMessage('Trip quotation saved successfully!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 14px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--text-gold)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              ONE-DAY CALCULATOR
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real Road Distance &amp; Rental Calculator</span>
          </div>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-medium)',
              color: 'var(--text-heading)',
              fontSize: '1.4rem',
              fontWeight: '800',
              fontFamily: 'var(--font-heading)',
              padding: '4px 0',
              width: '100%',
              maxWidth: '550px',
            }}
            placeholder="Trip Name (e.g. Chennai to Mahabalipuram)"
          />
        </div>

        {/* Vehicle Selection Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-surface)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
        }}>
          <Car size={18} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Vehicle:</div>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(parseInt(e.target.value, 10))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              {vehicles.filter(v => v.is_active).map((v) => (
                <option key={v.id} value={v.id} style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}>
                  {v.name} ({v.seating_capacity} Seater {v.vehicle_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {saveSuccessMessage && (
        <div style={{
          background: 'var(--accent-emerald-subtle)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '0.88rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Check size={18} />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Left = Itinerary & Stops, Right = Tariff & Result */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
      }}>
        {/* Left Column: Stops & Routing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stops List Card */}
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
                <Navigation size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Sightseeing Stops &amp; Route</h3>
              </div>

              {isCalculatingDistance && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                  <Loader2 size={14} className="pulse-indicator" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Routing road engine...</span>
                </div>
              )}
            </div>

            {/* List of stops */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {stops.map((stop, idx) => {
                const isStart = idx === 0;
                const isLast = idx === stops.length - 1;

                return (
                  <div
                    key={stop.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: isStart ? 'var(--accent-gold)' : (isLast ? 'var(--accent-cyan)' : 'var(--bg-surface-hover)'),
                          color: isStart ? '#000' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          flexShrink: 0,
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: '700' }}>
                            {stop.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {isStart ? 'Starting Location' : (isLast ? 'Destination Stop' : 'Sightseeing Stop')}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Reorder & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {idx > 0 && (
                          <button
                            onClick={() => reorderStops(idx, idx - 1)}
                            title="Move Up"
                            style={{ color: 'var(--text-muted)', padding: '4px' }}
                          >
                            <MoveUp size={15} />
                          </button>
                        )}
                        {idx < stops.length - 1 && (
                          <button
                            onClick={() => reorderStops(idx, idx + 1)}
                            title="Move Down"
                            style={{ color: 'var(--text-muted)', padding: '4px' }}
                          >
                            <MoveDown size={15} />
                          </button>
                        )}
                        {stops.length > 2 && (
                          <button
                            onClick={() => removeStop(stop.id)}
                            title="Remove Stop"
                            style={{ color: '#fda4af', padding: '4px', marginLeft: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Manual KM Override Box (allowed for destination legs) */}
                    {!isStart && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--card-inner-bg)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>Manual distance correction (km):</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={stop.manual_km ?? ''}
                          onChange={(e) => setManualKm(idx, e.target.value)}
                          placeholder="Auto (OSRM)"
                          style={{
                            width: '105px',
                            padding: '3px 8px',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-sm)',
                            color: stop.manual_km !== null ? 'var(--accent-cyan)' : 'var(--text-primary)',
                            fontWeight: stop.manual_km !== null ? '700' : '400',
                            fontSize: '0.8rem',
                            textAlign: 'right',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Next Stop Input */}
            <div style={{ marginBottom: '14px' }}>
              <label className="label-text">Add Sightseeing Stop or Destination</label>
              <LocationInput onSelectLocation={addStop} placeholder="Type location (e.g. Mahabalipuram, Pondicherry)..." />
            </div>

            {/* Return to Start Journey Option */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface-elevated)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Repeat size={17} color="var(--accent-gold)" />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700' }}>Include Return Journey</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Calculates road distance back to starting point ({stops[0]?.name})
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeReturn}
                onChange={(e) => setIncludeReturn(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Route Legs & Road Distance Breakdown Table */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700' }}>Consecutive Road Route Legs</h4>
              <button
                onClick={calculateDistances}
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Recalculate Routes</span>
              </button>
            </div>

            {legs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Add at least 2 locations to see route distance calculations.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {legs.map((leg, idx) => (
                  <div
                    key={`leg-${idx}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>#{idx + 1}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{leg.from}</span>
                      <ArrowRight size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{leg.to}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-gold)' }}>
                        {leg.distance_km} km
                      </span>
                      {leg.duration_min > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} />
                          ~{leg.duration_min}m
                        </span>
                      )}
                      <DistanceBadge source={leg.source} />
                    </div>
                  </div>
                ))}

                {/* Total Road Distance Summary */}
                <div style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>Total Road Distance:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-gold)', fontFamily: 'var(--font-heading)' }}>
                      {totalKm.toFixed(2)} km
                    </span>
                    {totalDurationMin > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        (~{Math.round(totalDurationMin / 60)}h {Math.round(totalDurationMin % 60)}m driving)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tariff Config & Live Results Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tariff Config Panel */}
          <TariffPanel
            tariff={activeTariff}
            onChangeTariff={setCustomTariff}
            pricingMethod={pricingMethod}
            onChangePricingMethod={setPricingMethod}
            actualKm={totalKm}
            vehicleName={selectedVehicle?.name}
            onResetToVehicleDefaults={() => {
              if (selectedVehicle?.tariff) {
                setCustomTariff({ ...selectedVehicle.tariff });
              }
            }}
          />

          {/* Live Cost Result Dashboard Card */}
          <div className="glass-panel" style={{
            padding: '20px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Trip Rental Estimate
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                  {selectedVehicle?.name}
                </div>
              </div>

              <MethodBadge
                method={costResult.applied_method}
                isManualOverride={costResult.is_manual_override}
              />
            </div>

            {/* Cost Breakdown Details */}
            <div style={{
              background: 'var(--card-inner-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Actual Distance:</span>
                <span style={{ fontWeight: '700' }}>{costResult.actual_km.toFixed(2)} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Included KM Limit:</span>
                <span style={{ fontWeight: '700', color: 'var(--text-gold)' }}>{costResult.included_km} km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Day Rent:</span>
                <span>₹{costResult.day_rent.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fuel Cost per KM:</span>
                <span>₹{costResult.fuel_cost_per_km.toFixed(2)} / km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>KM Rate (Method 2):</span>
                <span>₹{costResult.km_rate.toFixed(2)} / km</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Driver Bata:</span>
                <span>₹{costResult.driver_bata.toFixed(2)}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <div style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}>
                <strong>Formula:</strong> {costResult.formula}
              </div>
            </div>

            {/* Big Total Price */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: '700' }}>TOTAL QUOTATION</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>All distance &amp; rental bata included</div>
              </div>
              <div style={{
                fontSize: '1.85rem',
                fontWeight: '800',
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-heading)',
              }}>
                ₹{costResult.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Actions: Save, PDF, WhatsApp */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <button
                className="btn-secondary"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                style={{ width: '100%' }}
              >
                {isDownloadingPdf ? (
                  <Loader2 size={16} className="pulse-indicator" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <FileDown size={16} />
                )}
                <span>Export PDF</span>
              </button>

              <button
                className="btn-secondary"
                onClick={handleCopyWhatsApp}
                style={{ width: '100%', borderColor: isCopied ? 'var(--accent-emerald)' : 'var(--border-medium)' }}
              >
                {isCopied ? <Check size={16} color="var(--accent-emerald)" /> : <Share2 size={16} />}
                <span>{isCopied ? 'Copied!' : 'Copy WhatsApp'}</span>
              </button>
            </div>

            <button
              className="btn-primary"
              onClick={handleSaveTrip}
              disabled={isSaving}
              style={{ width: '100%', padding: '12px' }}
            >
              {isSaving ? (
                <Loader2 size={18} className="pulse-indicator" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <BookmarkPlus size={18} />
              )}
              <span>Save One-Day Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
