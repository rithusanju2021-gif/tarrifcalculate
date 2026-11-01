import axios from 'axios';

// The API base URL points to Django backend (Render deployment or local dev server)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('rtt_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// Direct OSRM Fallback function in case backend is waking up or offline
export async function directOsrmRoadDistance(lat1, lng1, lat2, lng2) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const resp = await axios.get(url, { timeout: 7000 });
    if (resp.data && resp.data.code === 'Ok' && resp.data.routes && resp.data.routes.length > 0) {
      const route = resp.data.routes[0];
      const km = Math.round((route.distance / 1000) * 100) / 100;
      const mins = Math.round((route.duration / 60) * 10) / 10;
      return {
        distance_km: km,
        duration_min: mins,
        source: 'LIVE',
      };
    }
  } catch (err) {
    console.warn('Direct OSRM fallback request failed:', err);
  }
  return null;
}
