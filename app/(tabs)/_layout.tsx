import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        

        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#8a8a8a',

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 4,
          marginVertical: 6,
        },

        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#242424',
          borderTopWidth: 1,

          height: 70 + insets.bottom,

          paddingTop: 5,
          paddingBottom: 8 + insets.bottom,

          elevation: 0,
        },
      }}
    >
      {/* ==========================================
          PROPERTIES TAB
      ========================================== */}

      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'home'
                  : 'home-outline'
              }
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="properties"
        options={{
          title: 'Properties',

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'business'
                  : 'business-outline'
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
          title: 'Agents',

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'people'
                  : 'people-outline'
              }
              size={23}
              color={color}
            />
          ),
        }}
      />


      {/* ==========================================
          PROFILE TAB
      ========================================== */}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'person-circle'
                  : 'person-circle-outline'
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
          title: 'Others',

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? 'ellipsis-horizontal'
                  : 'ellipsis-horizontal-outline'
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