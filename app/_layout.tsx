import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import "react-native-reanimated";

import "../global.css";

import {
  AuthProvider,
  useAuth,
} from "@/app/components/auth/AuthContext";

import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/app/components/theme/ThemeContext";

import SideMenu from "@/app/components/sidebar/SideMenu";

function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      className="
        h-8
        w-8
        items-center
        justify-center
        bg-transparent
      "
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={22}
        color={isDark ? "white" : "black"}
      />
    </Pressable>
  );
}

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
        h-11
        w-11
        items-center
        justify-center
        bg-transparent
      "
    >
      <Ionicons
        name="menu-outline"
        size={24}
        color={isDark ? "white" : "black"}
      />
    </Pressable>
  );
}

function GlobalAuthButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isLoggedIn ? "Logout" : "Login"
      }
      className={`
        h-8
        w-8
        items-center
        justify-center
        shadow-lg
        ${
          isDark
            ? "border-[#292929] bg-[#171717]"
            : "border-gray-200 bg-white"
        }
      `}
    >
      <Ionicons
        name={
          isLoggedIn
            ? "log-out-outline"
            : "person-outline"
        }
        size={26}
        color={isDark ? "white" : "black"}
      />
    </Pressable>
  );
}

function GlobalHeader({
  onMenuPress,
  onAuthPress,
}: {
  onMenuPress: () => void;
  onAuthPress: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <View
      className={`
        absolute
        left-0
        right-0
        top-0
        z-50
        h-[110px]
        flex-row
        items-center
        border-b
        px-5
        pt-[38px]
        ${
          isDark
            ? "border-[#222] bg-[#0d0d0d]"
            : "border-gray-200 bg-white"
        }
      `}
    >
      {/* ========================================================
          LEFT - MENU
          ======================================================== */}

      <View className="w-[20%] items-start justify-center">
        <GlobalMenuButton
          onPress={onMenuPress}
        />
      </View>

      {/* ========================================================
          CENTER - TITLE
          ======================================================== */}

      <View className="flex-1 items-center justify-center">
        <Text
          numberOfLines={1}
          className="
            text-center
            text-2xl
            font-bold
            text-red-500
          "
        >
          Real Estate Africa
        </Text>
      </View>

      {/* ========================================================
          RIGHT - THEME + AUTH
          ======================================================== */}

      <View className="w-[25%] flex-row items-center justify-end gap-4">
        <ThemeToggleButton />

        <GlobalAuthButton
          onPress={onAuthPress}
        />
      </View>
    </View>
  );
}

function RootContent() {
  const { isDark, theme } = useTheme();
  const { isLoggedIn, logout } = useAuth();

  const [menuVisible, setMenuVisible] =
    useState(false);

  const handleAuthPress = () => {
    if (isLoggedIn) {
      void logout();
      return;
    }

    setMenuVisible(true);
  };

  return (
    <ThemeProvider
      value={
        isDark
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background: theme.background,
                card: theme.card,
                text: theme.text,
                border: theme.border,
                primary: theme.accent,
              },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: theme.background,
                card: theme.card,
                text: theme.text,
                border: theme.border,
                primary: theme.accent,
              },
            }
      }
    >
      {/* ========================================================
          ROOT CONTAINER
          ======================================================== */}

      <View
        className={`flex-1 ${
          isDark
            ? "bg-[#0d0d0d]"
            : "bg-white"
        }`}
      >
        {/* ======================================================
            GLOBAL HEADER
            ====================================================== */}

        <GlobalHeader
          onMenuPress={() =>
            setMenuVisible(true)
          }
          onAuthPress={handleAuthPress}
        />

        {/* ======================================================
            APP SCREENS
            ====================================================== */}

        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        {/* ======================================================
            SIDE MENU
            ====================================================== */}

        <SideMenu
          visible={menuVisible}
          onClose={() =>
            setMenuVisible(false)
          }
        />

        {/* ======================================================
            STATUS BAR
            ====================================================== */}

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

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}