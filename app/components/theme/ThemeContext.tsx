import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Appearance,
  useColorScheme,
} from "react-native";

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
  /*
   * React Native's system color scheme.
   *
   * This is only used to determine the initial theme.
   * After that, the custom theme toggle controls the theme.
   */
  const systemColorScheme = useColorScheme();

  const [mode, setModeState] = useState<ThemeMode>(
    systemColorScheme === "light"
      ? "light"
      : "dark",
  );

  /*
   * ============================================================
   * SYNCHRONIZE CUSTOM THEME WITH REACT NATIVE APPEARANCE
   * ============================================================
   *
   * Screens such as PropertyCard and HomeScreen use
   * React Native's useColorScheme().
   *
   * Our custom ThemeContext has its own "mode" state.
   *
   * Without this synchronization:
   *
   *     toggleTheme()
   *          ↓
   *     ThemeContext changes
   *          ↓
   *     useColorScheme() does NOT necessarily change
   *
   * By setting the React Native appearance here, both systems
   * stay synchronized.
   */
  useEffect(() => {
    Appearance.setColorScheme(
      mode === "dark"
        ? "dark"
        : "light",
    );
  }, [mode]);

  /*
   * ============================================================
   * SET THEME MODE
   * ============================================================
   */

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
    },
    [],
  );

  /*
   * ============================================================
   * TOGGLE THEME
   * ============================================================
   */

  const toggleTheme = useCallback(() => {
    setModeState((currentMode) => {
      if (currentMode === "dark") {
        return "light";
      }

      return "dark";
    });
  }, []);

  /*
   * ============================================================
   * ACTIVE THEME
   * ============================================================
   */

  const theme = useMemo<AppTheme>(() => {
    if (mode === "dark") {
      return darkTheme;
    }

    return lightTheme;
  }, [mode]);

  /*
   * ============================================================
   * CONTEXT VALUE
   * ============================================================
   */

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      isDark: mode === "dark",
      setMode,
      toggleTheme,
    }),
    [
      theme,
      mode,
      setMode,
      toggleTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/*
 * ============================================================
 * USE THEME
 * ============================================================
 */

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}