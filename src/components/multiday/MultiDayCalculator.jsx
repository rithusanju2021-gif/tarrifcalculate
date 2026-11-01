import React, { useEffect, useState } from 'react';
import { useMultiDayStore } from '../../store/useMultiDayStore';
import { useVehicleStore } from '../../store/useVehicleStore';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import LocationInput from '../shared/LocationInput';
import TariffPanel from '../shared/TariffPanel';
import DistanceBadge from '../shared/DistanceBadge';
import MethodBadge from '../shared/MethodBadge';
import {
  CalendarDays,
  Plus,
  Trash2,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  MoveUp,
  MoveDown,
  BedDouble,
  FileDown,
  Share2,
  BookmarkPlus,
  Check,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import apiClient from '../../api/client';

export default function MultiDayCalculator() {
  const {
    tourName,
    setTourName,
    days,
    activeDayIndex,
    setActiveDayIndex,
    addDay,
    removeDay,
    updateDayProperty,
    addStopToDay,
    removeStopFromDay,
    reorderStopsInDay,
    setManualKmForDayStop,
    setDayTariff,
    setDayPricingMethod,
    calculateDayDistances,
    calculateAllDaysDistances,
    getTourTotals,
    isCalculating,
  } = useMultiDayStore();

  const { vehicles, selectedVehicleId, selectVehicle, getSelectedVehicle } = useVehicleStore();
  const { saveMultiDayTour } = useSavedTripsStore();

  const selectedVehicle = getSelectedVehicle();
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Calculate distances for all days on mount if uncalculated
  useEffect(() => {
    if (days.some(d => d.actual_km === 0 && d.stops.length >= 2)) {
      calculateAllDaysDistances();
    }
  }, []);

  const tourTotals = getTourTotals(selectedVehicle?.tariff);
  const currentDay = days[activeDayIndex] || days[0];
  const currentDayCalc = tourTotals.days[activeDayIndex] || tourTotals.days[0];

  const handleCopyWhatsApp = async () => {
    const payload = {
      title: tourName,
      vehicle_name: selectedVehicle?.name || 'Tourist Vehicle',
      total_km: tourTotals.total_tour_km,
      total_cost: tourTotals.total_tour_cost,
      is_multiday: true,
      details: {
        days: tourTotals.days,
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
      // Fallback
      let text = `*RITHISH TOURS & TRAVELS*\n*Tour:* ${tourName}\n*Vehicle:* ${selectedVehicle?.name}\n*Total Distance:* ${tourTotals.total_tour_km} km\n*Grand Total:* ₹${tourTotals.total_tour_cost.toFixed(2)}`;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const payload = {
      title: tourName,
      vehicle_name: selectedVehicle?.name || 'Tourist Vehicle',
      total_km: tourTotals.total_tour_km,
      total_cost: tourTotals.total_tour_cost,
      is_multiday: true,
      details: {
        days: tourTotals.days,
      }
    };

    try {
      const res = await apiClient.post('/exports/pdf/', payload, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RTT_${tourName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('PDF generation server request failed. Please check backend connection.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSaveTour = async () => {
    setIsSaving(true);
    const tourData = {
      name: tourName,
      vehicle_name: selectedVehicle?.name || '',
      vehicle_id: selectedVehicleId,
      total_km: tourTotals.total_tour_km,
      total_cost: tourTotals.total_tour_cost,
      days_count: days.length,
      days_data: tourTotals.days,
    };

    await saveMultiDayTour(tourData);
    setIsSaving(false);
    setSaveSuccessMessage('Multi-Day Tour Quotation saved successfully!');
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
            <span className="badge" style={{ background: 'var(--accent-purple-subtle)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              MULTI-DAY TOUR PLANNER
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>South India Itinerary &amp; Package Costing</span>
          </div>
          <input
            type="text"
            value={tourName}
            onChange={(e) => setTourName(e.target.value)}
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
              maxWidth: '580px',
            }}
            placeholder="Tour Package Title"
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
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle For Tour:</div>
            <select
              value={selectedVehicleId}
              onChange={(e) => selectVehicle(parseInt(e.target.value, 10))}
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
                  {v.name} ({v.seating_capacity} Seater)
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

      {/* Day Tabs Carousel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        scrollbarWidth: 'none',
      }}>
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          const dayCalc = tourTotals.days[idx];

          return (
            <button
              key={`day-tab-${idx}`}
              onClick={() => setActiveDayIndex(idx)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                border: isActive ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isActive ? 'var(--shadow-gold)' : 'none',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isActive ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#000' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {idx + 1}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Day {idx + 1}</div>
                <div style={{ fontSize: '0.72rem', color: isActive ? 'var(--text-gold)' : 'var(--text-muted)' }}>
                  {dayCalc ? `${dayCalc.actual_km.toFixed(1)} km • ₹${dayCalc.total_cost.toLocaleString('en-IN')}` : '0 km'}
                </div>
              </div>
            </button>
          );
        })}

        <button
          onClick={addDay}
          className="btn-secondary"
          style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <Plus size={16} />
          <span>Add Day</span>
        </button>
      </div>

      {/* Main Grid for Active Day */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
      }}>
        {/* Left: Active Day Itinerary & Stops */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <span className="badge badge-cached" style={{ marginBottom: '4px' }}>
                  DAY {activeDayIndex + 1} OF {days.length}
                </span>
                <input
                  type="text"
                  value={currentDay.title}
                  onChange={(e) => updateDayProperty(activeDayIndex, 'title', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px dashed var(--border-medium)',
                    color: 'var(--text-heading)',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    width: '100%',
                    padding: '2px 0',
                  }}
                  placeholder="Day Title / Route Summary"
                />
              </div>

              {days.length > 1 && (
                <button
                  onClick={() => removeDay(activeDayIndex)}
                  style={{
                    color: '#fda4af',
                    background: 'var(--accent-rose-subtle)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Delete this tour day"
                >
                  <Trash2 size={14} />
                  <span>Remove Day</span>
                </button>
              )}
            </div>

            {/* Overnight Halt Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-surface-elevated)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}>
              <BedDouble size={18} color="var(--accent-gold)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Overnight Halt / Stay Location:
                </div>
                <input
                  type="text"
                  value={currentDay.overnight_halt}
                  onChange={(e) => updateDayProperty(activeDayIndex, 'overnight_halt', e.target.value)}
                  placeholder="e.g. Pondicherry, Thanjavur, Madurai, Munnar..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '0.92rem',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Stops in this day */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div className="label-text">Sightseeing Stops for Day {activeDayIndex + 1}</div>
              {currentDay.stops.map((stop, sIdx) => (
                <div
                  key={stop.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: sIdx === 0 ? 'var(--accent-gold)' : 'var(--bg-surface-hover)',
                      color: sIdx === 0 ? '#000' : '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {sIdx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>{stop.name}</div>
                      {sIdx > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Manual override (km):{' '}
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={stop.manual_km ?? ''}
                            onChange={(e) => setManualKmForDayStop(activeDayIndex, sIdx, e.target.value)}
                            placeholder="Auto"
                            style={{
                              width: '65px',
                              padding: '2px 4px',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '4px',
                              color: 'var(--accent-cyan)',
                              fontSize: '0.72rem',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {sIdx > 0 && (
                      <button onClick={() => reorderStopsInDay(activeDayIndex, sIdx, sIdx - 1)} style={{ color: 'var(--text-muted)', padding: '4px' }}>
                        <MoveUp size={14} />
                      </button>
                    )}
                    {sIdx < currentDay.stops.length - 1 && (
                      <button onClick={() => reorderStopsInDay(activeDayIndex, sIdx, sIdx + 1)} style={{ color: 'var(--text-muted)', padding: '4px' }}>
                        <MoveDown size={14} />
                      </button>
                    )}
                    {currentDay.stops.length > 1 && (
                      <button onClick={() => removeStopFromDay(activeDayIndex, stop.id)} style={{ color: '#fda4af', padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Stop Input */}
            <div>
              <label className="label-text">Add Destination / Stop to Day {activeDayIndex + 1}</label>
              <LocationInput
                onSelectLocation={(loc) => addStopToDay(activeDayIndex, loc)}
                placeholder="Search sightseeing destination..."
              />
            </div>
          </div>

          {/* Active Day Road Legs Table */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700' }}>Day {activeDayIndex + 1} Road Distance Legs</h4>
              <button
                onClick={() => calculateDayDistances(activeDayIndex)}
                style={{ fontSize: '0.74rem', color: 'var(--accent-gold)' }}
              >
                Recalculate Day {activeDayIndex + 1}
              </button>
            </div>

            {currentDay.legs.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Add 2 or more stops for Day {activeDayIndex + 1} to calculate actual road distance.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentDay.legs.map((leg, idx) => (
                  <div
                    key={`dleg-${idx}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '600' }}>{leg.from}</span>
                      <ArrowRight size={13} color="var(--text-muted)" />
                      <span style={{ fontWeight: '600' }}>{leg.to}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-gold)' }}>{leg.distance_km} km</span>
                      <DistanceBadge source={leg.source} />
                    </div>
                  </div>
                ))}

                <div style={{
                  padding: '10px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Day {activeDayIndex + 1} Total Distance:</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-gold)' }}>
                    {currentDay.actual_km.toFixed(2)} km
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Tariff & Full Tour Grand Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Day Tariff Configuration */}
          <TariffPanel
            tariff={currentDayCalc.tariff}
            onChangeTariff={(updates) => setDayTariff(activeDayIndex, updates)}
            pricingMethod={currentDay.pricing_method}
            onChangePricingMethod={(m) => setDayPricingMethod(activeDayIndex, m)}
            actualKm={currentDay.actual_km}
            vehicleName={selectedVehicle?.name}
            onResetToVehicleDefaults={() => {
              if (selectedVehicle?.tariff) {
                setDayTariff(activeDayIndex, { ...selectedVehicle.tariff });
              }
            }}
          />

          {/* Full Tour Grand Summary Card */}
          <div className="glass-panel" style={{
            padding: '20px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Tour Package Breakdown
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>
                  {days.length} Days Tour Package
                </div>
              </div>

              <span className="badge badge-cached" style={{ fontSize: '0.82rem' }}>
                {tourTotals.total_tour_km.toFixed(1)} Total KM
              </span>
            </div>

            {/* Day by Day Accordion / Table */}
            <div style={{
              background: 'var(--card-inner-bg)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
            }}>
              {tourTotals.days.map((d, dIdx) => (
                <div
                  key={`sum-day-${dIdx}`}
                  onClick={() => setActiveDayIndex(dIdx)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: dIdx === activeDayIndex ? 'var(--bg-surface-elevated)' : 'transparent',
                    border: dIdx === activeDayIndex ? '1px solid var(--border-medium)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                      Day {d.day_number}: {d.actual_km.toFixed(1)} km
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Method {d.applied_method} • Halt: {d.overnight_halt || 'Same'}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{d.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Grand Total Price */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.05))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: '700' }}>TOTAL TOUR PACKAGE</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{days.length} Days vehicle rental + fuel + bata</div>
              </div>
              <div style={{
                fontSize: '1.9rem',
                fontWeight: '800',
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-heading)',
              }}>
                ₹{tourTotals.total_tour_cost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              onClick={handleSaveTour}
              disabled={isSaving}
              style={{ width: '100%', padding: '12px' }}
            >
              {isSaving ? (
                <Loader2 size={18} className="pulse-indicator" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <BookmarkPlus size={18} />
              )}
              <span>Save Multi-Day Tour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
