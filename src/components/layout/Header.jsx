import React from 'react';
import { Car, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

export default function Header({ activeTab, setActiveTab }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-gold)',
          color: '#000',
        }}>
          <Car size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: 'var(--text-heading)' }}>RITHISH</span>
            <span style={{ color: 'var(--accent-gold)' }}>TOURS &amp; TRAVELS</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Internal Itinerary &amp; Tariff Calculator</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
              ₹0/mo Cloud Ready
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={19} color="var(--accent-gold)" />
          ) : (
            <Moon size={19} color="var(--accent-gold)" />
          )}
        </button>

        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface-elevated)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
          }}>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
            <span style={{ color: 'var(--text-secondary)' }}>Staff:</span>
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.first_name || user.username}</span>
          </div>
        )}

        {isAuthenticated ? (
          <button
            onClick={logout}
            title="Log Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <LogOut size={15} />
            <span className="hide-on-mobile">Logout</span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
