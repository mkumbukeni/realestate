
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
  isLoggedIn,
}: {
  onPress: () => void;
  isLoggedIn: boolean;
}) {
  const { isDark } =
    useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isLoggedIn
          ? "Open account menu"
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
            ? "person-circle-outline"
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
  isLoggedIn,
}: {
  onMenuPress: () => void;
  onAuthPress: () => void;
  isLoggedIn: boolean;
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
          isLoggedIn={isLoggedIn}
        />
      </View>
    </View>
  );
}

/* ============================================================
   ACCOUNT DROPDOWN
   ============================================================ */

function AccountDropdown({
  visible,
  onProfile,
  onLogout,
  onClose,
}: {
  visible: boolean;
  onProfile: () => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  const { isDark } =
    useTheme();

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Invisible area to close the dropdown when
          the user taps somewhere else */}
      <Pressable
        onPress={onClose}
        className="absolute inset-0 z-40"
      />

      <View
        className={`
          absolute
          right-5
          top-[88px]
          z-[60]
          w-[190px]
          overflow-hidden
          rounded-xl
          border
          shadow-xl
          ${
            isDark
              ? "border-[#292929] bg-[#171717]"
              : "border-gray-200 bg-white"
          }
        `}
      >
        {/* ==================================================
            PROFILE
            ================================================== */}

        <Pressable
          onPress={onProfile}
          className={`
            flex-row
            items-center
            px-4
            py-4
            ${
              isDark
                ? "active:bg-[#242424]"
                : "active:bg-gray-100"
            }
          `}
        >
          <View
            className={`
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-[#292929]"
                  : "bg-gray-100"
              }
            `}
          >
            <Ionicons
              name="person-outline"
              size={19}
              color="#ef4444"
            />
          </View>

          <Text
            className={`
              ml-3
              text-sm
              font-semibold
              ${
                isDark
                  ? "text-white"
                  : "text-gray-900"
              }
            `}
          >
            Profile
          </Text>
        </Pressable>

        {/* ==================================================
            DIVIDER
            ================================================== */}

        <View
          className={
            isDark
              ? "h-px bg-[#292929]"
              : "h-px bg-gray-200"
          }
        />

        {/* ==================================================
            LOGOUT
            ================================================== */}

        <Pressable
          onPress={onLogout}
          className={`
            flex-row
            items-center
            px-4
            py-4
            ${
              isDark
                ? "active:bg-[#242424]"
                : "active:bg-gray-100"
            }
          `}
        >
          <View
            className={`
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-red-950/40"
                  : "bg-red-50"
              }
            `}
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#ef4444"
            />
          </View>

          <Text className="ml-3 text-sm font-semibold text-red-500">
            Logout
          </Text>
        </Pressable>
      </View>
    </>
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

  const [
    accountMenuVisible,
    setAccountMenuVisible,
  ] = useState(false);

  /* ==========================================================
     AUTH BUTTON

     LOGGED OUT:
     Open LoginModal directly.

     LOGGED IN:
     Open account dropdown.
     ========================================================== */

  const handleAuthPress =
    () => {
      if (isLoggedIn) {
        setAccountMenuVisible(
          (visible) => !visible,
        );
        return;
      }

      // IMPORTANT:
      // Do NOT open SideMenu here.
      setLoginVisible(true);
    };

  /* ==========================================================
     PROFILE

     Close dropdown and navigate to profile.
     ========================================================== */

  const handleProfile =
    () => {
      setAccountMenuVisible(
        false,
      );

      router.push("/others/profile/profile");
    };

  /* ==========================================================
     LOGOUT

     After logout:
     1. Close account dropdown
     2. Close side menu
     3. Close login modal if necessary
     4. Navigate to Home
     ========================================================== */

  const handleLogout =
    async () => {
      try {
        setAccountMenuVisible(
          false,
        );

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

        setAccountMenuVisible(
          false,
        );

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
          onMenuPress={() => {
            setAccountMenuVisible(
              false,
            );

            setMenuVisible(true);
          }}
          onAuthPress={
            handleAuthPress
          }
          isLoggedIn={isLoggedIn}
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
            ACCOUNT DROPDOWN

            Only available when logged in.
            ==================================================== */}

        <AccountDropdown
          visible={
            isLoggedIn &&
            accountMenuVisible
          }
          onProfile={
            handleProfile
          }
          onLogout={
            handleLogout
          }
          onClose={() =>
            setAccountMenuVisible(
              false,
            )
          }
        />

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

