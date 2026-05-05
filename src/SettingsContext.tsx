import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ColorTheme {
  primary: string;
  primaryLight: string;
  primaryPale: string;
  navy: string;
  navyMid: string;
  navySoft: string;
  accent: string;
}

const DEFAULT_THEME: ColorTheme = {
  primary:     '#2563eb',
  primaryLight:'#3b82f6',
  primaryPale: '#eff6ff',
  navy:        '#0f172a',
  navyMid:     '#1e293b',
  navySoft:    '#334155',
  accent:      '#0ea5e9',
};

interface Settings {
  lastFolderPath: string;
  theme: ColorTheme;
}

interface SettingsCtx {
  settings: Settings;
  setLastFolderPath: (path: string) => void;
  setTheme: (theme: ColorTheme) => void;
  resetTheme: () => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

const STORAGE_KEY = 'scpc_settings';

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        lastFolderPath: parsed.lastFolderPath ?? '',
        theme: { ...DEFAULT_THEME, ...(parsed.theme ?? {}) },
      };
    }
  } catch {/* ignore */}
  return { lastFolderPath: '', theme: { ...DEFAULT_THEME } };
}

function applyTheme(theme: ColorTheme) {
  const root = document.documentElement;
  root.style.setProperty('--blue',       theme.primary);
  root.style.setProperty('--blue-light', theme.primaryLight);
  root.style.setProperty('--blue-pale',  theme.primaryPale);
  root.style.setProperty('--navy',       theme.navy);
  root.style.setProperty('--navy-mid',   theme.navyMid);
  root.style.setProperty('--navy-soft',  theme.navySoft);
  root.style.setProperty('--teal',       theme.accent);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    applyTheme(settings.theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function setLastFolderPath(path: string) {
    setSettings(s => ({ ...s, lastFolderPath: path }));
  }

  function setTheme(theme: ColorTheme) {
    setSettings(s => ({ ...s, theme }));
  }

  function resetTheme() {
    setSettings(s => ({ ...s, theme: { ...DEFAULT_THEME } }));
  }

  return (
    <Ctx.Provider value={{ settings, setLastFolderPath, setTheme, resetTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export { DEFAULT_THEME };
