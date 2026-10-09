import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'dark',
    name: 'Dark (Obsidian)',
    icon: '🌑',
    desc: 'Deep Space Obsidian & Cobalt Blue (Default)',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    id: 'light',
    name: 'Light (Studio Snow)',
    icon: '☀️',
    desc: 'Clean Minimalist White & Sharp Slate',
    badgeBg: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    icon: '🔲',
    desc: 'OLED Pure Black & Vivid Cyan (WCAG AAA)',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    icon: '🔳',
    desc: 'Stark Paper White & Absolute Black',
    badgeBg: 'bg-neutral-500/20 text-neutral-800 border-neutral-500/30',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    icon: '🧛',
    desc: 'Official Gothic Dracula Vampire Palette',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    id: 'cappuccino-light',
    name: 'Cappuccino Light',
    icon: '☕',
    desc: 'Warm Creamy Latte & Espresso Cinnamon',
    badgeBg: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('todo_theme_preference');
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read theme from localStorage', e);
    }
    return 'dark';
  });

  const setTheme = (newTheme) => {
    if (THEMES.some((t) => t.id === newTheme)) {
      setThemeState(newTheme);
      try {
        localStorage.setItem('todo_theme_preference', newTheme);
      } catch (e) {
        console.warn('Could not write theme to localStorage', e);
      }
    }
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme.includes('light')) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const activeThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        themes: THEMES,
        activeThemeMeta,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
