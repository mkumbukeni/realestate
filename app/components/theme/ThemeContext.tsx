
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

export interface AppTheme {
  background: string;
  card: string;
  surface: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;

  inputBackground: string;
  placeholder: string;

  icon: string;

  accent: string;
  accentDark: string;

  success: string;
  warning: string;
  error: string;

  overlay: string;
}

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const darkTheme: AppTheme = {
  background: "#0d0d0d",
  card: "#171717",
  surface: "#1f1f1f",

  text: "#ffffff",
  textSecondary: "#d4d4d4",
  textMuted: "#a3a3a3",

  border: "#2a2a2a",

  inputBackground: "#171717",
  placeholder: "#737373",

  icon: "#ffffff",

  accent: "#dc2626",
  accentDark: "#b91c1c",

  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",

  overlay: "rgba(0, 0, 0, 0.65)",
};

const lightTheme: AppTheme = {
  background: "#ffffff",
  card: "#f5f5f5",
  surface: "#ffffff",

  text: "#111111",
  textSecondary: "#525252",
  textMuted: "#737373",

  border: "#e5e5e5",

  inputBackground: "#f5f5f5",
  placeholder: "#a3a3a3",

  icon: "#171717",

  accent: "#dc2626",
  accentDark: "#b91c1c",

  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",

  overlay: "rgba(0, 0, 0, 0.45)",
};

const ThemeContext = createContext<
  ThemeContextValue | undefined
>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const [mode, setModeState] = useState<ThemeMode>(
    systemColorScheme === "light"
      ? "light"
      : "dark",
  );

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
    },
    [],
  );

  const toggleTheme = useCallback(() => {
    setModeState((currentMode) => {
      if (currentMode === "dark") {
        return "light";
      }

      return "dark";
    });
  }, []);

  const theme = useMemo<AppTheme>(() => {
    if (mode === "dark") {
      return darkTheme;
    }

    return lightTheme;
  }, [mode]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      isDark: mode === "dark",
      setMode,
      toggleTheme,
    }),
    [theme, mode, setMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}

