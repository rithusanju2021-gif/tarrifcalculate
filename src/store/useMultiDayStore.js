import { create } from 'zustand';
import apiClient, { directOsrmRoadDistance } from '../api/client';
import { calculateDailyRental, calculateMultiDayTour } from './pricingEngine';

const INITIAL_DAYS = [
  {
    day_number: 1,
    title: 'Chennai to Mahabalipuram & Pondicherry',
    overnight_halt: 'Pondicherry',
    stops: [
      { id: 'd1-s1', name: 'Chennai Central', lat: 13.0827, lng: 80.2707, manual_km: null },
      { id: 'd1-s2', name: 'Mahabalipuram Shore Temple', lat: 12.6269, lng: 80.1927, manual_km: null },
      { id: 'd1-s3', name: 'Puducherry (Pondicherry)', lat: 11.9416, lng: 79.8083, manual_km: null },
    ],
    legs: [],
    actual_km: 0,
    duration_min: 0,
    pricing_method: null, // null (auto), 1, or 2
    customTariff: null,
  },
  {
    day_number: 2,
    title: 'Pondicherry to Chidambaram & Thanjavur',
    overnight_halt: 'Thanjavur',
    stops: [
      { id: 'd2-s1', name: 'Puducherry (Pondicherry)', lat: 11.9416, lng: 79.8083, manual_km: null },
      { id: 'd2-s2', name: 'Chidambaram Nataraja Temple', lat: 11.3992, lng: 79.6935, manual_km: null },
      { id: 'd2-s3', name: 'Thanjavur (Brihadeeswara)', lat: 10.7870, lng: 79.1378, manual_km: null },
    ],
    legs: [],
    actual_km: 0,
    duration_min: 0,
    pricing_method: null,
    customTariff: null,
  },
  {
    day_number: 3,
    title: 'Thanjavur to Trichy & Madurai',
    overnight_halt: 'Madurai',
    stops: [
      { id: 'd3-s1', name: 'Thanjavur (Brihadeeswara)', lat: 10.7870, lng: 79.1378, manual_km: null },
      { id: 'd3-s2', name: 'Trichy (Rockfort & Srirangam)', lat: 10.7905, lng: 78.7047, manual_km: null },
      { id: 'd3-s3', name: 'Madurai (Meenakshi Amman)', lat: 9.9252, lng: 78.1198, manual_km: null },
    ],
    legs: [],
    actual_km: 0,
    duration_min: 0,
    pricing_method: null,
    customTariff: null,
  }
];

function loadSavedMultiDay() {
  try {
    const raw = localStorage.getItem('rtt_multiday_active');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export const useMultiDayStore = create((set, get) => {
  const saved = loadSavedMultiDay();

  return {
    tourName: saved?.tourName || 'Grand South India Heritage & Temple Tour (3 Days)',
    days: saved?.days || INITIAL_DAYS,
    activeDayIndex: 0,
    isCalculating: false,

    setTourName: (name) => {
      set({ tourName: name });
      get().persistState();
    },

    setActiveDayIndex: (index) => {
      set({ activeDayIndex: index });
    },

    addDay: () => {
      const { days } = get();
      const lastDay = days[days.length - 1];
      const nextNum = days.length + 1;
      const lastHalt = lastDay?.overnight_halt || lastDay?.stops[lastDay.stops.length - 1]?.name || 'Next Destination';

      const newDay = {
        day_number: nextNum,
        title: `Day ${nextNum}: ${lastHalt} & Sightseeing`,
        overnight_halt: '',
        stops: [
          { id: `d${nextNum}-s1`, name: lastHalt, lat: lastDay?.stops[lastDay.stops.length - 1]?.lat || 13.0827, lng: lastDay?.stops[lastDay.stops.length - 1]?.lng || 80.2707, manual_km: null }
        ],
        legs: [],
        actual_km: 0,
        duration_min: 0,
        pricing_method: null,
        customTariff: null,
      };

      set({ days: [...days, newDay], activeDayIndex: days.length });
      get().persistState();
    },

    removeDay: (dayIndex) => {
      const { days, activeDayIndex } = get();
      if (days.length <= 1) {
        alert('A tour package must have at least one day.');
        return;
      }
      const updated = days
        .filter((_, idx) => idx !== dayIndex)
        .map((d, idx) => ({ ...d, day_number: idx + 1 }));

      const nextActive = Math.min(activeDayIndex, updated.length - 1);
      set({ days: updated, activeDayIndex: nextActive });
      get().persistState();
    },

    updateDayProperty: (dayIndex, property, value) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          return { ...d, [property]: value };
        }
        return d;
      });
      set({ days: updated });
      get().persistState();
    },

    addStopToDay: (dayIndex, location) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          const newStop = {
            id: `d${dayIndex + 1}-s-${Date.now()}`,
            name: location.name || location.display_name,
            lat: location.lat,
            lng: location.lng,
            manual_km: null,
          };
          return { ...d, stops: [...d.stops, newStop] };
        }
        return d;
      });
      set({ days: updated });
      get().calculateDayDistances(dayIndex);
      get().persistState();
    },

    removeStopFromDay: (dayIndex, stopId) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          return { ...d, stops: d.stops.filter((s) => s.id !== stopId) };
        }
        return d;
      });
      set({ days: updated });
      get().calculateDayDistances(dayIndex);
      get().persistState();
    },

    reorderStopsInDay: (dayIndex, startIndex, endIndex) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          const stopsCopy = Array.from(d.stops);
          const [removed] = stopsCopy.splice(startIndex, 1);
          stopsCopy.splice(endIndex, 0, removed);
          return { ...d, stops: stopsCopy };
        }
        return d;
      });
      set({ days: updated });
      get().calculateDayDistances(dayIndex);
      get().persistState();
    },

    setManualKmForDayStop: (dayIndex, stopIndex, kmValue) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          const updatedStops = d.stops.map((s, sIdx) => {
            if (sIdx === stopIndex) {
              return { ...s, manual_km: kmValue === '' ? null : parseFloat(kmValue) };
            }
            return s;
          });
          return { ...d, stops: updatedStops };
        }
        return d;
      });
      set({ days: updated });
      get().calculateDayDistances(dayIndex);
      get().persistState();
    },

    setDayTariff: (dayIndex, tariffUpdates) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          return {
            ...d,
            customTariff: {
              ...(d.customTariff || {}),
              ...tariffUpdates,
            }
          };
        }
        return d;
      });
      set({ days: updated });
      get().persistState();
    },

    setDayPricingMethod: (dayIndex, method) => {
      const { days } = get();
      const updated = days.map((d, idx) => {
        if (idx === dayIndex) {
          return { ...d, pricing_method: method };
        }
        return d;
      });
      set({ days: updated });
      get().persistState();
    },

    calculateDayDistances: async (dayIndex) => {
      const { days } = get();
      const day = days[dayIndex];
      if (!day || day.stops.length < 2) {
        if (day && day.stops.length < 2) {
          const updated = days.map((d, idx) => idx === dayIndex ? { ...d, legs: [], actual_km: 0, duration_min: 0 } : d);
          set({ days: updated });
        }
        return;
      }

      set({ isCalculating: true });

      try {
        // Try backend multi route
        const resp = await apiClient.post('/routing/multi/', {
          stops: day.stops,
          include_return: false, // In multi-day, return is usually not applied daily unless roundtrip
        });

        if (resp.data && resp.data.legs) {
          const updated = days.map((d, idx) => {
            if (idx === dayIndex) {
              return {
                ...d,
                legs: resp.data.legs,
                actual_km: resp.data.total_km,
                duration_min: resp.data.total_duration_min,
              };
            }
            return d;
          });
          set({ days: updated, isCalculating: false });
          get().persistState();
          return;
        }
      } catch (e) {}

      // Direct client-side OSRM fallback
      try {
        const pairs = [];
        for (let i = 0; i < day.stops.length - 1; i++) {
          pairs.push({ from: day.stops[i], to: day.stops[i + 1] });
        }

        const legs = [];
        let cumKm = 0;
        let cumMins = 0;

        for (const pair of pairs) {
          if (pair.to.manual_km !== null && pair.to.manual_km >= 0) {
            const manualVal = parseFloat(pair.to.manual_km);
            const estTime = Math.round(manualVal * 1.5);
            legs.push({
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
            legs.push({
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
            legs.push({
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

        const updated = days.map((d, idx) => {
          if (idx === dayIndex) {
            return {
              ...d,
              legs,
              actual_km: Math.round(cumKm * 100) / 100,
              duration_min: Math.round(cumMins * 10) / 10,
            };
          }
          return d;
        });
        set({ days: updated, isCalculating: false });
        get().persistState();
      } catch (err) {
        set({ isCalculating: false });
      }
    },

    calculateAllDaysDistances: async () => {
      const { days } = get();
      for (let i = 0; i < days.length; i++) {
        await get().calculateDayDistances(i);
      }
    },

    getTourTotals: (activeVehicleTariff) => {
      const { days } = get();

      const calculatedDays = days.map((day) => {
        const tariff = {
          day_rent: day.customTariff?.day_rent ?? activeVehicleTariff?.day_rent ?? 0,
          fuel_cost_per_km: day.customTariff?.fuel_cost_per_km ?? activeVehicleTariff?.fuel_cost_per_km ?? 0,
          included_km: day.customTariff?.included_km ?? activeVehicleTariff?.included_km ?? 250,
          km_rate: day.customTariff?.km_rate ?? activeVehicleTariff?.km_rate ?? 0,
          driver_bata: day.customTariff?.driver_bata ?? activeVehicleTariff?.driver_bata ?? 0,
        };

        const calc = calculateDailyRental({
          actual_km: day.actual_km,
          ...tariff,
          pricing_method: day.pricing_method,
        });

        return {
          ...day,
          tariff,
          ...calc,
        };
      });

      const totalKm = calculatedDays.reduce((sum, d) => sum + d.actual_km, 0);
      const totalCost = calculatedDays.reduce((sum, d) => sum + d.total_cost, 0);

      return {
        days: calculatedDays,
        total_tour_km: Math.round(totalKm * 100) / 100,
        total_tour_cost: Math.round(totalCost * 100) / 100,
        days_count: calculatedDays.length,
      };
    },

    persistState: () => {
      const { tourName, days } = get();
      localStorage.setItem('rtt_multiday_active', JSON.stringify({ tourName, days }));
    }
  };
});
