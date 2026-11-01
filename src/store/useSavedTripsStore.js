import { create } from 'zustand';
import apiClient from '../api/client';

function loadLocalSavedTrips() {
  try {
    const raw1 = localStorage.getItem('rtt_saved_oneday');
    const raw2 = localStorage.getItem('rtt_saved_multiday');
    return {
      oneDayTrips: raw1 ? JSON.parse(raw1) : [],
      multiDayTours: raw2 ? JSON.parse(raw2) : [],
    };
  } catch (e) {
    return { oneDayTrips: [], multiDayTours: [] };
  }
}

export const useSavedTripsStore = create((set, get) => {
  const local = loadLocalSavedTrips();

  return {
    oneDayTrips: local.oneDayTrips,
    multiDayTours: local.multiDayTours,
    isLoading: false,

    fetchSavedTrips: async () => {
      set({ isLoading: true });
      try {
        const [res1, res2] = await Promise.allSettled([
          apiClient.get('/trips/oneday/'),
          apiClient.get('/trips/multiday/'),
        ]);

        if (res1.status === 'fulfilled' && Array.isArray(res1.value.data)) {
          set({ oneDayTrips: res1.value.data });
          localStorage.setItem('rtt_saved_oneday', JSON.stringify(res1.value.data));
        }

        if (res2.status === 'fulfilled' && Array.isArray(res2.value.data)) {
          set({ multiDayTours: res2.value.data });
          localStorage.setItem('rtt_saved_multiday', JSON.stringify(res2.value.data));
        }
      } catch (e) {
        console.warn('Backend unavailable, using local saved trips');
      } finally {
        set({ isLoading: false });
      }
    },

    saveOneDayTrip: async (tripData) => {
      const { oneDayTrips } = get();
      const localId = Date.now();
      const newTrip = {
        id: localId,
        created_at: new Date().toISOString(),
        ...tripData,
      };

      const updated = [newTrip, ...oneDayTrips];
      set({ oneDayTrips: updated });
      localStorage.setItem('rtt_saved_oneday', JSON.stringify(updated));

      try {
        const res = await apiClient.post('/trips/oneday/', tripData);
        if (res.data && res.data.id) {
          const synced = updated.map((t) => (t.id === localId ? res.data : t));
          set({ oneDayTrips: synced });
          localStorage.setItem('rtt_saved_oneday', JSON.stringify(synced));
        }
      } catch (e) {}

      return true;
    },

    saveMultiDayTour: async (tourData) => {
      const { multiDayTours } = get();
      const localId = Date.now();
      const newTour = {
        id: localId,
        created_at: new Date().toISOString(),
        ...tourData,
      };

      const updated = [newTour, ...multiDayTours];
      set({ multiDayTours: updated });
      localStorage.setItem('rtt_saved_multiday', JSON.stringify(updated));

      try {
        const res = await apiClient.post('/trips/multiday/', tourData);
        if (res.data && res.data.id) {
          const synced = updated.map((t) => (t.id === localId ? res.data : t));
          set({ multiDayTours: synced });
          localStorage.setItem('rtt_saved_multiday', JSON.stringify(synced));
        }
      } catch (e) {}

      return true;
    },

    deleteOneDayTrip: async (id) => {
      const { oneDayTrips } = get();
      const updated = oneDayTrips.filter((t) => t.id !== id);
      set({ oneDayTrips: updated });
      localStorage.setItem('rtt_saved_oneday', JSON.stringify(updated));
      try {
        await apiClient.delete(`/trips/oneday/${id}/`);
      } catch (e) {}
    },

    deleteMultiDayTour: async (id) => {
      const { multiDayTours } = get();
      const updated = multiDayTours.filter((t) => t.id !== id);
      set({ multiDayTours: updated });
      localStorage.setItem('rtt_saved_multiday', JSON.stringify(updated));
      try {
        await apiClient.delete(`/trips/multiday/${id}/`);
      } catch (e) {}
    },

    clearAllData: async () => {
      set({ oneDayTrips: [], multiDayTours: [] });
      localStorage.removeItem('rtt_saved_oneday');
      localStorage.removeItem('rtt_saved_multiday');
      localStorage.removeItem('rtt_oneday_active');
      localStorage.removeItem('rtt_multiday_active');

      try {
        await apiClient.post('/exports/clear-all/', { confirm: 'CONFIRM_CLEAR_ALL' });
      } catch (e) {}
    }
  };
});
