import React, { useState } from 'react';
import { Car, Lock, User, ShieldCheck, ArrowRight, Loader2, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: theme === 'dark'
        ? 'radial-gradient(circle at 50% 20%, #152038 0%, #070a12 80%)'
        : 'radial-gradient(circle at 50% 20%, #e2e8f0 0%, #f8fafc 80%)',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '32px 28px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
      }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          style={{ position: 'absolute', top: '16px', right: '16px', width: '34px', height: '34px' }}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: 'var(--shadow-gold)',
          }}>
            <Car size={30} strokeWidth={2.4} />
          </div>

          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-heading)',
            letterSpacing: '-0.02em',
          }}>
            RITHISH TOURS &amp; TRAVELS
          </h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: '600', marginTop: '2px' }}>
            Internal Itinerary &amp; Vehicle Tariff System
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Private Staff Access Only
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--accent-rose-subtle)',
            color: 'var(--accent-rose)',
            border: '1px solid var(--accent-rose-subtle)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '0.82rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="label-text">Staff Username</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                required
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '38px' }}
                placeholder="Staff username"
              />
            </div>
          </div>

          <div>
            <label className="label-text">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {isLoading ? (
              <Loader2 size={18} className="pulse-indicator" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <ArrowRight size={18} />
            )}
            <span>Staff Login</span>
          </button>
        </form>



        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
        }}>
          Protected private staff workspace.<br />
          Website: <span style={{ color: 'var(--text-secondary)' }}>rithishtoursandtravels.in</span>
        </div>
      </div>
    </div>
  );
}
