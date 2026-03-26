import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  incognito: boolean;
  setIncognito: (value: boolean) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
  incognito: false,
  setIncognito: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "safereport-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const incognitoStorageKey = "safereport-incognito";
  const [incognito, setIncognitoState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(incognitoStorageKey) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (incognito) {
      root.classList.add("incognito");
      try {
        localStorage.setItem(incognitoStorageKey, "true");
      } catch {}
      document.title = "Local Weather";
    } else {
      root.classList.remove("incognito");
      try {
        localStorage.removeItem(incognitoStorageKey);
      } catch {}
      document.title = "SafeReport";
    }
  }, [incognito]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    incognito,
    setIncognito: (value: boolean) => {
      try {
        localStorage.setItem(incognitoStorageKey, value ? "true" : "false");
      } catch {}
      setIncognitoState(value);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
