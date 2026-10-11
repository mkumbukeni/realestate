
import React from "react";
import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/app/components/theme/ThemeContext";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

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

        tabBarStyle: {
          backgroundColor: isDark ? "#171717" : "#ffffff",
          borderTopColor: isDark ? "#2a2a2a" : "#e5e5e5",
          borderTopWidth: 1,
          height: 70 + insets.bottom,
          paddingTop: 5,
          paddingBottom: 8 + insets.bottom,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "business" : "business-outline"}
              size={size}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.replace("/(tabs)/properties");
          },
        }}
      />

      <Tabs.Screen
        name="agents"
        options={{
          title: "Agents",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.replace("/(tabs)/agents");
          },
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "card" : "card-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="others"
        options={{
          title: "Others",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "ellipsis-horizontal-circle"
                  : "ellipsis-horizontal-circle-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
