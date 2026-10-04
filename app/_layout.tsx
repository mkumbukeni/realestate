
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import "react-native-reanimated";

import "../global.css";

import { AuthProvider } from "@/app/components/auth/AuthContext";
import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/app/components/theme/ThemeContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

/**
 * Global theme toggle button.
 */
function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
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
        dark:border-neutral-300
        dark:bg-white
      "
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={22}
        color={isDark ? "#facc15" : "#171717"}
      />
    </Pressable>
  );
}


/**
 * Main application content.
 */
function RootContent() {
  const { isDark } = useTheme();

  return (
    <ThemeProvider
      value={
        isDark
          ? DarkTheme
          : DefaultTheme
      }
    >
      <View className="flex-1 bg-white dark:bg-[#0d0d0d]">
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        <ThemeToggleButton />

        <StatusBar
          style={isDark ? "light" : "dark"}
        />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}

