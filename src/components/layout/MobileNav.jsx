import React from 'react';
import { Navigation, CalendarDays, Car, BookmarkCheck, Database } from 'lucide-react';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';

export default function MobileNav({ activeTab, setActiveTab }) {
  const { oneDayTrips, multiDayTours } = useSavedTripsStore();
  const totalSaved = oneDayTrips.length + multiDayTours.length;

  const items = [
    { id: 'oneday', label: 'One-Day', icon: Navigation },
    { id: 'multiday', label: 'Multi-Day', icon: CalendarDays },
    { id: 'vehicles', label: 'Tariffs', icon: Car },
    { id: 'saved', label: 'Saved', icon: BookmarkCheck, count: totalSaved },
    { id: 'settings', label: 'Backup', icon: Database },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--bottom-nav-height)',
      background: 'rgba(14, 21, 38, 0.98)',
      borderTop: '1px solid var(--border-medium)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      padding: '0 6px',
      backdropFilter: 'blur(16px)',
    }} className="mobile-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              height: '100%',
              color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: 'var(--accent-gold)',
                  color: '#000',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.count}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: isActive ? '700' : '500',
            }}>
              {item.label}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                width: '32px',
                height: '3px',
                background: 'var(--accent-gold)',
                borderRadius: '0 0 3px 3px',
              }}></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
