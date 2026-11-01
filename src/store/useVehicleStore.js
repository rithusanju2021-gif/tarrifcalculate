import { create } from 'zustand';
import apiClient from '../api/client';

const INITIAL_VEHICLES = [
  {
    id: 1,
    name: 'Swift Dzire',
    vehicle_type: 'Sedan',
    seating_capacity: 4,
    is_active: true,
    tariff: {
      day_rent: 2200,
      fuel_cost_per_km: 11,
      included_km: 250,
      km_rate: 13,
      driver_bata: 400,
      notes: 'Comfortable 4-passenger AC sedan'
    }
  },
  {
    id: 2,
    name: 'Toyota Etios',
    vehicle_type: 'Sedan',
    seating_capacity: 4,
    is_active: true,
    tariff: {
      day_rent: 2400,
      fuel_cost_per_km: 12,
      included_km: 250,
      km_rate: 14,
      driver_bata: 400,
      notes: 'Spacious boot space for luggage'
    }
  },
  {
    id: 3,
    name: 'Maruti Ertiga',
    vehicle_type: 'SUV',
    seating_capacity: 6,
    is_active: true,
    tariff: {
      day_rent: 3000,
      fuel_cost_per_km: 14,
      included_km: 250,
      km_rate: 16,
      driver_bata: 500,
      notes: 'Best for 5-6 family members'
    }
  },
  {
    id: 4,
    name: 'Toyota Innova',
    vehicle_type: 'SUV',
    seating_capacity: 7,
    is_active: true,
    tariff: {
      day_rent: 3800,
      fuel_cost_per_km: 16,
      included_km: 300,
      km_rate: 19,
      driver_bata: 500,
      notes: 'Reliable long-distance touring vehicle'
    }
  },
  {
    id: 5,
    name: 'Toyota Innova Crysta',
    vehicle_type: 'Luxury SUV',
    seating_capacity: 7,
    is_active: true,
    tariff: {
      day_rent: 4500,
      fuel_cost_per_km: 18,
      included_km: 300,
      km_rate: 22,
      driver_bata: 600,
      notes: 'Premium luxury captain seats'
    }
  },
  {
    id: 6,
    name: 'Tempo Traveller 12-seater',
    vehicle_type: 'Van',
    seating_capacity: 12,
    is_active: true,
    tariff: {
      day_rent: 5500,
      fuel_cost_per_km: 22,
      included_km: 300,
      km_rate: 26,
      driver_bata: 700,
      notes: 'Group touring & pilgrimage trips'
    }
  },
  {
    id: 7,
    name: 'Tempo Traveller 17-seater',
    vehicle_type: 'Minibus',
    seating_capacity: 17,
    is_active: true,
    tariff: {
      day_rent: 6500,
      fuel_cost_per_km: 25,
      included_km: 300,
      km_rate: 30,
      driver_bata: 800,
      notes: 'Large group package vehicle'
    }
  },
  {
    id: 8,
    name: 'Force Urbania',
    vehicle_type: 'Luxury Minibus',
    seating_capacity: 12,
    is_active: true,
    tariff: {
      day_rent: 7500,
      fuel_cost_per_km: 28,
      included_km: 300,
      km_rate: 34,
      driver_bata: 900,
      notes: 'Ultra luxury panoramic touring van'
    }
  }
];

function loadLocalVehicles() {
  try {
    const raw = localStorage.getItem('rtt_vehicles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load vehicles from localStorage:', e);
  }
  return INITIAL_VEHICLES;
}

export const useVehicleStore = create((set, get) => ({
  vehicles: loadLocalVehicles(),
  selectedVehicleId: 5, // Innova Crysta default
  isLoading: false,

  fetchVehicles: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/vehicles/?all=true');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((v) => ({
          id: v.id,
          name: v.name,
          vehicle_type: v.vehicle_type,
          seating_capacity: parseInt(v.seating_capacity, 10) || 4,
          is_active: v.is_active,
          tariff: {
            day_rent: parseFloat(v.tariff?.day_rent) || 0,
            fuel_cost_per_km: parseFloat(v.tariff?.fuel_cost_per_km) || 0,
            included_km: parseFloat(v.tariff?.included_km) || 250,
            km_rate: parseFloat(v.tariff?.km_rate) || 0,
            driver_bata: parseFloat(v.tariff?.driver_bata) || 0,
            notes: v.tariff?.notes || ''
          }
        }));
        set({ vehicles: formatted });
        localStorage.setItem('rtt_vehicles', JSON.stringify(formatted));
      }
    } catch (err) {
      // Offline fallback: keep localStorage data
      console.warn('Backend unavailable, using local vehicles:', err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  selectVehicle: (id) => {
    set({ selectedVehicleId: id });
  },

  getSelectedVehicle: () => {
    const { vehicles, selectedVehicleId } = get();
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  },

  updateVehicleTariff: async (vehicleId, updatedTariff) => {
    const { vehicles } = get();
    const updated = vehicles.map((v) => {
      if (v.id === vehicleId) {
        return {
          ...v,
          tariff: {
            ...v.tariff,
            ...updatedTariff
          }
        };
      }
      return v;
    });

    set({ vehicles: updated });
    localStorage.setItem('rtt_vehicles', JSON.stringify(updated));

    // Async sync to backend
    try {
      await apiClient.put(`/vehicles/${vehicleId}/tariff/`, updatedTariff);
    } catch (e) {
      // Local changes are already safe
    }
  },

  addVehicle: async (newVehicleData) => {
    const { vehicles } = get();
    const newId = Date.now();
    const vehicleObj = {
      id: newId,
      name: newVehicleData.name,
      vehicle_type: newVehicleData.vehicle_type || 'Sedan',
      seating_capacity: parseInt(newVehicleData.seating_capacity, 10) || 4,
      is_active: true,
      tariff: {
        day_rent: parseFloat(newVehicleData.day_rent) || 0,
        fuel_cost_per_km: parseFloat(newVehicleData.fuel_cost_per_km) || 0,
        included_km: parseFloat(newVehicleData.included_km) || 250,
        km_rate: parseFloat(newVehicleData.km_rate) || 0,
        driver_bata: parseFloat(newVehicleData.driver_bata) || 0,
        notes: newVehicleData.notes || '',
      }
    };

    const nextVehicles = [...vehicles, vehicleObj];
    set({ vehicles: nextVehicles, selectedVehicleId: newId });
    localStorage.setItem('rtt_vehicles', JSON.stringify(nextVehicles));

    // Try creating on backend
    try {
      const res = await apiClient.post('/vehicles/', {
        name: vehicleObj.name,
        vehicle_type: vehicleObj.vehicle_type,
        seating_capacity: vehicleObj.seating_capacity,
        day_rent: vehicleObj.tariff.day_rent,
        fuel_cost_per_km: vehicleObj.tariff.fuel_cost_per_km,
        included_km: vehicleObj.tariff.included_km,
        km_rate: vehicleObj.tariff.km_rate,
        driver_bata: vehicleObj.tariff.driver_bata,
      });
      if (res.data && res.data.id) {
        // Update local temporary id with backend id
        const synced = nextVehicles.map(v => v.id === newId ? { ...v, id: res.data.id } : v);
        set({ vehicles: synced, selectedVehicleId: res.data.id });
        localStorage.setItem('rtt_vehicles', JSON.stringify(synced));
      }
    } catch (e) {
      console.warn('Backend sync failed, saved locally:', e);
    }
  },

  toggleVehicleActive: async (vehicleId) => {
    const { vehicles } = get();
    const nextVehicles = vehicles.map(v => v.id === vehicleId ? { ...v, is_active: !v.is_active } : v);
    set({ vehicles: nextVehicles });
    localStorage.setItem('rtt_vehicles', JSON.stringify(nextVehicles));

    try {
      await apiClient.patch(`/vehicles/${vehicleId}/toggle_active/`);
    } catch (e) {}
  },

  deleteVehicle: async (vehicleId) => {
    const { vehicles, selectedVehicleId } = get();
    const nextVehicles = vehicles.filter(v => v.id !== vehicleId);
    let nextSelected = selectedVehicleId;
    if (selectedVehicleId === vehicleId && nextVehicles.length > 0) {
      nextSelected = nextVehicles[0].id;
    }
    set({ vehicles: nextVehicles, selectedVehicleId: nextSelected });
    localStorage.setItem('rtt_vehicles', JSON.stringify(nextVehicles));

    try {
      await apiClient.delete(`/vehicles/${vehicleId}/`);
    } catch (e) {}
  },

  resetDefaultVehicles: () => {
    set({ vehicles: INITIAL_VEHICLES, selectedVehicleId: 5 });
    localStorage.setItem('rtt_vehicles', JSON.stringify(INITIAL_VEHICLES));
  }
}));
