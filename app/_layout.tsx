import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  Stack,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import "react-native-reanimated";

import "../global.css";

import {
  AuthProvider,
  useAuth,
} from "@/app/components/auth/AuthContext";

import LoginModal from "@/app/components/auth/LoginModal";

import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/app/components/theme/ThemeContext";

import SideMenu from "@/app/components/sidebar/SideMenu";

/* ============================================================
   THEME TOGGLE BUTTON
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
        h-8
        w-8
        items-center
        justify-center
        bg-transparent
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
            ? "white"
            : "black"
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
  const { isDark } =
    useTheme();

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
        color={
          isDark
            ? "white"
            : "black"
        }
      />
    </Pressable>
  );
}

/* ============================================================
   GLOBAL AUTH BUTTON
   ============================================================ */

function GlobalAuthButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { isDark } =
    useTheme();

  const {
    isLoggedIn,
  } = useAuth();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isLoggedIn
          ? "Logout"
          : "Login"
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
        color={
          isDark
            ? "white"
            : "black"
        }
      />
    </Pressable>
  );
}

/* ============================================================
   GLOBAL HEADER
   ============================================================ */

function GlobalHeader({
  onMenuPress,
  onAuthPress,
}: {
  onMenuPress: () => void;
  onAuthPress: () => void;
}) {
  const { isDark } =
    useTheme();

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
      {/* ======================================================
          LEFT - MENU
          ====================================================== */}

      <View className="w-[20%] items-start justify-center">
        <GlobalMenuButton
          onPress={onMenuPress}
        />
      </View>

      {/* ======================================================
          CENTER - TITLE
          ====================================================== */}

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

      {/* ======================================================
          RIGHT - THEME + AUTH
          ====================================================== */}

      <View className="w-[25%] flex-row items-center justify-end gap-4">
        <ThemeToggleButton />

        <GlobalAuthButton
          onPress={onAuthPress}
        />
      </View>
    </View>
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

  const {
    isLoggedIn,
    logout,
  } = useAuth();

  const router =
    useRouter();

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const [
    loginVisible,
    setLoginVisible,
  ] = useState(false);

  /* ==========================================================
     AUTH BUTTON

     LOGGED OUT:
     Open LoginModal directly.

     LOGGED IN:
     Logout and return to Home.
     ========================================================== */

  const handleAuthPress =
    () => {
      if (isLoggedIn) {
        void handleLogout();
        return;
      }

      // IMPORTANT:
      // Do NOT open SideMenu here.
      setLoginVisible(true);
    };

  /* ==========================================================
     LOGOUT

     After logout:
     1. Close side menu
     2. Close login modal if necessary
     3. Navigate to Home
     ========================================================== */

  const handleLogout =
    async () => {
      try {
        setMenuVisible(false);
        setLoginVisible(false);

        await logout();

        /*
         * Replace the current screen with Home.
         *
         * Using replace prevents the user from pressing
         * Back and returning to the protected screen they
         * were viewing before logout.
         */
        router.replace(
          "/(tabs)/home",
        );
      } catch (error) {
        console.error(
          "Logout failed:",
          error,
        );

        /*
         * Even if something goes wrong during navigation,
         * make sure the menu is closed.
         */
        setMenuVisible(false);
      }
    };

  /* ==========================================================
     LOGIN SUCCESS
     ========================================================== */

  const handleLoginSuccess =
    (
      _email: string,
      _response: Record<
        string,
        unknown
      >,
    ) => {
      /*
       * AuthContext has already updated isLoggedIn.
       */
      setLoginVisible(false);

      /*
       * Keep the user on the current screen after login.
       * The authentication state will update automatically.
       */
    };

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
      {/* ======================================================
          ROOT CONTAINER
          ====================================================== */}

      <View
        className={`flex-1 ${
          isDark
            ? "bg-[#0d0d0d]"
            : "bg-white"
        }`}
      >
        {/* ====================================================
            GLOBAL HEADER
            ==================================================== */}

        <GlobalHeader
          onMenuPress={() =>
            setMenuVisible(true)
          }
          onAuthPress={
            handleAuthPress
          }
        />

        {/* ====================================================
            APP SCREENS
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
            SIDE MENU

            ONLY the menu button opens this.
            Login/logout does NOT open it.
            ==================================================== */}

        <SideMenu
          visible={menuVisible}
          onClose={() =>
            setMenuVisible(false)
          }
        />

        {/* ====================================================
            LOGIN MODAL

            This is opened directly by the person icon when
            the user is logged out.
            ==================================================== */}

        <LoginModal
          visible={loginVisible}
          onClose={() =>
            setLoginVisible(false)
          }
          onLogin={
            handleLoginSuccess
          }
          onRegister={() => {
            /*
             * If your LoginModal already handles the
             * Register button internally, this can remain
             * as the callback supplied to it.
             */
            setLoginVisible(false);
          }}
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