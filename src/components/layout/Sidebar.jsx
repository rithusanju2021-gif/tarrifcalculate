import React from 'react';
import { Navigation, CalendarDays, Car, BookmarkCheck, Database, MapPin, Sparkles } from 'lucide-react';
import { useSavedTripsStore } from '../../store/useSavedTripsStore';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { oneDayTrips, multiDayTours } = useSavedTripsStore();
  const totalSaved = oneDayTrips.length + multiDayTours.length;

  const navItems = [
    {
      id: 'oneday',
      label: 'One-Day Trip',
      sublabel: 'Sightseeing & Day Rentals',
      icon: Navigation,
      badge: null,
    },
    {
      id: 'multiday',
      label: 'Multi-Day Tour',
      sublabel: 'South India Tour Packages',
      icon: CalendarDays,
      badge: 'Popular',
    },
    {
      id: 'vehicles',
      label: 'Vehicle Tariffs',
      sublabel: 'Rent, Fuel & Bata Rates',
      icon: Car,
      badge: null,
    },
    {
      id: 'saved',
      label: 'Saved Itineraries',
      sublabel: 'Quotations & PDF Reports',
      icon: BookmarkCheck,
      badge: totalSaved > 0 ? totalSaved : null,
    },
    {
      id: 'settings',
      label: 'Backup & Database',
      sublabel: 'JSON Import/Export & Reset',
      icon: Database,
      badge: null,
    },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '20px 14px',
    }} className="desktop-sidebar">
      <div style={{
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        fontWeight: '700',
        padding: '0 12px 12px',
      }}>
        Calculator Modules
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                textAlign: 'left',
                width: '100%',
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--text-heading)' : 'var(--text-primary)',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item.sublabel}
                </div>
              </div>
              {item.badge && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--accent-gold)' : 'var(--bg-surface-hover)',
                  color: isActive ? '#000' : 'var(--text-muted)',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* South India Region Badge */}
      <div style={{
        marginTop: 'auto',
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <MapPin size={16} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-gold)' }}>
            South India Specialist
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Tamil Nadu • Kerala • Karnataka • Andhra • Telangana • Puducherry
        </div>
      </div>
    </aside>
  );
}
