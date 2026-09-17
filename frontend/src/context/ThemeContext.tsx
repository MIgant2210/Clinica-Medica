import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const userSet = localStorage.getItem('clinica_theme_user_set');
      const saved = localStorage.getItem('clinica_theme');
      if (userSet === 'true' && (saved === 'dark' || saved === 'light')) {
        return saved;
      }
    } catch (e) {}
    // Por defecto modo claro clínico solicitado por el usuario
    return 'light';
  });

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const isDark = newTheme === 'dark';
    if (isDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem('clinica_theme', next);
        localStorage.setItem('clinica_theme_user_set', 'true');
      } catch (e) {}
      return next;
    });
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
    try {
      localStorage.setItem('clinica_theme', newTheme);
      localStorage.setItem('clinica_theme_user_set', 'true');
    } catch (e) {}
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
};
