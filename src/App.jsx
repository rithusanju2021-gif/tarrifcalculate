import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import OneDayCalculator from './components/oneday/OneDayCalculator';
import MultiDayCalculator from './components/multiday/MultiDayCalculator';
import VehicleManager from './components/vehicles/VehicleManager';
import SavedTripsView from './components/saved/SavedTripsView';
import DataSettings from './components/settings/DataSettings';
import LoginPage from './components/auth/LoginPage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { useAuthStore } from './store/useAuthStore';
import { useVehicleStore } from './store/useVehicleStore';
import { useSavedTripsStore } from './store/useSavedTripsStore';

export default function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchVehicles } = useVehicleStore();
  const { fetchSavedTrips } = useSavedTripsStore();

  const [activeTab, setActiveTab] = useState('oneday');

  useEffect(() => {
    checkAuth();
    fetchVehicles();
    fetchSavedTrips();
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="main-content">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {activeTab === 'oneday' && (
            <ErrorBoundary key="oneday">
              <OneDayCalculator />
            </ErrorBoundary>
          )}
          {activeTab === 'multiday' && (
            <ErrorBoundary key="multiday">
              <MultiDayCalculator />
            </ErrorBoundary>
          )}
          {activeTab === 'vehicles' && (
            <ErrorBoundary key="vehicles">
              <VehicleManager />
            </ErrorBoundary>
          )}
          {activeTab === 'saved' && (
            <ErrorBoundary key="saved">
              <SavedTripsView setActiveTab={setActiveTab} />
            </ErrorBoundary>
          )}
          {activeTab === 'settings' && (
            <ErrorBoundary key="settings">
              <DataSettings />
            </ErrorBoundary>
          )}
        </main>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
