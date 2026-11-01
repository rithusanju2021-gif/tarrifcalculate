import { create } from 'zustand';

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('rtt_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {}
  return 'dark';
}

const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', initialTheme);
}

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
    localStorage.setItem('rtt_theme', nextTheme);
    set({ theme: nextTheme });
  },

  setTheme: (newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light') return;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    localStorage.setItem('rtt_theme', newTheme);
    set({ theme: newTheme });
  }
}));
