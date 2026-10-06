import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/app/components/theme/ThemeContext";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ==========================================
        // TAB TEXT + ICON COLORS
        // ==========================================
        //
        // Active:
        // Red in both dark and light modes
        //
        // Inactive:
        // White in dark mode
        // Black in light mode
        //
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: isDark ? "#ffffff" : "#111111",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },

        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 4,
          marginVertical: 6,
        },

        // ==========================================
        // TAB BAR
        // ==========================================
        tabBarStyle: {
          backgroundColor: isDark ? "#171717" : "#ffffff",

          borderTopColor: isDark
            ? "#2a2a2a"
            : "#e5e5e5",

          borderTopWidth: 1,

          height: 70 + insets.bottom,

          paddingTop: 5,
          paddingBottom: 8 + insets.bottom,

          elevation: 0,
        },
      }}
    >
      {/* ==========================================
          HOME TAB
      ========================================== */}

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* ==========================================
          PROPERTIES TAB
      ========================================== */}

      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "business"
                  : "business-outline"
              }
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* ==========================================
          AGENTS TAB
      ========================================== */}

      <Tabs.Screen
        name="agents"
        options={{
          title: "Agents",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "people"
                  : "people-outline"
              }
              size={23}
              color={color}
            />
          ),
        }}
      />

      {/* ==========================================
          PAYMENTS TAB
      ========================================== */}

      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "card"
                  : "card-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* ==========================================
          OTHERS TAB
      ========================================== */}

      <Tabs.Screen
        name="others"
        options={{
          title: "Others",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "ellipsis-horizontal"
                  : "ellipsis-horizontal-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}