import { create } from 'zustand';
import apiClient, { directOsrmRoadDistance } from '../api/client';
import { calculateDailyRental } from './pricingEngine';

const INITIAL_ONE_DAY_STOPS = [
  { id: 'stop-1', name: 'Chennai Central', lat: 13.0827, lng: 80.2707, manual_km: null },
  { id: 'stop-2', name: 'Mahabalipuram', lat: 12.6269, lng: 80.1927, manual_km: null },
  { id: 'stop-3', name: 'Kanchipuram', lat: 12.8342, lng: 79.7036, manual_km: null },
];

function loadSavedOneDay() {
  try {
    const raw = localStorage.getItem('rtt_oneday_active');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export const useOneDayStore = create((set, get) => {
  const saved = loadSavedOneDay();

  return {
    tripName: saved?.tripName || 'Chennai Sightseeing & Temple Tour',
    stops: saved?.stops || INITIAL_ONE_DAY_STOPS,
    includeReturn: saved?.includeReturn !== undefined ? saved.includeReturn : true,
    legs: saved?.legs || [],
    totalKm: saved?.totalKm || 0,
    totalDurationMin: saved?.totalDurationMin || 0,
    isCalculatingDistance: false,
    distanceError: null,
    
    // Per-trip tariff overrides (if null, uses selected vehicle tariff)
    customTariff: saved?.customTariff || null,
    pricingMethod: saved?.pricingMethod || null, // null for auto, 1 for Method 1, 2 for Method 2

    setTripName: (name) => {
      set({ tripName: name });
      get().persistState();
    },

    setIncludeReturn: (include) => {
      set({ includeReturn: include });
      get().calculateDistances();
      get().persistState();
    },

    addStop: (location) => {
      const { stops } = get();
      const newStop = {
        id: `stop-${Date.now()}`,
        name: location.name || location.display_name,
        lat: location.lat,
        lng: location.lng,
        manual_km: null,
      };
      set({ stops: [...stops, newStop] });
      get().calculateDistances();
      get().persistState();
    },

    removeStop: (stopId) => {
      const { stops } = get();
      if (stops.length <= 2) {
        alert('A trip requires at least a start location and one destination.');
        return;
      }
      const filtered = stops.filter((s) => s.id !== stopId);
      set({ stops: filtered });
      get().calculateDistances();
      get().persistState();
    },

    reorderStops: (startIndex, endIndex) => {
      const { stops } = get();
      const result = Array.from(stops);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      set({ stops: result });
      get().calculateDistances();
      get().persistState();
    },

    setManualKm: (stopIndex, kmValue) => {
      const { stops } = get();
      const updated = stops.map((s, idx) => {
        if (idx === stopIndex) {
          const val = kmValue === '' ? null : parseFloat(kmValue);
          return { ...s, manual_km: val };
        }
        return s;
      });
      set({ stops: updated });
      get().calculateDistances();
      get().persistState();
    },

    setCustomTariff: (tariffUpdates) => {
      const { customTariff } = get();
      set({
        customTariff: {
          ...(customTariff || {}),
          ...tariffUpdates,
        }
      });
      get().persistState();
    },

    setPricingMethod: (method) => {
      set({ pricingMethod: method });
      get().persistState();
    },

    resetCustomTariff: () => {
      set({ customTariff: null, pricingMethod: null });
      get().persistState();
    },

    // Calculates real road distances between consecutive stops and return leg
    calculateDistances: async () => {
      const { stops, includeReturn } = get();
      if (stops.length < 2) return;

      set({ isCalculatingDistance: true, distanceError: null });

      try {
        // Try backend multi-route endpoint first
        const resp = await apiClient.post('/routing/multi/', {
          stops,
          include_return: includeReturn,
        });

        if (resp.data && resp.data.legs) {
          set({
            legs: resp.data.legs,
            totalKm: resp.data.total_km,
            totalDurationMin: resp.data.total_duration_min,
            isCalculatingDistance: false,
          });
          get().persistState();
          return;
        }
      } catch (err) {
        console.warn('Backend routing unavailable, calculating road distance directly via OSRM fallback...');
      }

      // Direct client-side OSRM calculation fallback
      try {
        const pairs = [];
        for (let i = 0; i < stops.length - 1; i++) {
          pairs.push({ from: stops[i], to: stops[i + 1] });
        }
        if (includeReturn && stops.length >= 2) {
          pairs.push({ from: stops[stops.length - 1], to: stops[0] });
        }

        const calculatedLegs = [];
        let cumKm = 0;
        let cumMins = 0;

        for (const pair of pairs) {
          // If manual km is entered on the destination stop
          if (pair.to.manual_km !== null && pair.to.manual_km >= 0) {
            const manualVal = parseFloat(pair.to.manual_km);
            const estTime = Math.round(manualVal * 1.5);
            calculatedLegs.push({
              from: pair.from.name,
              to: pair.to.name,
              distance_km: manualVal,
              duration_min: estTime,
              source: 'MANUAL',
              success: true,
            });
            cumKm += manualVal;
            cumMins += estTime;
            continue;
          }

          const osrmRes = await directOsrmRoadDistance(pair.from.lat, pair.from.lng, pair.to.lat, pair.to.lng);
          if (osrmRes) {
            calculatedLegs.push({
              from: pair.from.name,
              to: pair.to.name,
              distance_km: osrmRes.distance_km,
              duration_min: osrmRes.duration_min,
              source: 'LIVE',
              success: true,
            });
            cumKm += osrmRes.distance_km;
            cumMins += osrmRes.duration_min;
          } else {
            // Routing failed — never invent a fake distance
            calculatedLegs.push({
              from: pair.from.name,
              to: pair.to.name,
              distance_km: 0,
              duration_min: 0,
              source: 'UNAVAILABLE',
              success: false,
              error: 'Routing unavailable. Please enter manual distance.',
            });
          }
        }

        set({
          legs: calculatedLegs,
          totalKm: Math.round(cumKm * 100) / 100,
          totalDurationMin: Math.round(cumMins * 10) / 10,
          isCalculatingDistance: false,
        });
        get().persistState();
      } catch (clientErr) {
        set({
          isCalculatingDistance: false,
          distanceError: 'Could not connect to road distance service. Please check your connection or enter manual km.',
        });
      }
    },

    getCalculatedCost: (activeVehicleTariff) => {
      const { totalKm, customTariff, pricingMethod } = get();
      const tariff = {
        day_rent: customTariff?.day_rent ?? activeVehicleTariff?.day_rent ?? 0,
        fuel_cost_per_km: customTariff?.fuel_cost_per_km ?? activeVehicleTariff?.fuel_cost_per_km ?? 0,
        included_km: customTariff?.included_km ?? activeVehicleTariff?.included_km ?? 250,
        km_rate: customTariff?.km_rate ?? activeVehicleTariff?.km_rate ?? 0,
        driver_bata: customTariff?.driver_bata ?? activeVehicleTariff?.driver_bata ?? 0,
      };

      return {
        tariff,
        ...calculateDailyRental({
          actual_km: totalKm,
          ...tariff,
          pricing_method: pricingMethod,
        }),
      };
    },

    persistState: () => {
      const { tripName, stops, includeReturn, legs, totalKm, totalDurationMin, customTariff, pricingMethod } = get();
      localStorage.setItem('rtt_oneday_active', JSON.stringify({
        tripName,
        stops,
        includeReturn,
        legs,
        totalKm,
        totalDurationMin,
        customTariff,
        pricingMethod,
      }));
    }
  };
});
