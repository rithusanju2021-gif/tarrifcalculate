import React, { useState } from 'react';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';
import { useVehicleStore } from '../../store/useVehicleStore';
import {
  Download,
  Upload,
  Trash2,
  Database,
  CloudCheck,
  Server,
  ShieldCheck,
  AlertTriangle,
  Check,
  RotateCcw
} from 'lucide-react';
import apiClient from '../../api/client';

export default function DataSettings() {
  const { clearAllData, fetchSavedTrips } = useSavedTripsStore();
  const { vehicles, resetDefaultVehicles, fetchVehicles } = useVehicleStore();

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const showMsg = (msg, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleExportBackup = async () => {
    try {
      // Try backend backup endpoint
      const res = await apiClient.get('/exports/backup/');
      if (res.data) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `RTT_Backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showMsg('Full database backup exported successfully as JSON!');
        return;
      }
    } catch (e) {
      // Fallback local export
      const localData = {
        app: 'Rithish Tours & Travels Vehicle Calculator',
        version: '1.0',
        exported_at: new Date().toISOString(),
        vehicles: JSON.parse(localStorage.getItem('rtt_vehicles') || '[]'),
        oneday_trips: JSON.parse(localStorage.getItem('rtt_saved_oneday') || '[]'),
        multiday_tours: JSON.parse(localStorage.getItem('rtt_saved_multiday') || '[]'),
      };
      const jsonStr = JSON.stringify(localData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RTT_Local_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showMsg('Local JSON backup exported successfully!');
    }
  };

  const handleImportBackup = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.vehicles && Array.isArray(parsed.vehicles)) {
          localStorage.setItem('rtt_vehicles', JSON.stringify(parsed.vehicles));
        }
        if (parsed.oneday_trips && Array.isArray(parsed.oneday_trips)) {
          localStorage.setItem('rtt_saved_oneday', JSON.stringify(parsed.oneday_trips));
        }
        if (parsed.multiday_tours && Array.isArray(parsed.multiday_tours)) {
          localStorage.setItem('rtt_saved_multiday', JSON.stringify(parsed.multiday_tours));
        }

        // Try syncing to backend
        try {
          await apiClient.post('/exports/restore/', parsed);
        } catch (apiErr) {}

        await fetchVehicles();
        await fetchSavedTrips();
        showMsg('Backup restored successfully! All vehicles and itineraries updated.');
      } catch (err) {
        showMsg('Failed to parse JSON backup file.', true);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAll = async () => {
    await clearAllData();
    setIsConfirmingClear(false);
    showMsg('All saved itineraries and tour calculations have been cleared.');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 14px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-cached" style={{ marginBottom: '4px' }}>
          DATABASE &amp; SYSTEM SETTINGS
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
          Backup, Export &amp; Data Persistence
        </h2>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage your persistent vehicle tariffs, saved tour itineraries, and offline-mirroring options.
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          background: isError ? 'var(--accent-rose-subtle)' : 'var(--accent-emerald-subtle)',
          color: isError ? '#fda4af' : '#34d399',
          border: `1px solid ${isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: '600',
        }}>
          {isError ? <AlertTriangle size={18} /> : <Check size={18} />}
          <span>{message}</span>
        </div>
      )}

      {/* Cloud & ₹0 Hosting Status Card */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Server size={20} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Architecture &amp; Free Hosting Targets</h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FRONTEND HOSTING</div>
            <div style={{ fontWeight: '700', color: 'var(--text-heading)', fontSize: '0.9rem' }}>Vercel Free Tier</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>100 GB/mo • Never sleeps • ₹0</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BACKEND SERVICE</div>
            <div style={{ fontWeight: '700', color: 'var(--text-heading)', fontSize: '0.9rem' }}>Render Free + Uptime Ping</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>Django 5 REST API • ₹0</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DATABASE ENGINE</div>
            <div style={{ fontWeight: '700', color: 'var(--text-heading)', fontSize: '0.9rem' }}>Aiven MySQL 8 Free</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)' }}>1 GB Persistent • Never deleted • ₹0</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.06)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          <strong>Dual-Layer Data Resilience:</strong> Your vehicle rates and tour itineraries are saved in both the persistent cloud database and mirrored in your browser's local storage. You can refresh or reopen this application on any device at any time without losing any work.
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px' }}>
          JSON Backup &amp; Migration
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '6px' }}>Export Backup File</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Download a complete JSON snapshot containing all vehicles, tariffs, one-day calculations, and multi-day tours.
            </div>
            <button
              onClick={handleExportBackup}
              className="btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <Download size={16} />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '6px' }}>Restore From Backup</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Import a previously exported JSON backup file to restore all vehicle tariffs and saved itineraries.
            </div>
            <label className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>
              <Upload size={16} />
              <span>Select Backup File (.json)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone: Clear All Data */}
      <div className="glass-panel" style={{
        padding: '20px',
        border: '1px solid rgba(244, 63, 94, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fda4af', marginBottom: '10px' }}>
          <AlertTriangle size={18} />
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Danger Zone</h3>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Clear all saved itineraries, multi-day tours, and cached road distances. Vehicles and base tariffs will remain intact.
        </div>

        {!isConfirmingClear ? (
          <button
            onClick={() => setIsConfirmingClear(true)}
            className="btn-danger"
          >
            <Trash2 size={15} />
            <span>Clear All Saved Itineraries</span>
          </button>
        ) : (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fda4af', marginBottom: '10px' }}>
              Are you sure you want to clear all saved calculations and route distances?
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleClearAll}
                style={{
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  fontWeight: '700',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                }}
              >
                Yes, Delete All Saved Calculations
              </button>
              <button
                onClick={() => setIsConfirmingClear(false)}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
