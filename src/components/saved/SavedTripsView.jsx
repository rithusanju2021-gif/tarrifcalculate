import React, { useState } from 'react';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import { useOneDayStore } from '../../store/useOneDayStore';
import { useMultiDayStore } from '../../store/useMultiDayStore';
import { useVehicleStore } from '../../store/useVehicleStore';
import {
  BookmarkCheck,
  Calendar,
  Car,
  Trash2,
  ExternalLink,
  FileDown,
  Share2,
  Check,
  Navigation,
  CalendarDays,
  Clock
} from 'lucide-react';
import apiClient from '../../api/client';

export default function SavedTripsView({ setActiveTab }) {
  const { oneDayTrips, multiDayTours, deleteOneDayTrip, deleteMultiDayTour } = useSavedTripsStore();
  const { setTripName, setIncludeReturn } = useOneDayStore();
  const { setTourName } = useMultiDayStore();
  const { selectVehicle } = useVehicleStore();

  const [activeSubTab, setActiveSubTab] = useState('oneday');
  const [copiedId, setCopiedId] = useState(null);

  const handleReopenOneDay = (trip) => {
    // Load into one day store
    useOneDayStore.setState({
      tripName: trip.name,
      stops: trip.stops || [],
      includeReturn: trip.include_return !== undefined ? trip.include_return : true,
      legs: trip.legs || [],
      totalKm: parseFloat(trip.actual_km) || 0,
      customTariff: trip.tariff_snapshot || null,
      pricingMethod: trip.pricing_method || null,
    });
    if (trip.vehicle_id) {
      selectVehicle(trip.vehicle_id);
    }
    setActiveTab('oneday');
  };

  const handleReopenMultiDay = (tour) => {
    // Load into multi day store
    useMultiDayStore.setState({
      tourName: tour.name,
      days: tour.days_data || [],
      activeDayIndex: 0,
    });
    if (tour.vehicle_id) {
      selectVehicle(tour.vehicle_id);
    }
    setActiveTab('multiday');
  };

  const handleCopyWhatsApp = async (item, isMulti) => {
    const payload = {
      title: item.name,
      vehicle_name: item.vehicle_name || 'Tourist Vehicle',
      total_km: parseFloat(item.actual_km || item.total_km || 0),
      total_cost: parseFloat(item.total_cost || 0),
      is_multiday: isMulti,
      details: isMulti ? { days: item.days_data } : { legs: item.legs, tariff: item.tariff_snapshot, applied_method: item.applied_method }
    };

    try {
      const res = await apiClient.post('/exports/whatsapp/', payload);
      if (res.data && res.data.text) {
        await navigator.clipboard.writeText(res.data.text);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch (e) {
      const text = `*RITHISH TOURS & TRAVELS*\n*Quotation:* ${item.name}\n*Total Cost:* ₹${parseFloat(item.total_cost).toFixed(2)}`;
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDownloadPdf = async (item, isMulti) => {
    const payload = {
      title: item.name,
      vehicle_name: item.vehicle_name || 'Tourist Vehicle',
      total_km: parseFloat(item.actual_km || item.total_km || 0),
      total_cost: parseFloat(item.total_cost || 0),
      is_multiday: isMulti,
      details: isMulti ? { days: item.days_data } : { legs: item.legs, tariff: item.tariff_snapshot, applied_method: item.applied_method }
    };

    try {
      const res = await apiClient.post('/exports/pdf/', payload, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RTT_${item.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Could not generate PDF. Please ensure backend is reachable.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 14px' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px',
      }}>
        <div>
          <span className="badge badge-cached" style={{ marginBottom: '4px' }}>
            SAVED ITINERARIES &amp; QUOTATIONS
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            Saved Itineraries &amp; Cost Breakdowns
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Reopen, edit, generate PDF reports, or share quotations on WhatsApp.
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
        }}>
          <button
            onClick={() => setActiveSubTab('oneday')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: '700',
              background: activeSubTab === 'oneday' ? 'var(--accent-gold)' : 'transparent',
              color: activeSubTab === 'oneday' ? '#000' : 'var(--text-secondary)',
            }}
          >
            <Navigation size={14} />
            <span>One-Day Trips ({oneDayTrips.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('multiday')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: '700',
              background: activeSubTab === 'multiday' ? 'var(--accent-gold)' : 'transparent',
              color: activeSubTab === 'multiday' ? '#000' : 'var(--text-secondary)',
            }}
          >
            <CalendarDays size={14} />
            <span>Multi-Day Tours ({multiDayTours.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSubTab === 'oneday' ? (
        oneDayTrips.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookmarkCheck size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '6px' }}>No Saved One-Day Trips</h3>
            <p style={{ fontSize: '0.85rem' }}>Use the One-Day Trip Calculator to plan an itinerary and click "Save One-Day Trip".</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
            {oneDayTrips.map((trip) => (
              <div key={trip.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)' }}>{trip.name}</h3>
                    <span className="badge badge-live">Method {trip.applied_method || 1}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-gold)', fontWeight: '600' }}>{trip.vehicle_name || 'Tourist Vehicle'}</span>
                    <span>•</span>
                    <span>{parseFloat(trip.actual_km).toFixed(1)} km</span>
                    <span>•</span>
                    <span>{trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>

                  <div style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>STOPS:</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {trip.stops?.map(s => s.name).join(' ➔ ') || 'Custom Route'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '8px 10px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: '700' }}>TOTAL COST:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                      ₹{parseFloat(trip.total_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleReopenOneDay(trip)}
                      style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                    >
                      <ExternalLink size={13} />
                      <span>Reopen &amp; Edit</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => handleDownloadPdf(trip, false)}
                        title="Download PDF"
                        style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '4px', background: 'var(--bg-surface-elevated)' }}
                      >
                        <FileDown size={15} />
                      </button>
                      <button
                        onClick={() => handleCopyWhatsApp(trip, false)}
                        title="Copy for WhatsApp"
                        style={{ color: copiedId === trip.id ? 'var(--accent-emerald)' : 'var(--text-secondary)', padding: '6px', borderRadius: '4px', background: 'var(--bg-surface-elevated)' }}
                      >
                        {copiedId === trip.id ? <Check size={15} /> : <Share2 size={15} />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete saved trip "${trip.name}"?`)) {
                            deleteOneDayTrip(trip.id);
                          }
                        }}
                        title="Delete"
                        style={{ color: '#fda4af', padding: '6px', borderRadius: '4px', background: 'var(--bg-surface-elevated)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        multiDayTours.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CalendarDays size={36} color="var(--accent-purple)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '6px' }}>No Saved Multi-Day Tours</h3>
            <p style={{ fontSize: '0.85rem' }}>Plan a multi-day itinerary in the Multi-Day Calculator and click "Save Multi-Day Tour".</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
            {multiDayTours.map((tour) => (
              <div key={tour.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)' }}>{tour.name}</h3>
                    <span className="badge badge-cached">{tour.days_count || tour.days_data?.length || 1} Days</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-gold)', fontWeight: '600' }}>{tour.vehicle_name || 'Tourist Vehicle'}</span>
                    <span>•</span>
                    <span>{parseFloat(tour.total_km).toFixed(1)} km</span>
                    <span>•</span>
                    <span>{tour.created_at ? new Date(tour.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>

                  <div style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    fontSize: '0.78rem',
                  }}>
                    {tour.days_data?.slice(0, 3).map((d, i) => (
                      <div key={i} style={{ color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        <strong>Day {d.day_number}:</strong> {d.actual_km.toFixed(1)} km (Halt: {d.overnight_halt || '—'})
                      </div>
                    ))}
                    {tour.days_data?.length > 3 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        + {tour.days_data.length - 3} more days...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '8px 10px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: '700' }}>TOTAL TOUR:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                      ₹{parseFloat(tour.total_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleReopenMultiDay(tour)}
                      style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                    >
                      <ExternalLink size={13} />
                      <span>Reopen &amp; Edit</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => handleDownloadPdf(tour, true)}
                        title="Download PDF"
                        style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '4px', background: 'var(--bg-surface-elevated)' }}
                      >
                        <FileDown size={15} />
                      </button>
                      <button
                        onClick={() => handleCopyWhatsApp(tour, true)}
                        title="Copy for WhatsApp"
                        style={{ color: copiedId === tour.id ? 'var(--accent-emerald)' : 'var(--text-secondary)', padding: '6px', borderRadius: '4px', background: 'var(--bg-surface-elevated)' }}
                      >
                        {copiedId === tour.id ? <Check size={15} /> : <Share2 size={15} />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete saved tour "${tour.name}"?`)) {
                            deleteMultiDayTour(tour.id);
                          }
                        }}
                        title="Delete"
                        style={{ color: '#fda4af', padding: '6px', borderRadius: '4px', background: 'var(--bg-surface-elevated)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
