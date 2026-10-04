import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import "react-native-reanimated";

import "../global.css";

import { AuthProvider } from "@/app/components/auth/AuthContext";
import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/app/components/theme/ThemeContext";

import SideMenu from "@/app/components/sidebar/SideMenu";

export const unstable_settings = {
  anchor: "(tabs)",
};

/* ============================================================
   GLOBAL THEME TOGGLE BUTTON
   ============================================================ */

function ThemeToggleButton() {
  const {
    isDark,
    toggleTheme,
  } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="
        absolute
        left-[66.66%]
        top-14
        z-50
        h-11
        w-11
        -translate-x-1/2
        items-center
        justify-center
        rounded-full
        border
        border-neutral-700
        bg-neutral-900
        shadow-lg
        dark:border-neutral-300
        dark:bg-white
      "
    >
      <Ionicons
        name={
          isDark
            ? "sunny"
            : "moon"
        }
        size={22}
        color={
          isDark
            ? "#facc15"
            : "#171717"
        }
      />
    </Pressable>
  );
}

/* ============================================================
   GLOBAL MENU BUTTON
   ============================================================ */

function GlobalMenuButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      className="
        absolute
        right-5
        top-14
        z-50
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-neutral-200
        bg-white
        shadow-lg
        dark:border-[#292929]
        dark:bg-[#171717]
      "
    >
      <Ionicons
        name="menu-outline"
        size={28}
        color={isDark ? "#ffffff" : "#171717"}
      />
    </Pressable>
  );
}

/* ============================================================
   ROOT CONTENT
   ============================================================ */

function RootContent() {
  const {
    isDark,
    theme,
  } = useTheme();

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  return (
    <ThemeProvider
      value={
        isDark
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background:
                  theme.background,
                card:
                  theme.card,
                text:
                  theme.text,
                border:
                  theme.border,
                primary:
                  theme.accent,
              },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background:
                  theme.background,
                card:
                  theme.card,
                text:
                  theme.text,
                border:
                  theme.border,
                primary:
                  theme.accent,
              },
            }
      }
    >
      <View className="flex-1 bg-white dark:bg-[#0d0d0d]">

        {/* ====================================================
            ALL APP SCREENS
            ==================================================== */}

        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        {/* ====================================================
            GLOBAL THEME TOGGLE
            ==================================================== */}

        <ThemeToggleButton />

        {/* ====================================================
            GLOBAL MENU BUTTON
            ==================================================== */}

        <GlobalMenuButton
          onPress={() =>
            setMenuVisible(true)
          }
        />

        {/* ====================================================
            GLOBAL SIDE MENU
            ==================================================== */}

        <SideMenu
          visible={menuVisible}
          onClose={() =>
            setMenuVisible(false)
          }
        />

        {/* ====================================================
            STATUS BAR
            ==================================================== */}

        <StatusBar
          style={
            isDark
              ? "light"
              : "dark"
          }
        />
      </View>
    </ThemeProvider>
  );
}

/* ============================================================
   ROOT LAYOUT
   ============================================================ */

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}