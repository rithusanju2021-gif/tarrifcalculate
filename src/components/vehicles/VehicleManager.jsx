import React, { useState } from 'react';
import { useVehicleStore } from '../../store/useVehicleStore';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Users,
  Settings,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

function fmtCurrency(val) {
  const n = parseFloat(val);
  return isNaN(n) ? '0.00' : n.toFixed(2);
}

function fmtKm(val) {
  const n = parseFloat(val);
  return isNaN(n) ? '250' : n.toString();
}

export default function VehicleManager() {
  const {
    vehicles,
    addVehicle,
    updateVehicleTariff,
    toggleVehicleActive,
    deleteVehicle,
    resetDefaultVehicles
  } = useVehicleStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form states for Add Vehicle
  const [formData, setFormData] = useState({
    name: '',
    vehicle_type: 'Sedan',
    seating_capacity: 4,
    day_rent: 2500,
    fuel_cost_per_km: 12,
    included_km: 250,
    km_rate: 15,
    driver_bata: 400,
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      vehicle_type: 'Sedan',
      seating_capacity: 4,
      day_rent: 2500,
      fuel_cost_per_km: 12,
      included_km: 250,
      km_rate: 15,
      driver_bata: 400,
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a vehicle name.');
      return;
    }
    await addVehicle(formData);
    setIsAddModalOpen(false);
  };

  const handleUpdateTariff = async (e) => {
    e.preventDefault();
    if (!editingVehicle) return;
    await updateVehicleTariff(editingVehicle.id, editingVehicle.tariff);
    setEditingVehicle(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 14px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px',
      }}>
        <div>
          <span className="badge badge-live" style={{ marginBottom: '4px' }}>
            FLEET &amp; TARIFF MANAGEMENT
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
            Vehicle Rental Rates &amp; Distance Limits
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configure individual rental rates, fuel costs, included limits and driver bata for each vehicle.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={resetDefaultVehicles}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            title="Reset to default fleet tariffs"
          >
            <RotateCcw size={15} />
            <span>Reset Fleet</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ padding: '9px 16px' }}
          >
            <Plus size={18} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid or Empty State */}
      {(!vehicles || vehicles.length === 0) ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Car size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '6px' }}>No Vehicles Found</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Click "Reset Fleet" to load the default 8 South India tourist vehicles with pre-configured tariffs.</p>
          <button onClick={resetDefaultVehicles} className="btn-primary" style={{ padding: '8px 18px' }}>
            <RotateCcw size={16} />
            <span>Load Default Fleet</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {vehicles.map((v) => {
            const t = v.tariff || {};

            return (
            <div
              key={v.id}
              className="glass-panel"
              style={{
                padding: '16px',
                opacity: v.is_active ? 1 : 0.6,
                borderColor: v.is_active ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Vehicle Title & Active Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                      {v.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)', fontWeight: '600' }}>
                        {v.vehicle_type}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Users size={12} />
                        {v.seating_capacity} Seater
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVehicleActive(v.id)}
                    title={v.is_active ? 'Disable vehicle' : 'Enable vehicle'}
                    style={{ color: v.is_active ? 'var(--accent-emerald)' : 'var(--text-muted)' }}
                  >
                    {v.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                  </button>
                </div>

                {/* 5 Tariff Values Grid */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '14px',
                  fontSize: '0.82rem',
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DAY RENT</div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{fmtCurrency(t.day_rent)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>FUEL COST / KM</div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{fmtCurrency(t.fuel_cost_per_km)} / km</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-gold)', fontSize: '0.7rem' }}>INCLUDED KM</div>
                    <div style={{ fontWeight: '800', color: 'var(--text-gold)' }}>{fmtKm(t.included_km)} km / day</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>KM RATE (METHOD 2)</div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{fmtCurrency(t.km_rate)} / km</div>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DRIVER BATA</div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{fmtCurrency(t.driver_bata)} / day</div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const copy = JSON.parse(JSON.stringify(v));
                    copy.tariff = copy.tariff || {
                      day_rent: 0,
                      fuel_cost_per_km: 0,
                      included_km: 250,
                      km_rate: 0,
                      driver_bata: 0,
                      notes: '',
                    };
                    setEditingVehicle(copy);
                  }}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  <Edit2 size={13} />
                  <span>Edit Tariff</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete vehicle "${v.name}"?`)) {
                      deleteVehicle(v.id);
                    }
                  }}
                  style={{ color: '#fda4af', padding: '6px' }}
                  title="Delete Vehicle"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80,
          padding: '16px',
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-surface-elevated)',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Add New Tourist Vehicle</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label-text">Vehicle Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Force Urbania 12-Seater"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label-text">Vehicle Category</label>
                  <select
                    className="input-field"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury SUV">Luxury SUV</option>
                    <option value="Van">Van</option>
                    <option value="Minibus">Minibus</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>

                <div>
                  <label className="label-text">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="input-field"
                    value={formData.seating_capacity}
                    onChange={(e) => setFormData({ ...formData, seating_capacity: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: '12px' }}>
                <span className="label-text" style={{ color: 'var(--text-gold)', marginBottom: '10px' }}>
                  Default Tariff Configuration (Editable at any time)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label-text">Day Rent (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      className="input-field"
                      value={formData.day_rent}
                      onChange={(e) => setFormData({ ...formData, day_rent: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-text">Fuel Cost / KM (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="input-field"
                      value={formData.fuel_cost_per_km}
                      onChange={(e) => setFormData({ ...formData, fuel_cost_per_km: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-text">Included KM Limit</label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      className="input-field"
                      value={formData.included_km}
                      onChange={(e) => setFormData({ ...formData, included_km: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-text">KM Rate (Method 2) (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="input-field"
                      value={formData.km_rate}
                      onChange={(e) => setFormData({ ...formData, km_rate: e.target.value })}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label-text">Driver Bata (₹ / Day)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      className="input-field"
                      value={formData.driver_bata}
                      onChange={(e) => setFormData({ ...formData, driver_bata: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save New Vehicle
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Tariff Modal */}
      {editingVehicle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80,
          padding: '16px',
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-surface-elevated)',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Edit Tariff for {editingVehicle.name}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configure 5 editable tariff settings</div>
              </div>
              <button onClick={() => setEditingVehicle(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTariff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label-text">Day Rent (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="input-field"
                    value={editingVehicle.tariff.day_rent}
                    onChange={(e) => setEditingVehicle({
                      ...editingVehicle,
                      tariff: { ...editingVehicle.tariff, day_rent: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="label-text">Fuel Cost / KM (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-field"
                    value={editingVehicle.tariff.fuel_cost_per_km}
                    onChange={(e) => setEditingVehicle({
                      ...editingVehicle,
                      tariff: { ...editingVehicle.tariff, fuel_cost_per_km: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <label className="label-text" style={{ color: 'var(--text-gold)' }}>Included KM Limit</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    className="input-field"
                    value={editingVehicle.tariff.included_km}
                    onChange={(e) => setEditingVehicle({
                      ...editingVehicle,
                      tariff: { ...editingVehicle.tariff, included_km: parseFloat(e.target.value) || 250 }
                    })}
                  />
                </div>
                <div>
                  <label className="label-text">KM Rate (Method 2) (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="input-field"
                    value={editingVehicle.tariff.km_rate}
                    onChange={(e) => setEditingVehicle({
                      ...editingVehicle,
                      tariff: { ...editingVehicle.tariff, km_rate: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label-text">Driver Bata (₹ / Day)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="input-field"
                    value={editingVehicle.tariff.driver_bata}
                    onChange={(e) => setEditingVehicle({
                      ...editingVehicle,
                      tariff: { ...editingVehicle.tariff, driver_bata: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditingVehicle(null)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
