"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(mode: ThemeMode) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("onuora-theme") as ThemeMode | null;
    const nextMode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setModeState(nextMode);
    applyTheme(nextMode);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if ((window.localStorage.getItem("onuora-theme") ?? "system") === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode: (nextMode: ThemeMode) => {
        window.localStorage.setItem("onuora-theme", nextMode);
        setModeState(nextMode);
        applyTheme(nextMode);
      }
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return context;
}
